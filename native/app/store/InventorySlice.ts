import type { UiCell } from "@/app/inventory/Common.ts";
import type { StateCreator } from "zustand";

export interface InventorySlice {
  currentListIndex: number;
  setCurrentListIndex: (payload: number) => void;
  weaponsPageData: Array<Array<UiCell>>;
  setWeaponsPageData: (payload: Array<Array<UiCell>>) => void;
  armorPageData: Array<Array<UiCell>>;
  setArmorPageData: (payload: Array<Array<UiCell>>) => void;
  inventoryPageData: Array<Array<UiCell>>;
  setInventoryPageData: (payload: Array<Array<UiCell>>) => void;
}

export const createInventorySlice: StateCreator<InventorySlice> = (set) => ({
  currentListIndex: 0,
  setCurrentListIndex: (currentListIndex: number) => set({ currentListIndex }),
  weaponsPageData: [],
  armorPageData: [],
  inventoryPageData: [],
  setWeaponsPageData: (weaponsPageData: Array<Array<UiCell>>) => set({ weaponsPageData }),
  setArmorPageData: (armorPageData: Array<Array<UiCell>>) => set({ armorPageData }),
  setInventoryPageData: (inventoryPageData: Array<Array<UiCell>>) => set({ inventoryPageData }),
});
