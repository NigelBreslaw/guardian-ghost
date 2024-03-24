import type { BungieUser } from "@/app/bungie/Types.ts";
import type { StateCreator } from "zustand";

export interface AccountSlice {
  currentAccount: BungieUser | null;
  setCurrentAccount: (currentAccount: BungieUser | null) => void;
}

export const createAccountSlice: StateCreator<AccountSlice> = (set) => ({
  currentAccount: null,
  setCurrentAccount: (currentAccount: BungieUser | null) => set({ currentAccount }),
});
