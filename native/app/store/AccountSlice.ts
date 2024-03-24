import type { BungieUser, GGCharacterUiData } from "@/app/bungie/Types.ts";
import type { StateCreator } from "zustand";

export interface AccountSlice {
  currentAccount: BungieUser | null;
  setCurrentAccount: (currentAccount: BungieUser | null) => void;
  ggCharacters: GGCharacterUiData[];
  setGGCharacters: (ggCharacters: GGCharacterUiData[]) => void;
}

export const createAccountSlice: StateCreator<AccountSlice> = (set) => ({
  currentAccount: null,
  setCurrentAccount: (currentAccount: BungieUser | null) => set({ currentAccount }),
  ggCharacters: [],
  setGGCharacters: (ggCharacters: GGCharacterUiData[]) => set({ ggCharacters }),
});
