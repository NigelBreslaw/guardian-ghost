import { getProfile } from "@/app/bungie/BungieApi.ts";
import { type ProfileData, getProfileSchema, vaultBucketHashes, GuardiansSchema } from "@/app/bungie/Types.ts";
import type { DestinyItem, GuardiansAndVault, VaultBucketHash } from "@/app/bungie/Types.ts";
import { type ItemDefinition, ItemDefinitionSchema, type SingleItemDefinition } from "@/app/core/Types.ts";
import type { GlobalAction } from "@/app/state/Types.ts";
import StorageGG from "@/app/storage/StorageGG.ts";
// @refresh reset
import { getCustomItemDefinition } from "@/app/utilities/Helpers.ts";
import { characterBuckets } from "@/bungie/Hashes.ts";
import { array, number, parse, safeParse, string } from "valibot";

class DataService {
  private static instance: DataService;
  private static dispatch: React.Dispatch<GlobalAction>;
  static charactersAndVault: GuardiansAndVault = {
    vault: {
      characterId: "VAULT",
      emblemBackgroundPath: "",
      items: {
        // general
        138197802: {
          items: {},
        },
        // consumables
        1469714392: {
          items: {},
        },
        // mods
        3313201758: {
          items: {},
        },
        // special orders:
        1367666825: {
          items: {},
        },
      },
    },
    guardians: {},
  };
  static itemDefinition: ItemDefinition;
  static bucketTypeHashArray: Array<number>;
  static IconWaterMarks: Array<string>;
  static ItemTypeDisplayName: Array<string>;
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
    try {
      const parsedBucketTypeHash = parse(array(number()), DataService.itemDefinition.helpers.BucketTypeHash);
      DataService.bucketTypeHashArray = parsedBucketTypeHash;
      const IconWaterMarks = parse(array(string()), DataService.itemDefinition.helpers.IconWaterMark);
      DataService.IconWaterMarks = IconWaterMarks;
      const ItemTypeDisplayName = parse(array(string()), DataService.itemDefinition.helpers.ItemTypeDisplayName);
      DataService.ItemTypeDisplayName = ItemTypeDisplayName;
    } catch (e) {
      console.error("Failed to setUpItemDefinition", e);
    }
  }

  public static async getInventory() {
    try {
      const p1 = performance.now();
      const profile = await getProfile();
      const p2 = performance.now();

      console.log("getProfile() took:", (p2 - p1).toFixed(4), "ms");
      const p3 = performance.now();

      const validatedProfile = parse(getProfileSchema, profile);
      const p4 = performance.now();
      console.log("parse() took:", (p4 - p3).toFixed(4), "ms");

      const p5 = performance.now();
      DataService.profileData = validatedProfile;
      DataService.processProfile(validatedProfile);
      DataService.defineCharactersAndVault();
      DataService.processCharacterEquipment(validatedProfile);
      DataService.processCharacterInventory(validatedProfile);
      DataService.processVaultInventory(validatedProfile);
      const p6 = performance.now();
      console.log("processing all profile data took:", (p6 - p5).toFixed(5), "ms");
      DataService.dispatch({ type: "setDataIsReady", payload: true });
    } catch (e) {
      console.error("Failed to validate profile!", e);
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

        DataService.charactersAndVault.guardians[character] = initialCharacterData;
      }
    }
  }

  private static defineCharactersAndVault() {
    // First flesh out the guardians
    const characters = DataService.charactersAndVault.guardians;

    for (const character in characters) {
      const fullCharacter = characters[character]?.data;

      if (fullCharacter) {
        const parseCharacter = safeParse(GuardiansSchema, fullCharacter);
        // console.log("defineCharactersAndVault", d);
        if (parseCharacter.success) {
          // DataService.addCharacterDefinition(parseCharacter.output);
        }
      }
    }
  }

  private static addCharacterDefinition(characterData: CharacterData) {
    console.log("addCharacterDefinition", characterData);
  }

  private static processCharacterEquipment(profile: ProfileData) {
    const charactersEquipment = profile.Response.characterEquipment.data;
    for (const character in charactersEquipment) {
      const characterEquipment = charactersEquipment[character];

      if (characterEquipment) {
        const characterItems = DataService.charactersAndVault.guardians[character];
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
        const characterItems = DataService.charactersAndVault.guardians[character];
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
        if (bucketHashIndex !== undefined) {
          const definitionBucketHash = DataService.bucketTypeHashArray[bucketHashIndex];

          if (definitionBucketHash) {
            if (!vaultBucketHashes.includes(item.bucketHash)) {
              console.error("item.bucketHash not in vaultBucketHashes", item.bucketHash);
              continue;
            }
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
