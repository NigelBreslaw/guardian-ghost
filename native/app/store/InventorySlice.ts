import type { UiCell } from "@/app/inventory/Common.ts";
import type { StateCreator } from "zustand";

export interface InventorySlice {
  currentListIndex: number;
  setCurrentListIndex: (payload: number) => void;
  weaponsPageData: Array<Array<UiCell>>;
  armorPageData: Array<Array<UiCell>>;
  generalPageData: Array<Array<UiCell>>;
  setAllInventoryPageData: (
    weaponPage: Array<Array<UiCell>>,
    armorPage: Array<Array<UiCell>>,
    generalPage: Array<Array<UiCell>>,
  ) => void;
}

export const createInventorySlice: StateCreator<InventorySlice> = (set) => ({
  currentListIndex: 0,
  setCurrentListIndex: (currentListIndex: number) => {
    set({ currentListIndex });
  },
  weaponsPageData: [],
  armorPageData: [],
  generalPageData: [],
  setAllInventoryPageData: (
    weaponPage: Array<Array<UiCell>>,
    armorPage: Array<Array<UiCell>>,
    generalPage: Array<Array<UiCell>>,
  ) => set({ weaponsPageData: weaponPage, armorPageData: armorPage, generalPageData: generalPage }),
});
