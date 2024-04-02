import type { BungieUser } from "@/app/bungie/Types.ts";
import {
  deleteUserData,
  getBungieAccount,
  getTokenAsync,
  loadBungieUser,
  loadToken,
  saveBungieUser,
  saveToken,
  urlToToken,
} from "@/app/store/AuthenticationLogic.ts";
import { isValidAccessToken, type AuthToken } from "@/app/store/Utilities.ts";
import type { StateCreator } from "zustand";
import * as SplashScreen from "expo-splash-screen";
import type { AccountSlice } from "@/app/store/AccountSlice.ts";
import type { DefinitionsSlice } from "@/app/store/DefinitionsSlice.ts";

const initialBungieUser = {
  supplementalDisplayName: "",
  iconPath: "",
  topLevelAccountMembershipId: "",
  profile: { membershipId: "", membershipType: 0, displayName: "" },
};

type Authenticating = "INITIALIZING" | "LOGIN-FLOW" | "AUTHENTICATED" | "NO-AUTHENTICATION";

export interface AuthenticationSlice {
  authenticated: Authenticating;
  authToken: AuthToken | null;
  bungieUser: BungieUser;
  systemDisabled: boolean;

  getTokenAsync: (errorMessage: string) => Promise<AuthToken | null>;
  initAuthentication: () => Promise<void>;
  setBungieUser: (bungieUser: BungieUser) => void;
  setSystemDisabled: (systemDisabled: boolean) => void;
  logoutCurrentUser: () => void;
  createAuthenticatedAccount: (url: string) => Promise<void>;
  cancelLogin: () => void;
  startedLoginFlow: () => void;
}

export const createAuthenticationSlice: StateCreator<
  AccountSlice & AuthenticationSlice & DefinitionsSlice,
  [],
  [],
  AuthenticationSlice
> = (set, get) => ({
  authenticated: "INITIALIZING",
  authToken: null,
  bungieUser: initialBungieUser,
  systemDisabled: false,

  getTokenAsync: async (errorMessage) => {
    const authToken = get().authToken;

    if (authToken) {
      const alreadyValid = isValidAccessToken(authToken);
      if (alreadyValid) {
        // Save time by quickly returning an already valid token
        return authToken;
      }

      // TODO: Handle system disabled
      // TODO: Handle "Refresh token expired"
      const validToken = await getTokenAsync(authToken, errorMessage);
      if (validToken) {
        const membershipId = get().bungieUser.profile.membershipId;
        saveToken(validToken, membershipId);
        set({ authToken: validToken, systemDisabled: false });
        return validToken;
      }
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
    }
  },
  setBungieUser: (bungieUser) => set({ bungieUser }),
  setSystemDisabled: (systemDisabled) => set({ systemDisabled }),
  logoutCurrentUser: () => {
    const membershipId = get().bungieUser.profile.membershipId;
    deleteUserData(membershipId);
    set({
      bungieUser: initialBungieUser,
      authToken: null,
      authenticated: "NO-AUTHENTICATION",
      armorPageData: [],
      generalPageData: [],
      weaponsPageData: [],
    });
  },
  createAuthenticatedAccount: async (url: string) => {
    try {
      const authToken = await urlToToken(url);
      const bungieUser = await getBungieAccount(authToken);
      set({ bungieUser, authToken, authenticated: "AUTHENTICATED" });
      saveToken(authToken, bungieUser.profile.membershipId);
      saveBungieUser(bungieUser);
    } catch (error) {
      console.error("Failed to create authenticated account", error);
      set({ authenticated: "NO-AUTHENTICATION" });
    }
  },
  cancelLogin: () => {
    set({ authenticated: "NO-AUTHENTICATION" });
  },
  startedLoginFlow: () => set({ authenticated: "LOGIN-FLOW" }),
});
