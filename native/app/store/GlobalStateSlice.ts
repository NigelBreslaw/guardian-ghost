import type { StateCreator } from "zustand";

export interface GlobalStateSlice {
  refreshing: boolean;
  setRefreshing: (refreshing: boolean) => void;
  systemDisabled: boolean;
  setSystemDisabled: (systemDisabled: boolean) => void;
}

export const createGlobalStateSlice: StateCreator<GlobalStateSlice> = (set) => ({
  refreshing: false,
  setRefreshing: (refreshing) => set({ refreshing }),
  systemDisabled: false,
  setSystemDisabled: (systemDisabled) => set({ systemDisabled }),
});
