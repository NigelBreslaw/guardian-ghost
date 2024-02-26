import { clientID, redirectURL } from "@/constants/env.ts";
import { Store } from "@/constants/storage.ts";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { randomUUID } from "expo-crypto";
import { parse as linkingParse } from "expo-linking";
import * as WebBrowser from "expo-web-browser";
import { parse, string } from "valibot";
import { getBungieUser, getLinkedProfiles } from "../bungie/Account.ts";
import { BungieUser, BungieUserSchema, linkedProfilesSchema } from "../bungie/Types.ts";
import { GlobalAction } from "../state/Types.ts";
import {
  AuthToken,
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

  // Your async function that retrieves queued results
  public static getTokenAsync(errorMessage: string): Promise<AuthToken | null> {
    return new Promise((resolve, reject) => {
      // Function to add a new request to the queue
      const enqueue = () => {
        AuthService.queue.push(async () => {
          try {
            const result = await AuthService.getTokenInternal(errorMessage);

            console.log("got result?");
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
      console.log("getTokenAsync queue length:", AuthService.queue.length);
      enqueue(); // Enqueue the current request
    });
  }

  private static getTokenInternal(errorMessage: string): Promise<AuthToken | null> {
    return new Promise((resolve, reject) => {
      if (AuthService.authToken) {
        AuthService.validateAndSetToken(AuthService.authToken)
          .then(() => {
            const token = AuthService.authToken;
            if (token) {
              resolve(token);
            } else {
              reject(null);
            }
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
    console.log("saveAndSetToken");
    const currentUserID = AuthService.currentUserID;
    AsyncStorage.setItem(`${currentUserID}${Store._refresh_token}`, JSON.stringify(token));
    AuthService.setAuthToken(token);
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
      AuthService.dispatch({ type: "setAppReady", payload: true });
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
      const initialJSONToken = await getRefreshToken(code);
      try {
        const validatedToken = parse(authTokenSchema, initialJSONToken);
        const fullToken = await getAccessToken(validatedToken);
        AuthService.saveAndSetToken(fullToken);
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
        await AsyncStorage.setItem(Store._bungie_user, JSON.stringify(bungieUser));
        AuthService.setLoggingIn(false);
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
    console.info("logoutCurrentUser");
    try {
      await AsyncStorage.removeItem(Store._bungie_user);
      await AsyncStorage.removeItem(`${AuthService.currentUserID}${Store._refresh_token}`);
      AuthService.setAuthToken(null);
      AuthService.setCurrentAccount(null);
    } catch (e) {
      throw new Error("Error removing current user from storage");
    }
  }

  static cleanUp() {
    AuthService.unsubscribe();
  }
}

export default AuthService;
