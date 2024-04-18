import {
  ENGRAMS_SECTION_HEIGHT,
  EQUIP_SECTION_SIZE,
  ITEM_SIZE,
  SectionBuckets,
  equipSectionBuckets,
} from "@/app/inventory/Common.ts";
import type { IStore } from "@/app/store/GGStore.ts";
import type { StateCreator } from "zustand";

export type UIDataSliceSetter = Parameters<StateCreator<IStore, [], [], UIDataSlice>>[0];
export type UIDataSliceGetter = Parameters<StateCreator<IStore, [], [], UIDataSlice>>[1];

export interface UIDataSlice {
  maxLostItemsColumns: number;
  setLostItemsColumns: (maxLostItemsColumns: number) => void;
  getVaultSpacerSize: (bucket: SectionBuckets) => number;
}

export const createUIDataSlice: StateCreator<IStore, [], [], UIDataSlice> = (set, get) => ({
  maxLostItemsColumns: 0,
  setLostItemsColumns: (maxLostItemsColumns) => {
    set({ maxLostItemsColumns });
  },
  getVaultSpacerSize: (bucket) => {
    return getVaultSpacerSize(get, bucket);
  },
});

function getVaultSpacerSize(get: UIDataSliceGetter, bucket: SectionBuckets): number {
  if (equipSectionBuckets.includes(bucket)) {
    return EQUIP_SECTION_SIZE;
  }

  if (bucket === SectionBuckets.Engram) {
    return ENGRAMS_SECTION_HEIGHT;
  }

  if (bucket === SectionBuckets.LostItem) {
    const maxLostItemsColumns = get().maxLostItemsColumns;
    return maxLostItemsColumns * ITEM_SIZE;
  }

  if (bucket === SectionBuckets.Artifact) {
    return ITEM_SIZE;
  }

  if (bucket === SectionBuckets.Consumables) {
    const totalConsumables = get().consumables.length;
    const totalRows = Math.ceil(totalConsumables / 5);
    return totalRows * ITEM_SIZE;
  }

  if (bucket === SectionBuckets.Mods) {
    const totalMods = get().mods.length;
    const totalRows = Math.ceil(totalMods / 5);
    return totalRows * ITEM_SIZE;
  }
  return 0;
}
