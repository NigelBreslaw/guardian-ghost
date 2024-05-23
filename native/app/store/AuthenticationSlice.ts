import type { StateCreator } from "zustand";

import type { BungieUser } from "@/app/inventory/logic/Types.ts";
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
import type { IStore } from "@/app/store/GGStore.ts";

const initialBungieUser = {
  supplementalDisplayName: "",
  iconPath: "",
  topLevelAccountMembershipId: "",
  profile: { membershipId: "", membershipType: 0, displayName: "" },
};

type Authenticating = "INITIALIZING" | "LOGIN-FLOW" | "AUTHENTICATED" | "NO-AUTHENTICATION" | "DEMO-MODE";

export interface AuthenticationSlice {
  authenticated: Authenticating;
  authToken: AuthToken | null;
  bungieUser: BungieUser;
  systemDisabled: boolean;

  getTokenAsync: (errorMessage: string) => Promise<AuthToken | null>;
  initAuthentication: () => Promise<void>;
  setSystemDisabled: (systemDisabled: boolean) => void;
  logoutCurrentUser: () => void;
  createAuthenticatedAccount: (url: string) => Promise<void>;
  cancelLogin: () => void;
  startedLoginFlow: () => void;
}

export const createAuthenticationSlice: StateCreator<IStore, [], [], AuthenticationSlice> = (set, get) => ({
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
      const validToken = await getTokenAsync(get, authToken, errorMessage);
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
      get().logoutCurrentUser();
    } catch (error) {
      console.log("An error occurred:", error);

      get().logoutCurrentUser();
    }
  },
  setSystemDisabled: (systemDisabled) => set({ systemDisabled }),
  logoutCurrentUser: () => {
    const membershipId = get().bungieUser.profile.membershipId;
    deleteUserData(membershipId);
    set({
      bungieUser: initialBungieUser,
      authToken: null,
      authenticated: "NO-AUTHENTICATION",
      ggCharacters: [],
      responseMintedTimestamp: new Date(1977),
      secondaryComponentsMintedTimestamp: new Date(1977),
    });
  },
  createAuthenticatedAccount: async (url: string) => {
    try {
      const authToken = await urlToToken(url);
      const bungieUser = await getBungieAccount(authToken);
      set({
        bungieUser,
        authToken,
        authenticated: "AUTHENTICATED",
      });
      saveToken(authToken, bungieUser.profile.membershipId);
      saveBungieUser(bungieUser);
    } catch (error) {
      console.error("Failed to create authenticated account", error);
      get().showSnackBar("Failed to create authenticated account");
    }
  },
  cancelLogin: () => {
    get().logoutCurrentUser();
  },
  startedLoginFlow: () => set({ authenticated: "LOGIN-FLOW" }),
});
