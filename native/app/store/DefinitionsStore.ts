import { create } from "zustand";

type DefinitionsStore = {
  definitionsReady: boolean;
  setDefinitionsReady: (definitionsReady: boolean) => void;
};

export const useDefinitionsStore = create<DefinitionsStore>((set) => ({
  definitionsReady: false,
  setDefinitionsReady: (definitionsReady: boolean) => set({ definitionsReady }),
}));
