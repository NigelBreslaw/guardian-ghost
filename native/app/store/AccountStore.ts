import type { BungieUser } from "@/app/bungie/Types.ts";
import { create } from "zustand";

type AccountStore = {
  currentAccount: BungieUser | null;
  setCurrentAccount: (currentAccount: BungieUser | null) => void;
};

export const useAccountStore = create<AccountStore>((set) => ({
  currentAccount: null,
  setCurrentAccount: (currentAccount: BungieUser | null) => set({ currentAccount }),
}));
