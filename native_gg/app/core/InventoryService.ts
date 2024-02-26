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
    // try {
    //   const validatedProfile = parse(getProfileSchema, profile);
    //   console.log("validatedProfile", validatedProfile);
    // } catch (e) {
    //   console.error("Failed to validate profile", e);
    // }
  }
}

export default InventoryService;
