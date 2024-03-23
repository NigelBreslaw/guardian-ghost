import { create } from "zustand";

type GlobalStateStore = {
  refreshing: boolean;
  setRefreshing: (refreshing: boolean) => void;
};

export const useGlobalStateStore = create<GlobalStateStore>((set) => ({
  refreshing: false,
  setRefreshing: (refreshing: boolean) => set({ refreshing }),
}));
