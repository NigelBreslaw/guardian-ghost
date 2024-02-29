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
      // console.log("parse() took:", (p2 - p1).toFixed(4), "ms");
      // console.log("response", validatedProfile);
      // console.log("raw", profile);
      DataService.processProfile(validatedProfile);
    } catch (e) {
      console.error("Failed to validate profile", e);
    }
  }

  private static processProfile(profile: ProfileData) {
    const characters = profile.Response.characters.data;
    for (const character in characters) {
      const characterData = characters[character];

      if (characterData) {
        DataService.charactersAndVault.characters[character] = characterData;
      }
    }
    console.log(Object.keys(DataService.charactersAndVault.characters));
  }
}

export default DataService;
