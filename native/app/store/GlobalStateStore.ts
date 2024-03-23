import { create } from "zustand";

type GlobalStateStore = {
  refreshing: boolean;
  setRefreshing: (refreshing: boolean) => void;
  systemDisabled: boolean;
};

export const useGlobalStateStore = create<GlobalStateStore>((set) => ({
  refreshing: false,
  setRefreshing: (refreshing: boolean) => set({ refreshing }),
  systemDisabled: false,
  setSystemDisabled: (systemDisabled: boolean) => set({ systemDisabled: systemDisabled }),
}));
