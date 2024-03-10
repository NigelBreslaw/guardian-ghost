import { getProfile } from "@/app/bungie/BungieApi.ts";
import { ProfileData, getProfileSchema } from "@/app/bungie/Types.ts";
import type { CharactersAndVault, DestinyItem, VaultBucketHash } from "@/app/bungie/Types.ts";
import { parse, array, number, string } from "valibot";
import { characterBuckets } from "@/bungie/Hashes.ts";
import type { GlobalAction } from "@/app/state/Types.ts";
import { getCustomItemDefinition } from "@/app/backend/api.ts";
import StorageGG from "@/app/storage/StorageGG.ts";
import { ItemDefinitionSchema, type ItemDefinition, type SingleItemDefinition } from "@/app/core/Types.ts";

class DataService {
  private static instance: DataService;
  private static dispatch: React.Dispatch<GlobalAction>;
  static charactersAndVault: CharactersAndVault = {
    vault: {
      characterId: "VAULT",
      emblemBackgroundPath: "",
      items: {
        138197802: {
          items: {},
        },
        1469714392: {
          items: {},
        },
        3313201758: {
          items: {},
        },
      },
    },
    characters: {},
  };
  static itemDefinition: ItemDefinition;
  static bucketTypeHashArray: Array<number>;
  static IconWaterMarks: Array<string>;
  static profileData: ProfileData;

  private constructor(dispatch: React.Dispatch<GlobalAction>) {
    DataService.dispatch = dispatch;
    DataService.setupItemDefinition();
  }

  private static async setupItemDefinition() {
    const p1 = performance.now();

    // Is there a saved definition?
    try {
      const loadedDefinition = await StorageGG.getData("item_definition", "getItemDefinition()");
      const p3 = performance.now();
      console.log("loaded setupItemDefinition() took:", (p3 - p1).toFixed(5), "ms");
      const itemDefinition = parse(ItemDefinitionSchema, loadedDefinition);
      const p4 = performance.now();
      console.log("parse itemDef() took:", (p4 - p3).toFixed(4), "ms");
      DataService.itemDefinition = itemDefinition;
      DataService.setUpItemDefinition();
      DataService.dispatch({ type: "setDefinitionsReady", payload: true });
      const p2 = performance.now();
      console.log("Full itemDef ready took:", (p2 - p1).toFixed(5), "ms");
      return;
    } catch (e) {
      console.error("No saved itemDefinition. Downloading new version...", e);
    }

    try {
      const downloadedDefinition = await getCustomItemDefinition();
      const itemDefinition = parse(ItemDefinitionSchema, downloadedDefinition);
      await StorageGG.setData(itemDefinition as unknown as JSON, "item_definition", "setupItemDefinition()");
      DataService.itemDefinition = itemDefinition;
      DataService.setUpItemDefinition();
      DataService.dispatch({ type: "setDefinitionsReady", payload: true });
    } catch (e) {
      console.error("Failed to download and save itemDefinition", e);
    }
    const p2 = performance.now();
    console.log("downloadedsetupItemDefinition() took:", (p2 - p1).toFixed(5), "ms");
  }

  public static getInstance(dispatch: React.Dispatch<GlobalAction>): DataService {
    if (!DataService.instance) {
      DataService.instance = new DataService(dispatch);
    }

    return DataService.instance;
  }

  static setUpItemDefinition() {
    const p1 = performance.now();
    try {
      const parsedBucketTypeHash = parse(array(number()), DataService.itemDefinition.helpers.BucketTypeHash);
      DataService.bucketTypeHashArray = parsedBucketTypeHash;
      const IconWaterMarks = parse(array(string()), DataService.itemDefinition.helpers.IconWaterMark);
      DataService.IconWaterMarks = IconWaterMarks;
    } catch (e) {
      console.error("Failed to setUpItemDefinition", e);
    }
  }

  public static async getInventory() {
    try {
      const pa1 = performance.now();
      const profile = await getProfile();
      const pa2 = performance.now();

      console.log("getProfile() took:", (pa2 - pa1).toFixed(4), "ms");
      const p1 = performance.now();

      const validatedProfile = parse(getProfileSchema, profile);
      const p2 = performance.now();
      console.log("parse() took:", (p2 - p1).toFixed(4), "ms");

      const p3 = performance.now();
      DataService.profileData = validatedProfile;
      DataService.processProfile(validatedProfile);
      DataService.processCharacterEquipment(validatedProfile);
      DataService.processCharacterInventory(validatedProfile);
      DataService.processVaultInventory(validatedProfile);
      const p4 = performance.now();
      console.log("processing all profile data took:", (p4 - p3).toFixed(5), "ms");
      DataService.dispatch({ type: "setDataIsReady", payload: true });
    } catch (e) {
      console.error("Failed to validate profile", e);
    }
  }

  private static processProfile(profile: ProfileData) {
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
  }

  private static processCharacterEquipment(profile: ProfileData) {
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
  }

  private static processCharacterInventory(profile: ProfileData) {
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
  }

  private static processVaultInventory(profile: ProfileData) {
    const vaultInventory = profile.Response.profileInventory.data.items;
    if (vaultInventory) {
      const vaultItems = DataService.charactersAndVault.vault.items;

      for (const item of vaultInventory) {
        const itemHash = item.itemHash.toString();
        const data = DataService.itemDefinition.items[itemHash] as SingleItemDefinition;
        const bucketHashIndex = data.b;
        if (bucketHashIndex) {
          const definitionBucketHash = DataService.bucketTypeHashArray[bucketHashIndex];

          if (definitionBucketHash) {
            const hasBucket = Object.hasOwn(vaultItems[item.bucketHash as VaultBucketHash].items, definitionBucketHash);
            if (!hasBucket) {
              vaultItems[item.bucketHash as VaultBucketHash].items[definitionBucketHash] = {
                equipped: null,
                inventory: [],
              };
            }

            vaultItems[item.bucketHash as VaultBucketHash].items[definitionBucketHash]?.inventory.push(item);
          }
        }
      }
    }
  }
}

export default DataService;
