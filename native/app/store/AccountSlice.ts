import type { BungieUser, GGCharacterUiData } from "@/app/bungie/Types.ts";
import type { UiCell } from "@/app/inventory/Common.ts";
import type { StateCreator } from "zustand";

export interface AccountSlice {
  currentAccount: BungieUser | null;
  setCurrentAccount: (currentAccount: BungieUser | null) => void;
  ggCharacters: GGCharacterUiData[];
  setGGCharacters: (ggCharacters: GGCharacterUiData[]) => void;

  // Inventory
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

export const createAccountSlice: StateCreator<AccountSlice> = (set) => ({
  currentAccount: null,
  setCurrentAccount: (currentAccount: BungieUser | null) => set({ currentAccount }),
  ggCharacters: [],
  setGGCharacters: (ggCharacters: GGCharacterUiData[]) => set({ ggCharacters }),

  // Inventory
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
