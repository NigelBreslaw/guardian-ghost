import { create } from "zustand";
import { subscribeWithSelector, persist, createJSONStorage } from "zustand/middleware";
import { AsyncStorage } from "expo-sqlite/kv-store";

import { type AccountSlice, createAccountSlice } from "./Account/AccountSlice.ts";
import { type AuthenticationSlice, createAuthenticationSlice } from "./Authentication/AuthenticationSlice.ts";
import { type DefinitionsSlice, createDefinitionsSlice } from "./DefinitionsSlice.ts";
import { type UIDataSlice, createUIDataSlice } from "./UIDataSlice.ts";
import { type SettingsSlice, createSettingsSlice } from "./SettingsSlice.ts";

export interface IStore extends AccountSlice, AuthenticationSlice, DefinitionsSlice, UIDataSlice, SettingsSlice {}

export const useGGStore = create<IStore>()(
  persist(
    subscribeWithSelector((...a) => ({
      ...createAccountSlice(...a),
      ...createAuthenticationSlice(...a),
      ...createDefinitionsSlice(...a),
      ...createUIDataSlice(...a),
      ...createSettingsSlice(...a),
    })),
    {
      name: "gg-storage",
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        currentListIndex: state.currentListIndex,
        currentInventoryPage: state.currentInventoryPage,
        weaponsPageOffsetY: state.weaponsPageOffsetY,
        armorPageOffsetY: state.armorPageOffsetY,
        generalPageOffsetY: state.generalPageOffsetY,
        weaponsSort: state.weaponsSort,
        armorSort: state.armorSort,
        showBottomSheetPreference: state.showBottomSheetPreference,
        showNextBottomSheet: state.showNextBottomSheet,

        itemDefinitionVersion: state.itemDefinitionVersion,
        bungieDefinitionVersions: state.bungieDefinitionVersions,
        previousDefinitionsSuccessfullyLoaded: state.previousDefinitionsSuccessfullyLoaded,
      }),
      onRehydrateStorage: () => {
        return (state, error) => {
          if (error) {
            console.error("an error happened during hydration", error);
            useGGStore.getState().showSnackBar("Failed to hydrate storage");
          } else {
            if (state) {
              state.setStateHydrated();
            }
          }
        };
      },
    },
  ),
);
