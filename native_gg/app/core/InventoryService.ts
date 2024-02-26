import { getProfile } from "@/app/bungie/BungieApi.ts";
import { getProfileSchema } from "@/app/bungie/Types.ts";
import { parse } from "valibot";

class InventoryService {
  private static instance: InventoryService;

  private constructor() {}

  public static getInstance(): InventoryService {
    if (!InventoryService.instance) {
      InventoryService.instance = new InventoryService();
    }

    return InventoryService.instance;
  }

  public static async getInventory() {
    try {
      const profile = await getProfile();
      const validatedProfile = parse(getProfileSchema, profile);
      console.log("response", validatedProfile);
    } catch (e) {
      console.error("Failed to validate profile", e);
    }
  }
}

export default InventoryService;
