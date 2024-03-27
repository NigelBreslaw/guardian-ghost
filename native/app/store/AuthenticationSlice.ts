import type { BungieUser } from "@/app/bungie/Types.ts";
import { deleteUserData, getTokenAsync, loadBungieUser, loadToken } from "@/app/store/AuthenticationLogic.ts";
import type { AuthToken } from "@/app/store/Utilities.ts";
import type { StateCreator } from "zustand";
import * as SplashScreen from "expo-splash-screen";

const initialBungieUser = {
  supplementalDisplayName: "",
  iconPath: "",
  topLevelAccountMembershipId: "",
  profile: { membershipId: "", membershipType: "", displayName: "" },
};

type Authenticating = "INITIALIZING" | "AUTHENTICATED" | "NO-AUTHENTICATION";

export interface AuthenticationSlice {
  authenticated: Authenticating;
  authToken: AuthToken | null;
  bungieUser: BungieUser;
  initComplete: boolean;
  systemDisabled: boolean;

  getTokenAsync: (errorMessage: string) => Promise<AuthToken | null>;
  initAuthentication: () => Promise<void>;
  setBungieUser: (bungieUser: BungieUser) => void;
  setSystemDisabled: (systemDisabled: boolean) => void;
  logoutCurrentUser: () => void;
}

export const createAuthenticationSlice: StateCreator<AuthenticationSlice> = (set, get) => ({
  authenticated: "INITIALIZING",
  authToken: null,
  bungieUser: initialBungieUser,
  initComplete: false,
  systemDisabled: false,

  getTokenAsync: async (errorMessage) => {
    const membershipId = get().bungieUser.profile.membershipId;

    const authToken = await getTokenAsync(get().authToken, membershipId, errorMessage);
    if (authToken) {
      set({ authToken, systemDisabled: false });
      return authToken;
    }

    throw new Error("Catastrophic error in getTokenAsync");
  },

  initAuthentication: async () => {
    try {
      const bungieUser = await loadBungieUser();
      if (bungieUser) {
        set({ bungieUser });
        const membershipId = get().bungieUser.profile.membershipId;
        const authToken = await loadToken(membershipId);
        if (authToken) {
          return set({ authToken, authenticated: "AUTHENTICATED" });
        }
      }
      console.warn("No user found");
      set({ authenticated: "NO-AUTHENTICATION", bungieUser: initialBungieUser });
    } catch (error) {
      console.error("An error occurred:", error);
      set({ authenticated: "NO-AUTHENTICATION" });
    } finally {
      SplashScreen.hideAsync();
      set({ initComplete: true });
    }
  },
  setBungieUser: (bungieUser) => set({ bungieUser }),
  setSystemDisabled: (systemDisabled) => set({ systemDisabled }),
  logoutCurrentUser: () => {
    const membershipId = get().bungieUser.profile.membershipId;
    deleteUserData(membershipId);
    set({ bungieUser: initialBungieUser, authToken: null, authenticated: "NO-AUTHENTICATION" });
  },
});
