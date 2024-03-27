import type { BungieUser } from "@/app/bungie/Types.ts";
import { getTokenAsync, loadBungieUser, loadToken } from "@/app/store/AuthenticationLogic.ts";
import type { AuthToken } from "@/app/store/Utilities.ts";
import type { StateCreator } from "zustand";
import * as SplashScreen from "expo-splash-screen";

type Authenticating = "INITIALIZING" | "AUTHENTICATED" | "NO-AUTHENTICATION";

export interface AuthenticationSlice {
  initComplete: boolean;
  authenticated: Authenticating;
  authToken: AuthToken | null;
  getTokenAsync: (errorMessage: string) => Promise<AuthToken | null>;
  initAuthentication: () => Promise<void>;
  bungieUser: BungieUser | null;
  setBungieUser: (bungieUser: BungieUser | null) => void;
  systemDisabled: boolean;
  setSystemDisabled: (systemDisabled: boolean) => void;
}

export const createAuthenticationSlice: StateCreator<AuthenticationSlice> = (set, get) => ({
  initComplete: false,
  authenticated: "INITIALIZING",
  authToken: null,
  getTokenAsync: async (errorMessage) => {
    const membershipId = get().bungieUser?.profile.membershipId;
    if (membershipId) {
      const authToken = await getTokenAsync(get().authToken, membershipId, errorMessage);
      if (authToken) {
        set({ authToken, systemDisabled: false });
        return authToken;
      }
    }
    throw new Error("Catastrophic error in getTokenAsync");
  },

  initAuthentication: async () => {
    try {
      const bungieUser = await loadBungieUser();
      if (bungieUser) {
        set({ bungieUser });
        const membershipId = get().bungieUser?.profile.membershipId;
        if (membershipId) {
          const authToken = await loadToken(membershipId);
          if (authToken) {
            return set({ authToken, authenticated: "AUTHENTICATED" });
          }
        }
      }
      console.warn("No user found");
      set({ authenticated: "NO-AUTHENTICATION" });
    } catch (error) {
      console.error("An error occurred:", error);
      set({ authenticated: "NO-AUTHENTICATION" });
    } finally {
      SplashScreen.hideAsync();
      set({ initComplete: true });
    }
  },
  bungieUser: null,
  setBungieUser: (bungieUser) => set({ bungieUser }),
  systemDisabled: false,
  setSystemDisabled: (systemDisabled) => set({ systemDisabled }),
});
