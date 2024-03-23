import { create } from "zustand";

type InventoryStore = {
  currentListIndex: number;
  setCurrentListIndex: (payload: number) => void;
};

export const useInventoryStore = create<InventoryStore>((set) => ({
  currentListIndex: 0,
  setCurrentListIndex: (currentListIndex: number) => set({ currentListIndex }),
}));
