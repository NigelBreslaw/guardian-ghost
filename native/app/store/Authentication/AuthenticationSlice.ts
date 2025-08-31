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
} from "@/app/store/Authentication/AuthenticationLogic.ts";
import { isValidAccessToken, type AuthToken } from "@/app/store/Authentication/Utilities.ts";
import type { IStore } from "@/app/store/GGStore.ts";
import { BungieProfileSchema, type BungieMembershipProfiles, type LinkedProfiles } from "@/app/core/ApiResponse.ts";
import { getBungieUser } from "@/app/bungie/Account.ts";
import { safeParse } from "valibot";
import { InventoryPageEnums } from "@/app/inventory/logic/Helpers.ts";
import { removeAsyncStorageItem } from "@/app/store/DefinitionsSlice.ts";

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
  bungieMembershipProfiles: BungieMembershipProfiles; // Used only during Auth when multiple accounts are found
  systemDisabled: boolean;

  getTokenAsync: (errorMessage: string) => Promise<AuthToken | null>;
  initAuthentication: () => Promise<void>;
  setSystemDisabled: (systemDisabled: boolean) => void;
  logoutCurrentUser: () => Promise<void>;
  createAuthenticatedAccount: (url: string) => Promise<void>;
  cancelLogin: () => void;
  startedLoginFlow: () => void;
  setBungieMembershipProfiles: (bungieMembershipProfiles: BungieMembershipProfiles) => void;
  processBungieMembershipProfiles: (authToken: AuthToken, linkedProfiles: LinkedProfiles) => void;
  setSuccessfulLogin: (bungieUser: BungieUser) => void;
}

export const createAuthenticationSlice: StateCreator<IStore, [], [], AuthenticationSlice> = (set, get) => ({
  authenticated: "INITIALIZING",
  authToken: null,
  bungieUser: initialBungieUser,
  bungieMembershipProfiles: [],
  systemDisabled: false,

  getTokenAsync: async (errorMessage) => {
    if (get().authenticated === "DEMO-MODE") {
      return null;
    }

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
        const membershipId = bungieUser.profile.membershipId;
        const authToken = await loadToken(membershipId);
        if (authToken) {
          return set({ bungieUser, authToken, authenticated: "AUTHENTICATED" });
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
  logoutCurrentUser: async () => {
    set({
      bungieUser: initialBungieUser,
      authToken: null,
      authenticated: "NO-AUTHENTICATION",
      ggCharacters: [],
      ggArmor: [],
      ggWeapons: [],
      ggGeneral: [],
      responseMintedTimestamp: new Date(1977),
      secondaryComponentsMintedTimestamp: new Date(1977),
      bungieMembershipProfiles: [],
      currentInventoryPage: InventoryPageEnums.Weapons,
      currentListIndex: 0,
      previousDefinitionsSuccessfullyLoaded: false,
    });
    await removeAsyncStorageItem("CACHED_PROFILE");
    const membershipId = get().bungieUser.profile.membershipId;
    await deleteUserData(membershipId);
  },
  createAuthenticatedAccount: async (url: string) => {
    try {
      const authToken = await urlToToken(url);
      const linkedProfiles = await getBungieAccount(authToken);
      get().processBungieMembershipProfiles(authToken, linkedProfiles);
    } catch (error) {
      console.error("Failed to create authenticated account", error);
      // TODO: Show alert as login modal overlaps snackbar
      get().showSnackBar("Failed to create authenticated account");
    }
  },
  processBungieMembershipProfiles: (authToken: AuthToken, linkedProfiles: LinkedProfiles) => {
    set({ authToken });

    if (linkedProfiles.Response.profiles && linkedProfiles.Response.profiles.length === 1) {
      const bungieProfile = safeParse(BungieProfileSchema, linkedProfiles.Response.profiles[0]);
      if (bungieProfile.success) {
        const bungieUser = getBungieUser(bungieProfile.output);
        get().setSuccessfulLogin(bungieUser);
      } else {
        console.error("Failed to processBungieMembershipProfiles");
      }
    } else if (linkedProfiles.Response.profiles && linkedProfiles.Response.profiles?.length > 1) {
      get().setBungieMembershipProfiles(linkedProfiles.Response.profiles);
    } else {
      console.error("No profiles found");
      // TODO: Show alert as login modal overlaps snackbar
    }
  },
  setSuccessfulLogin: (bungieUser: BungieUser) => {
    const authToken = get().authToken;
    if (authToken) {
      set({
        bungieUser,
        authenticated: "AUTHENTICATED",
        bungieMembershipProfiles: [],
      });
      saveToken(authToken, bungieUser.profile.membershipId);
      saveBungieUser(bungieUser);
    } else {
      console.error("Unexpectedly no authToken");
    }
  },
  cancelLogin: () => {
    get().logoutCurrentUser();
  },
  startedLoginFlow: () => set({ authenticated: "LOGIN-FLOW" }),
  setBungieMembershipProfiles: (bungieMembershipProfiles) => {
    console.log("setBungieMembershipProfiles", bungieMembershipProfiles.length);
    set({ bungieMembershipProfiles });
  },
});
