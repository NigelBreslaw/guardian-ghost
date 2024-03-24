import type { UiCell } from "@/app/inventory/Common.ts";
import type { StateCreator } from "zustand";

export interface InventorySlice {
  currentListIndex: number;
  setCurrentListIndex: (payload: number) => void;
  weaponsPageData: Array<Array<UiCell>>;
  setWeaponsPageData: (payload: Array<Array<UiCell>>) => void;
  armorPageData: Array<Array<UiCell>>;
  setArmorPageData: (payload: Array<Array<UiCell>>) => void;
  generalPageData: Array<Array<UiCell>>;
  setGeneralPageData: (payload: Array<Array<UiCell>>) => void;
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
  setWeaponsPageData: (weaponsPageData: Array<Array<UiCell>>) => set({ weaponsPageData }),
  setArmorPageData: (armorPageData: Array<Array<UiCell>>) => set({ armorPageData }),
  setGeneralPageData: (generalPageData: Array<Array<UiCell>>) => set({ generalPageData }),
  setAllInventoryPageData: (
    weaponPage: Array<Array<UiCell>>,
    armorPage: Array<Array<UiCell>>,
    generalPage: Array<Array<UiCell>>,
  ) => set({ weaponsPageData: weaponPage, armorPageData: armorPage, generalPageData: generalPage }),
});
