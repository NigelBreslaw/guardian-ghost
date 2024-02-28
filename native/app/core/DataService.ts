import { getProfile } from "@/app/bungie/BungieApi.ts";
import { Character, getProfileSchema } from "@/app/bungie/Types.ts";
import { parse } from "valibot";

class DataService {
  private static instance: DataService;
  private static characters: Character[] = [];

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
    } catch (e) {
      console.error("Failed to validate profile", e);
    }
  }
}

export default DataService;
