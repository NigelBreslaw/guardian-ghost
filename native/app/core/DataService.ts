import { getProfile } from "@/app/bungie/BungieApi.ts";
import { getProfileSchema } from "@/app/bungie/Types.ts";
("@/app/bungie/Types.ts");
import { type ItemDefinition, ItemDefinitionSchema } from "@/app/core/Types.ts";
import StorageGG from "@/app/store/StorageGG.ts";
import { useGGStore } from "@/app/store/GGStore.ts";
import { benchmark, benchmarkAsync, getCustomItemDefinition } from "@/app/utilities/Helpers.ts";
import { array, number, parse, string } from "valibot";

class DataService {
  private static instance: DataService;
  static itemDefinition: ItemDefinition;
  static bucketTypeHashArray: Array<number>;
  static IconWaterMarks: Array<string>;
  static ItemTypeDisplayName: Array<string>;

  private constructor() {
    DataService.setupItemDefinition();
  }

  private static async setupItemDefinition() {
    const p1 = performance.now();
    // Is there a saved definition?
    try {
      const loadedDefinition = await StorageGG.getData("ITEM_DEFINITION", "getItemDefinition()");
      const p3 = performance.now();
      console.log("loaded setupItemDefinition() took:", (p3 - p1).toFixed(5), "ms");
      const itemDefinition = parse(ItemDefinitionSchema, loadedDefinition);
      const p4 = performance.now();
      console.log("parse itemDef() took:", (p4 - p3).toFixed(4), "ms");
      DataService.itemDefinition = itemDefinition;
      DataService.setUpItemDefinition();
      useGGStore.getState().setDefinitionsReady(true);
      const p2 = performance.now();
      console.log("Full itemDef ready took:", (p2 - p1).toFixed(5), "ms");
      return;
    } catch (e) {
      console.error("No saved itemDefinition. Downloading new version...", e);
    }

    try {
      const downloadedDefinition = await getCustomItemDefinition();
      const itemDefinition = parse(ItemDefinitionSchema, downloadedDefinition);
      await StorageGG.setData(itemDefinition as unknown as JSON, "ITEM_DEFINITION", "setupItemDefinition()");
      DataService.itemDefinition = itemDefinition;
      DataService.setUpItemDefinition();
      useGGStore.getState().setDefinitionsReady(true);
    } catch (e) {
      console.error("Failed to download and save itemDefinition", e);
    }
    const p2 = performance.now();
    console.log("downloadedSetupItemDefinition() took:", (p2 - p1).toFixed(5), "ms");
  }

  public static getInstance(): DataService {
    if (!DataService.instance) {
      DataService.instance = new DataService();
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
    useGGStore.getState().setRefreshing(true);
    try {
      const profile = await benchmarkAsync(getProfile);
      const validatedProfile = benchmark(parse, getProfileSchema, profile);
      const p1 = performance.now();
      useGGStore.getState().updateProfile(validatedProfile);
      const p2 = performance.now();
      console.info("NEW updateProfile() took:", (p2 - p1).toFixed(5), "ms");
    } catch (e) {
      console.error("Failed to validate profile!", e);
    } finally {
      useGGStore.getState().setRefreshing(false);
    }
  }
}

export default DataService;
