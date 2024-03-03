import { getProfile } from "@/app/bungie/BungieApi.ts";
import { ProfileData, getProfileSchema } from "@/app/bungie/Types.ts";
import type { CharactersAndVault, DestinyItem } from "@/app/bungie/Types.ts";
import { parse, array, number, safeParse } from "valibot";
import { characterBuckets } from "@/bungie/Hashes.ts";
import type { GlobalAction } from "@/app/state/Types.ts";
import { getCustomItemDefinition } from "@/app/backend/api.ts";
import StorageGG from "@/app/storage/StorageGG.ts";

class DataService {
  private static instance: DataService;
  private static dispatch: React.Dispatch<GlobalAction>;
  private static charactersAndVault: CharactersAndVault = {
    vault: {
      characterId: "VAULT",
      emblemBackgroundPath: "",
      items: {
        138197802: [],
        1469714392: [],
        3313201758: [],
      },
    },
    characters: {},
  };
  private static itemDefinition: JSON;

  private constructor(dispatch: React.Dispatch<GlobalAction>) {
    DataService.dispatch = dispatch;
    DataService.setupItemDefinition();
  }

  private static async setupItemDefinition() {
    const p1 = performance.now();

    // Is there a saved definition?
    try {
      const savedDefinition = await StorageGG.getData("item_definition", "getItemDefinition()");
      DataService.itemDefinition = savedDefinition;
      DataService.dispatch({ type: "setDefinitionsReady", payload: true });
      const p2 = performance.now();
      console.log("setupItemDefinition() took:", (p2 - p1).toFixed(5), "ms");
      return;
    } catch (e) {
      console.error("No saved itemDefinition. Downloading new version...", e);
    }

    try {
      const downloadedDefinition = await getCustomItemDefinition();
      await StorageGG.setData(downloadedDefinition, "item_definition", "setupItemDefinition()");
      DataService.dispatch({ type: "setDefinitionsReady", payload: true });
    } catch (e) {
      console.error("Failed to download and save itemDefinition", e);
    }
    const p2 = performance.now();
    console.log("setupItemDefinition() took:", (p2 - p1).toFixed(5), "ms");
  }

  public static getInstance(dispatch: React.Dispatch<GlobalAction>): DataService {
    if (!DataService.instance) {
      DataService.instance = new DataService(dispatch);
    }

    return DataService.instance;
  }

  public static async getInventory() {
    try {
      const profile = await getProfile();
      const p1 = performance.now();

      const validatedProfile = parse(getProfileSchema, profile);
      const p2 = performance.now();
      console.log("parse() took:", (p2 - p1).toFixed(4), "ms");

      DataService.processProfile(validatedProfile);
      DataService.processCharacterEquipment(validatedProfile);
      DataService.processCharacterInventory(validatedProfile);
      DataService.processVaultInventory(validatedProfile);
      DataService.dispatch({ type: "setDataIsReady", payload: true });
    } catch (e) {
      console.error("Failed to validate profile", e);
    }
  }

  private static processProfile(profile: ProfileData) {
    console.log("processProfile()");
    const p1 = performance.now();
    const characters = profile.Response.characters.data;
    for (const character in characters) {
      const characterData = characters[character];

      if (characterData) {
        const initialCharacterData = {
          data: characterData,
          items: {} as { [key: number]: { equipped: DestinyItem | null; inventory: Array<DestinyItem> } },
        };

        // Now create all the buckets
        for (const bucket of characterBuckets) {
          initialCharacterData.items[bucket] = { equipped: null, inventory: [] };
        }

        DataService.charactersAndVault.characters[character] = initialCharacterData;
      }
    }
    const p2 = performance.now();
    console.log("processProfile() took:", (p2 - p1).toFixed(5), "ms");
  }

  private static processCharacterEquipment(profile: ProfileData) {
    const p1 = performance.now();
    const charactersEquipment = profile.Response.characterEquipment.data;
    for (const character in charactersEquipment) {
      const characterEquipment = charactersEquipment[character];

      if (characterEquipment) {
        const characterItems = DataService.charactersAndVault.characters[character];
        for (const item of characterEquipment.items) {
          if (characterItems) {
            characterItems.items[item.bucketHash] = { equipped: item, inventory: [] };
          }
        }
      }
    }

    const p2 = performance.now();
    console.log("processCharacterEquipment() took:", (p2 - p1).toFixed(5), "ms");
  }

  private static processCharacterInventory(profile: ProfileData) {
    const p1 = performance.now();
    const charactersInventory = profile.Response.characterInventories.data;
    for (const character in charactersInventory) {
      const characterInventory = charactersInventory[character];

      if (characterInventory) {
        const characterItems = DataService.charactersAndVault.characters[character];
        for (const item of characterInventory.items) {
          if (characterItems) {
            const hasBucket = Object.hasOwn(characterItems.items, item.bucketHash);
            if (!hasBucket) {
              characterItems.items[item.bucketHash] = { equipped: null, inventory: [] };
            }
            characterItems.items[item.bucketHash]?.inventory.push(item);
          }
        }
      }
    }

    const p2 = performance.now();
    console.log("processCharacterInventory() took:", (p2 - p1).toFixed(5), "ms");
  }

  private static processVaultInventory(profile: ProfileData) {
    const p1 = performance.now();
    const vaultInventory = profile.Response.profileInventory.data.items;

    if (vaultInventory) {
      const vaultItems = DataService.charactersAndVault.vault.items;
      // biome-ignore lint/complexity/useLiteralKeys: <explanation>
      const bucketTypeHash = safeParse(array(number()), DataService.itemDefinition["BucketTypeHash"]);

      if (!bucketTypeHash.success) {
        console.error("Failed to parse bucketTypeHash", bucketTypeHash.issues);
        return;
      }

      for (const item of vaultInventory) {
        const itemHash = item.itemHash.toString();
        const data = DataService.itemDefinition[itemHash];
        const definitionBucketHash = bucketTypeHash.output[data.b];
        const hasBucket = Object.hasOwn(vaultItems[item.bucketHash], definitionBucketHash);
        if (!hasBucket) {
          vaultItems[item.bucketHash][definitionBucketHash] = { inventory: [] };
        }

        vaultItems[item.bucketHash][definitionBucketHash]?.inventory.push(item);
      }
    }
    const p2 = performance.now();
    console.log("processVaultInventory() took:", (p2 - p1).toFixed(5), "ms");
  }
}

export default DataService;
