import type { IStore } from "@/app/store/GGStore.ts";
import type { StateCreator } from "zustand";

export type UIDataSliceSetter = Parameters<StateCreator<IStore, [], [], UIDataSlice>>[0];
export type UiDataSliceGetter = Parameters<StateCreator<IStore, [], [], UIDataSlice>>[1];

export interface UIDataSlice {
  maxLostItemsColumns: number;
  setLostItemsColumns: (maxLostItemsColumns: number) => void;
}

export const createUIDataSlice: StateCreator<IStore, [], [], UIDataSlice> = (set, get) => ({
  maxLostItemsColumns: 0,
  setLostItemsColumns: (maxLostItemsColumns) => {
    if (maxLostItemsColumns !== get().maxLostItemsColumns) {
      set({ maxLostItemsColumns });
    }
  },
});
