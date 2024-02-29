import { getProfile } from "@/app/bungie/BungieApi.ts";
import { ProfileData, getProfileSchema } from "@/app/bungie/Types.ts";
import type { CharactersAndVault } from "@/app/bungie/Types.ts";
import { parse } from "valibot";

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
      // console.log("response", validatedProfile);
      // console.log("raw", profile);
      DataService.processProfile(validatedProfile);
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
        const c = {
          data: characterData,
          inventory: [],
        };
        DataService.charactersAndVault.characters[character] = c;
      }
    }
    const p2 = performance.now();
    console.log("processProfile() took:", (p2 - p1).toFixed(4), "ms");
  }

  private static processCharacterInventory(profile: ProfileData) {
    const p1 = performance.now();
    const charactersEquipment = profile.Response.characterEquipment.data;
    for (const character in charactersEquipment) {
      const characterEquipment = charactersEquipment[character];

      if (characterEquipment) {
        const equipment = [];
        for (const item of characterEquipment.items) {
          equipment.push(item);
        }

        const c = DataService.charactersAndVault.characters[character];
        if (c) {
          c.inventory = equipment;
        }
      }
    }
    const p2 = performance.now();
    console.log("processCharacterInventory() took:", (p2 - p1).toFixed(4), "ms");
  }
}

export default DataService;
