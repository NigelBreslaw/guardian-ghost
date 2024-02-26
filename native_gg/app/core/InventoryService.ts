import { getProfile } from "../bungie/BungieApi";

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
    // const profile = await getProfile();
    // console.log("profile", profile);
  }
}

export default InventoryService;
