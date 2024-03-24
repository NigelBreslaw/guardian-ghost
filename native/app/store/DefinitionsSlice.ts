import type { StateCreator } from "zustand";

export interface DefinitionsSlice {
  definitionsReady: boolean;
  setDefinitionsReady: (definitionsReady: boolean) => void;
}

export const createDefinitionsSlice: StateCreator<DefinitionsSlice> = (set) => ({
  definitionsReady: false,
  setDefinitionsReady: (definitionsReady: boolean) => set({ definitionsReady }),
});
