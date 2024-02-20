import AsyncStorage from "@react-native-async-storage/async-storage";
import { randomUUID } from "expo-crypto";
import { parse as linkingParse } from "expo-linking";
import * as WebBrowser from "expo-web-browser";
import { string, parse } from "valibot";
import { clientID, redirectURL } from "@/constants/env.ts";
import { Store } from "@/constants/storage.ts";
import {
  AuthToken,
  authTokenSchema,
  getAccessToken,
  getRefreshToken,
  isValidAccessToken,
  isValidRefreshToken,
} from "./Utilities.ts";
import {
  BungieUser,
  BungieUserSchema,
  getBungieUser,
  getLinkedProfiles,
  linkedProfilesSchema,
} from "../account/Account.ts";
import { AuthAction } from "../state/Actions.ts";

class AuthService {
  private static instance: AuthService;
  private static authToken: AuthToken | null = null;
  private static dispatch: React.Dispatch<AuthAction> | null = null;
  private static stateID = "";
  private static usedAuthCodes: Array<string> = [];
  private static currentAccount: BungieUser | null = null;
  private static currentUserID = "";

  private constructor() {
    const p1 = performance.now();

    this.init()
      .catch((e) => {
        console.info("No valid user and auth found");
      })
      .finally(() => {
        this.setInitComplete();
        const p2 = performance.now();
        console.log("init() took:", (p2 - p1).toFixed(4), "ms");
      });
  }

  public static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService();
    }

    return AuthService.instance;
  }

  private init(): Promise<boolean> {
    return new Promise((resolve, reject) => {
      // Is there a current user?
      AsyncStorage.getItem(Store._bungie_user)
        .then((currentAccount) => {
          if (currentAccount === null) {
            return reject(false);
          }
          const validatedAccount = parse(BungieUserSchema, JSON.parse(currentAccount));
          AuthService.setCurrentAccount(validatedAccount);

          // Then is there an auth token?
          AsyncStorage.getItem(`${AuthService.currentUserID}${Store._refresh_token}`)
            .then((token) => {
              try {
                const stringToken = parse(string(), token);
                const validatedToken = parse(authTokenSchema, JSON.parse(stringToken));
                AuthService.validateAndSetToken(validatedToken);
                return resolve(true);
              } catch (error) {
                console.log(error);
                return reject(false);
              }
            })
            .catch((e) => {
              console.error(e);
              reject(false);
            });
        })
        .catch((e) => {
          console.error(e);
          reject(false);
        });
    });
  }

  // TODO: This also needs an async queue to handle multiple requests for the token.
  static getTokenAsync(): Promise<AuthToken | null> {
    return new Promise((resolve, reject) => {
      if (AuthService.authToken) {
        AuthService.validateAndSetToken(AuthService.authToken)
          .then(() => {
            return resolve(AuthService.authToken);
          })
          .catch((e) => {
            console.error("Failed to validate token", e);
            return reject(null);
          });
      } else {
        return reject(null);
      }
    });
  }

  // This function validates, gets refreshed tokens, saves and sets them.
  private static validateAndSetToken(token: AuthToken): Promise<boolean> {
    return new Promise((resolve, reject) => {
      let validToken = token;

      const isValidRefresh = isValidRefreshToken(token);
      if (!isValidRefresh) {
        // Nothing can be done. The user needs to re-auth.
        console.error("Refresh token expired");
        return reject(false);
      }

      const isValidAccess = isValidAccessToken(token);
      if (!isValidAccess) {
        getAccessToken(token)
          .then((newAuthToken) => {
            validToken = newAuthToken;
          })
          .catch((e) => {
            return reject(e);
          });
      }

      AuthService.saveAndSetToken(validToken);

      return resolve(true);
    });
  }

  private static saveAndSetToken(token: AuthToken) {
    const currentUserID = AuthService.currentUserID;
    AsyncStorage.setItem(`${currentUserID}${Store._refresh_token}`, JSON.stringify(token));
    AuthService.setAuthToken(token);
  }

  // Method to subscribe to auth changes
  subscribe(dispatch: React.Dispatch<AuthAction>) {
    AuthService.dispatch = dispatch;
  }

  // Method to unsubscribe from auth changes
  unsubscribe() {
    AuthService.dispatch = null;
  }

  // Method to check if user data and auth token exist
  static isAuthenticated(): boolean {
    // TODO: This is wrong. It should use getTokenAsync so it needs to be async and whatever calls it should await.
    return AuthService.currentAccount && AuthService.authToken ? true : false;
  }

  // Method to get current user data
  static getCurrentAccount(): BungieUser | null {
    return AuthService.currentAccount;
  }
  static setCurrentAccount(bungieUser: BungieUser | null) {
    AuthService.currentAccount = bungieUser;
    if (bungieUser) {
      AuthService.currentUserID = bungieUser.profile.membershipId;
    } else {
      AuthService.currentUserID = "";
    }

    if (AuthService.dispatch) {
      AuthService.dispatch({ type: "setCurrentAccount", payload: bungieUser });
    } else {
      console.error("No dispatch");
    }
  }

  private static setAuthToken(token: AuthToken | null) {
    AuthService.authToken = token;

    const dispatch = AuthService.dispatch;
    if (dispatch) {
      dispatch({ type: "setAuthenticated", payload: AuthService.isAuthenticated() });
    } else {
      console.error("No dispatch");
    }
  }

  setInitComplete() {
    if (AuthService.dispatch) {
      AuthService.dispatch({ type: "setInitComplete", payload: true });
    } else {
      console.error("No dispatch");
    }
  }

  static startAuth(): void {
    AuthService.stateID = randomUUID();
    const authURL = `https://www.bungie.net/en/oauth/authorize?client_id=${clientID}&response_type=code&reauth=true&state=${AuthService.stateID}`;

    WebBrowser.openAuthSessionAsync(authURL, redirectURL).then((result) => {
      // Used for Web and Android
      if (result.type === "success") {
        AuthService.processURL(result.url);
      }
    });
  }

  static async processURL(url: string) {
    const { queryParams } = linkingParse(url);

    if (queryParams?.code && queryParams?.state === AuthService.stateID) {
      const code = queryParams.code.toString();

      // Ensure the same auth code can never be processed more than once. If it did the second
      // would fail with 'invalid_grand'.
      const codeExists = AuthService.usedAuthCodes.some((usedCode) => usedCode === code);
      if (codeExists) {
        console.error("!Code already used");
        return;
      }

      AuthService.usedAuthCodes.push(code);

      // If this fails the user needs to auth again. It isn't safe to retry as it can result in 'invalid_grand'.
      const initialJSONToken = await getRefreshToken(code);
      try {
        const validatedToken = parse(authTokenSchema, initialJSONToken);
        const fullToken = await getAccessToken(validatedToken);
        AuthService.buildBungieAccount(fullToken);
      } catch (e) {
        console.error("Failed to validate token", e);
      }

      // validate the token
    } else {
      console.log("Invalid URL", url, AuthService.stateID);
      return;
    }
  }

  static async buildBungieAccount(authToken: AuthToken) {
    if (authToken) {
      try {
        let rawLinkedProfiles = await getLinkedProfiles(authToken);
        let linkedProfiles = parse(linkedProfilesSchema, rawLinkedProfiles);

        if (linkedProfiles.Response.profiles.length === 0) {
          rawLinkedProfiles = await getLinkedProfiles(authToken, true);
          linkedProfiles = parse(linkedProfilesSchema, rawLinkedProfiles);
          console.error("NOT IMPLEMENTED SPECIAL ACCOUNT SUPPORT: Contact support@guardianghost.com");
        }

        if (linkedProfiles.Response.profiles.length === 0) {
          console.error("No linked profiles");
          return;
        }
        const bungieUser = getBungieUser(linkedProfiles);
        AuthService.setCurrentAccount(bungieUser);
        AsyncStorage.setItem(Store._bungie_user, JSON.stringify(bungieUser));
        AuthService.validateAndSetToken(authToken);
      } catch (e) {
        // This is a catastrophic failure. The user is logged in but we can't get their linked profiles.
        // It needs some kind of big alert and then a logout.
        console.error("Error in buildBungieAccount", e);
      }
    }
  }

  // This does not delete everything. Logging out should still leave user data behind for when they log back in.
  // The 'logout' might simply be the app not being used for so long it needs re-authentication.
  static async logoutCurrentUser() {
    console.log("logoutCurrentUser", AuthService.currentUserID);
    try {
      await AsyncStorage.removeItem(Store._bungie_user);
      await AsyncStorage.removeItem(`${AuthService.currentUserID}${Store._refresh_token}`);
      AuthService.setAuthToken(null);
      AuthService.setCurrentAccount(null);
    } catch (e) {
      throw new Error("Error removing current user from storage");
    }
  }

  cleanup() {
    this.unsubscribe();
  }
}

export default AuthService;
