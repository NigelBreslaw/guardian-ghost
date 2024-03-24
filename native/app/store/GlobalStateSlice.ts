import type { StateCreator } from "zustand";

export interface GlobalStateSlice {
  refreshing: boolean;
  setRefreshing: (refreshing: boolean) => void;
  systemDisabled: boolean;
  setSystemDisabled: (systemDisabled: boolean) => void;
  initComplete: boolean;
  setInitComplete: (initComplete: boolean) => void;
}

export const createGlobalStateSlice: StateCreator<GlobalStateSlice> = (set) => ({
  refreshing: false,
  setRefreshing: (refreshing: boolean) => set({ refreshing }),
  systemDisabled: false,
  setSystemDisabled: (systemDisabled: boolean) => set({ systemDisabled }),
  initComplete: false,
  setInitComplete: (initComplete: boolean) => {
    set({ initComplete });
  },
});
