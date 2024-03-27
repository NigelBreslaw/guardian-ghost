import type { StateCreator } from "zustand";

export interface GlobalStateSlice {
  refreshing: boolean;
  setRefreshing: (refreshing: boolean) => void;
}

export const createGlobalStateSlice: StateCreator<GlobalStateSlice> = (set) => ({
  refreshing: false,
  setRefreshing: (refreshing) => set({ refreshing }),
});
