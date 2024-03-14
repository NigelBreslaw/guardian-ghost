import { clientID, redirectURL } from "@/constants/env.ts";
import { Store } from "@/constants/storage.ts";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { randomUUID } from "expo-crypto";
import { parse as linkingParse } from "expo-linking";
import * as WebBrowser from "expo-web-browser";
import { Platform } from "react-native";
import { object, parse, safeParse, string } from "valibot";
import { getBungieUser, getLinkedProfiles } from "../bungie/Account.ts";
import { type BungieUser, BungieUserSchema, linkedProfilesSchema } from "../bungie/Types.ts";
import type { GlobalAction } from "@/state/Types.ts";
import {
  type AuthToken,
  authTokenSchema,
  getAccessToken,
  getRefreshToken,
  isValidAccessToken,
  isValidRefreshToken,
} from "./Utilities.ts";

class AuthService {
  private static instance: AuthService;
  private static authToken: AuthToken | null = null;
  private static dispatch: React.Dispatch<GlobalAction> | null = null;
  private static stateID = "";
  private static usedAuthCodes: Array<string> = [];
  private static currentAccount: BungieUser | null = null;
  private static currentUserID = "";
  private static queue: (() => Promise<void>)[] = [];
  private static isProcessing = false;

  private constructor() {
    this.init()
      .then(() => {
        this.setInitComplete();
      })
      .catch((e) => {
        console.info("No valid user and auth found");
        this.setInitComplete();
      });
  }

  public static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService();
    }

    return AuthService.instance;
  }

  private async init(): Promise<boolean> {
    try {
      const p1 = performance.now();

      const savedAccount = await AsyncStorage.getItem(Store._bungie_user);
      if (savedAccount) {
        const validatedAccount = parse(BungieUserSchema, JSON.parse(savedAccount));
        AuthService.setCurrentAccount(validatedAccount);
      } else {
        return false;
      }

      const savedToken = await AsyncStorage.getItem(`${AuthService.currentUserID}${Store._refresh_token}`);
      if (savedToken) {
        const tokenParse = safeParse(authTokenSchema, JSON.parse(savedToken));
        if (tokenParse.success) {
          await AuthService.validateAndSetToken(tokenParse.output);
          const p2 = performance.now();
          console.log("init() took:", (p2 - p1).toFixed(4), "ms");
          return true;
        }
      }
      // Logout as the saved token is invalid
      AuthService.logoutCurrentUser();
      return false;
    } catch (e) {
      console.error(e);
      return false;
    }
  }

  // Your async function that retrieves queued results
  public static getTokenAsync(errorMessage: string): Promise<AuthToken | null> {
    return new Promise((resolve, reject) => {
      // Function to add a new request to the queue
      const enqueue = () => {
        console.log("getTokenAsync queue length:", AuthService.queue.length);
        AuthService.queue.push(async () => {
          try {
            const result = await AuthService.getTokenInternal(errorMessage);

            resolve(result);
          } catch (error) {
            reject(null);
          } finally {
            processNext();
          }
        });
        if (!AuthService.isProcessing) {
          processNext();
        }
      };

      const processNext = () => {
        if (AuthService.queue.length > 0) {
          AuthService.isProcessing = true;
          const next = AuthService.queue.shift();
          next?.();
        } else {
          AuthService.isProcessing = false;
        }
      };

      enqueue();
    });
  }

  private static getTokenInternal(errorMessage: string): Promise<AuthToken | null> {
    return new Promise((resolve, reject) => {
      if (AuthService.authToken) {
        AuthService.validateAndSetToken(AuthService.authToken)
          .then(() => {
            const token = AuthService.authToken;
            if (token) {
              return resolve(token);
            }

            return reject(null);
          })
          .catch((e) => {
            console.error("Failed to validate token", errorMessage, e);

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
      const isValidRefresh = isValidRefreshToken(token);
      if (!isValidRefresh) {
        // Nothing can be done. The user needs to re-auth.
        // TODO: Log out the user
        console.error("Refresh token expired");
        AuthService.logoutCurrentUser();
        return reject(false);
      }

      const isValidAccess = isValidAccessToken(token);
      if (!isValidAccess) {
        console.info("Access token expired");
        getAccessToken(token)
          .then((newAuthToken) => {
            const parsedToken = safeParse(authTokenSchema, newAuthToken);

            if (parsedToken.success) {
              console.info("Retrieved new token");
              AuthService.saveAndSetToken(parsedToken.output);
              if (AuthService.dispatch) {
                AuthService.dispatch({ type: "setSystemDisabled", payload: false });
              }
              return resolve(true);
            }

            const parsedError = safeParse(object({ error: string(), error_description: string() }), newAuthToken);
            if (parsedError.success && parsedError.output.error_description === "SystemDisabled") {
              console.warn("System disabled");
              if (AuthService.dispatch) {
                AuthService.dispatch({ type: "setSystemDisabled", payload: true });
              }
              return resolve(true);
            }
            // Don't log the user out, but maybe show an error and give them a chance to logout and back in again?
            console.error("Failed to validate token", newAuthToken);
            return reject(false);
          })
          .catch((e) => {
            return reject(e);
          });
      } else {
        console.info("Access token valid");
        AuthService.saveAndSetToken(token);

        return resolve(true);
      }
    });
  }

  private static saveAndSetToken(token: AuthToken) {
    const parsedToken = safeParse(authTokenSchema, token);

    if (parsedToken.success) {
      const currentUserID = AuthService.currentUserID;
      if (currentUserID === "") {
        console.error("No currentUserID!!!");
      } else {
        console.info("currentUserID", currentUserID);
        AsyncStorage.setItem(`${currentUserID}${Store._refresh_token}`, JSON.stringify(token));
        AuthService.setAuthToken(token);
      }
    } else {
      console.error("Failed to save token. Token is invalid");
    }
  }

  // Method to subscribe to auth changes
  static subscribe(dispatch: React.Dispatch<GlobalAction>) {
    AuthService.dispatch = dispatch;
  }

  // Method to unsubscribe from auth changes
  static unsubscribe() {
    AuthService.dispatch = null;
  }

  // Method to check if user data and auth token exist
  static isAuthenticated(): boolean {
    // TODO: This is wrong. It should use getTokenAsync so it needs to be async and whatever calls it should await.
    return AuthService.authToken ? true : false;
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
      console.info("setCurrentAccount: No dispatch");
    }
  }

  private static setAuthToken(token: AuthToken | null) {
    AuthService.authToken = token;

    if (AuthService.dispatch) {
      AuthService.dispatch({ type: "setAuthenticated", payload: AuthService.isAuthenticated() });
    } else {
      console.info("setAuthToken: No dispatch");
    }
  }

  setInitComplete() {
    if (AuthService.dispatch) {
      AuthService.dispatch({ type: "setInitComplete", payload: true });
    } else {
      console.info("setInitComplete: No dispatch");
    }
  }

  static setLoggingIn(loggingIn: boolean) {
    if (AuthService.dispatch) {
      AuthService.dispatch({ type: "setLoggingIn", payload: loggingIn });
    } else {
      console.info("setLoggingIn: No dispatch");
    }
  }

  static startAuth(): void {
    AuthService.setLoggingIn(true);
    AuthService.stateID = randomUUID();
    const authURL = `https://www.bungie.net/en/oauth/authorize?client_id=${clientID}&response_type=code&reauth=true&state=${AuthService.stateID}`;

    WebBrowser.openAuthSessionAsync(authURL, redirectURL)
      .then((result) => {
        // Used for Web and Android
        if (result.type === "success") {
          AuthService.processURL(result.url);
        } else if (result.type === "dismiss") {
          // iOS only on universal link callback
          if (Platform.OS === "android") {
            // User probably went back from the login webview without completing auth flow
            console.info("Failed to complete auth session", result);
            AuthService.setLoggingIn(false);
          }
        } else {
          // Used for all platforms
          console.info("Failed to open auth session", result);
          AuthService.setLoggingIn(false);
        }
      })
      .catch((e) => {
        console.error("login issue?", e);
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

      try {
        const initialJSONToken = await getRefreshToken(code);
        AuthService.buildBungieAccount(initialJSONToken);
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
      let rawLinkedProfiles = await getLinkedProfiles(authToken);
      let parsedProfiles = safeParse(linkedProfilesSchema, rawLinkedProfiles);

      if (parsedProfiles.success && parsedProfiles.output.Response.profiles?.length === 0) {
        rawLinkedProfiles = await getLinkedProfiles(authToken, true);
        parsedProfiles = safeParse(linkedProfilesSchema, rawLinkedProfiles);
        console.error("NOT IMPLEMENTED SPECIAL ACCOUNT SUPPORT: Contact support@guardianghost.com");
      }

      if (parsedProfiles.success && parsedProfiles.output.Response.profiles?.length === 0) {
        console.error("No linked profiles");
        return;
      }

      if (parsedProfiles.success) {
        const bungieUser = getBungieUser(parsedProfiles.output);
        AuthService.setCurrentAccount(bungieUser);
        await AsyncStorage.setItem(Store._bungie_user, JSON.stringify(bungieUser));
        AuthService.saveAndSetToken(authToken);
        AuthService.setLoggingIn(false);
        return;
      }
      // This is a catastrophic failure. The user is logged in but we can't get their linked profiles.
      // It needs some kind of big alert and then a logout.
      console.error("Error in buildBungieAccount", parsedProfiles.output);
      AuthService.setLoggingIn(false);
    }
  }

  // This does not delete everything. Logging out should still leave user data behind for when they log back in.
  // The 'logout' might simply be the app not being used for so long it needs re-authentication.
  static async logoutCurrentUser() {
    console.info("logoutCurrentUser");
    try {
      await AsyncStorage.removeItem(Store._bungie_user);
      await AsyncStorage.removeItem(`${AuthService.currentUserID}${Store._refresh_token}`);
      AuthService.setAuthToken(null);
      AuthService.setCurrentAccount(null);
      AuthService.currentUserID = "";
    } catch (e) {
      throw new Error("Error removing current user from storage");
    }
  }

  static cleanUp() {
    AuthService.unsubscribe();
  }
}

export default AuthService;
