import type { StateCreator } from "zustand";

import { SectionBuckets } from "@/app/bungie/Enums.ts";
import { equipSectionBuckets } from "@/app/inventory/logic/Helpers.ts";
import { ProfileDataHelpers } from "@/app/store/Definitions.ts";
import type { IStore } from "@/app/store/GGStore.ts";
import {
  ENGRAMS_SECTION_HEIGHT,
  EQUIP_SECTION_SIZE,
  FOOTER_HEIGHT,
  ICON_MARGIN,
  ICON_SIZE,
} from "@/app/utilities/UISize.ts";

export type UIDataSliceSetter = Parameters<StateCreator<IStore, [], [], UIDataSlice>>[0];
export type UIDataSliceGetter = Parameters<StateCreator<IStore, [], [], UIDataSlice>>[1];

export interface UIDataSlice {
  maxLostItemsRows: number;
  setLostItemsRows: (maxLostItemsRows: number) => void;
  getVaultSpacerSize: (bucket: SectionBuckets) => number;
}

export const createUIDataSlice: StateCreator<IStore, [], [], UIDataSlice> = (set, get) => ({
  maxLostItemsRows: 0,
  setLostItemsRows: (maxLostItemsRows) => {
    set({ maxLostItemsRows });
  },
  getVaultSpacerSize: (bucket) => {
    return getVaultSpacerSize(get, bucket);
  },
});

function getVaultSpacerSize(get: UIDataSliceGetter, bucket: SectionBuckets): number {
  if (equipSectionBuckets.includes(bucket)) {
    return EQUIP_SECTION_SIZE + FOOTER_HEIGHT;
  }

  if (bucket === SectionBuckets.Engram) {
    return ENGRAMS_SECTION_HEIGHT;
  }

  if (bucket === SectionBuckets.LostItem) {
    const maxLostItemsRows = get().maxLostItemsRows;

    return ICON_SIZE * maxLostItemsRows + (maxLostItemsRows - 1) * ICON_MARGIN + FOOTER_HEIGHT;
  }

  if (bucket === SectionBuckets.Artifact) {
    return ICON_SIZE + ICON_MARGIN;
  }

  if (bucket === SectionBuckets.Consumables) {
    const totalConsumables = ProfileDataHelpers.consumables.length;
    const totalRows = Math.ceil(totalConsumables / 5);
    return (ICON_SIZE + ICON_MARGIN) * totalRows;
  }

  if (bucket === SectionBuckets.Mods) {
    const totalMods = ProfileDataHelpers.mods.length;
    const totalRows = Math.ceil(totalMods / 5);
    return (ICON_SIZE + ICON_MARGIN) * totalRows;
  }
  return 0;
}
