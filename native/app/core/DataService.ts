import { getProfile } from "@/app/bungie/BungieApi.ts";
import { ProfileData, getProfileSchema } from "@/app/bungie/Types.ts";
import type { CharactersAndVault, DestinyItem } from "@/app/bungie/Types.ts";
import { parse } from "valibot";
import { characterBuckets } from "@/bungie/Hashes.ts";

class DataService {
  private static instance: DataService;
  private static charactersAndVault: CharactersAndVault = {
    vault: {
      characterId: "VAULT",
      emblemBackgroundPath: "",
    },
    characters: {},
  };

  private constructor() {}

  public static getInstance(): DataService {
    if (!DataService.instance) {
      DataService.instance = new DataService();
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
      console.log("response", validatedProfile);
      // console.log("raw", profile);
      DataService.processProfile(validatedProfile);
      DataService.processCharacterEquipment(validatedProfile);
      DataService.processCharacterInventory(validatedProfile);
    } catch (e) {
      console.error("Failed to validate profile", e);
    }
  }

  private static processProfile(profile: ProfileData) {
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
}

export default DataService;
