import type { IStore } from "@/app/store/GGStore.ts";
import type { StateCreator } from "zustand";

export type SettingsSliceSetter = Parameters<StateCreator<IStore, [], [], SettingsSlice>>[0];
export type SettingsSliceGetter = Parameters<StateCreator<IStore, [], [], SettingsSlice>>[1];

export enum ShowBottomSheetPreference {
  Auto = "AUTOMATIC",
  AlwaysShowing = "ALWAYS_SHOWING",
  AlwaysMinimized = "ALWAYS_MINIMIZED",
}

export type ShowBottomSheetStringValues = "AUTOMATIC" | "ALWAYS_SHOWING" | "ALWAYS_MINIMIZED";

export enum ShowBottomSheet {
  show = "show",
  minimize = "minimize",
}

export interface SettingsSlice {
  showBottomSheetPreference: ShowBottomSheetPreference;
  showNextBottomSheet: ShowBottomSheet;
  setBottomSheetPreference: (showBottomSheetPreference: string) => void;
  setShowBottomSheet: (showBottomSheet: ShowBottomSheet) => void;
}

export const createSettingsSlice: StateCreator<IStore, [], [], SettingsSlice> = (set, get) => ({
  showBottomSheetPreference: ShowBottomSheetPreference.Auto,
  showNextBottomSheet: ShowBottomSheet.show,
  setBottomSheetPreference: (showBottomSheetPreference: string) => {
    if (get().showBottomSheetPreference !== showBottomSheetPreference) {
      switch (showBottomSheetPreference) {
        case ShowBottomSheetPreference.Auto:
          set({ showBottomSheetPreference });
          break;
        case ShowBottomSheetPreference.AlwaysShowing:
          set({ showBottomSheetPreference, showNextBottomSheet: ShowBottomSheet.show });
          break;
        case ShowBottomSheetPreference.AlwaysMinimized:
          set({ showBottomSheetPreference, showNextBottomSheet: ShowBottomSheet.minimize });
          break;
      }
    }
  },
  setShowBottomSheet: (showBottomSheet: ShowBottomSheet) => {
    if (get().showBottomSheetPreference === ShowBottomSheetPreference.Auto)
      set({ showNextBottomSheet: showBottomSheet });
  },
});
