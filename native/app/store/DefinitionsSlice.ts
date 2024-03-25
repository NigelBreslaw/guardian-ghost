import { ItemDefinitionSchema, type ItemDefinition } from "@/app/core/Types.ts";
import StorageGG from "@/app/store/StorageGG.ts";
import { getCustomItemDefinition } from "@/app/utilities/Helpers.ts";
import { array, number, parse, string } from "valibot";
import type { StateCreator } from "zustand";

export interface DefinitionsSlice {
  definitionsReady: boolean;
  itemDefinition: ItemDefinition | null;
  bucketTypeHashArray: Array<number>;
  iconWaterMarks: Array<string>;
  itemTypeDisplayName: Array<string>;
  initDefinitions: () => Promise<void>;
}

export const createDefinitionsSlice: StateCreator<DefinitionsSlice> = (set) => ({
  definitionsReady: false,
  itemDefinition: null,
  bucketTypeHashArray: [],
  iconWaterMarks: [],
  itemTypeDisplayName: [],
  initDefinitions: async () => {
    try {
      const loadedDefinition = await StorageGG.getData("ITEM_DEFINITION", "getItemDefinition()");
      const itemDefinition = parse(ItemDefinitionSchema, loadedDefinition);
      return set(parseAndSet(itemDefinition));
    } catch (e) {
      console.error("No saved itemDefinition. Downloading new version...", e);
    }

    try {
      const downloadedDefinition = await getCustomItemDefinition();
      const itemDefinition = parse(ItemDefinitionSchema, downloadedDefinition);
      await StorageGG.setData(itemDefinition as unknown as JSON, "ITEM_DEFINITION", "setupItemDefinition()");
      return set(parseAndSet(itemDefinition));
    } catch (e) {
      console.error("Failed to download and save itemDefinition", e);
    }
  },
});

function parseAndSet(itemDefinition: ItemDefinition) {
  const bucketTypeHashArray = parse(array(number()), itemDefinition.helpers.BucketTypeHash);
  const iconWaterMarks = parse(array(string()), itemDefinition.helpers.IconWaterMark);
  const itemTypeDisplayName = parse(array(string()), itemDefinition.helpers.ItemTypeDisplayName);
  return { itemDefinition, bucketTypeHashArray, iconWaterMarks, itemTypeDisplayName, definitionsReady: true };
}
