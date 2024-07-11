import type { IStore } from "@/app/store/GGStore.ts";
import type { StateCreator } from "zustand";

export type SettingsSliceSetter = Parameters<StateCreator<IStore, [], [], SettingsSlice>>[0];
export type SettingsSliceGetter = Parameters<StateCreator<IStore, [], [], SettingsSlice>>[1];

enum ShowBottomSheetPreference {
  Auto = "AUTOMATIC",
  AlwaysShowing = "ALWAYS_SHOWING",
  AlwaysMinimized = "ALWAYS_MINIMIZED",
}

export enum ShowBottomSheet {
  show = "show",
  minimize = "minimize",
}

export interface SettingsSlice {
  showBottomSheetPreference: ShowBottomSheetPreference;
  showNextBottomSheet: ShowBottomSheet;
}

export const createSettingsSlice: StateCreator<IStore, [], [], SettingsSlice> = (set, get) => ({
  showBottomSheetPreference: ShowBottomSheetPreference.Auto,
  showNextBottomSheet: ShowBottomSheet.show,
  setShowBottomSheet: (showBottomSheet: ShowBottomSheet) => {
    if (get().showBottomSheetPreference === ShowBottomSheetPreference.Auto)
      set({ showNextBottomSheet: showBottomSheet });
  },
});
