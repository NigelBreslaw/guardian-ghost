import { create } from "zustand";

type GlobalStateStore = {
  refreshing: boolean;
  setRefreshing: (refreshing: boolean) => void;
  systemDisabled: boolean;
  setSystemDisabled: (systemDisabled: boolean) => void;
  initComplete: boolean;
  setInitComplete: (initComplete: boolean) => void;
};

export const useGlobalStateStore = create<GlobalStateStore>((set) => ({
  refreshing: false,
  setRefreshing: (refreshing: boolean) => set({ refreshing }),
  systemDisabled: false,
  setSystemDisabled: (systemDisabled: boolean) => set({ systemDisabled }),
  initComplete: false,
  setInitComplete: (initComplete: boolean) => {
    set({ initComplete });
  },
}));
