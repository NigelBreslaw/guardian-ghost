import AsyncStorage from "@react-native-async-storage/async-storage";
import { randomUUID } from "expo-crypto";
import { parse } from "expo-linking";
import * as WebBrowser from "expo-web-browser";
import * as v from "valibot";
import { clientID, redirectURL } from "../constants/env.ts";
import { Store } from "../constants/storage.ts";
import { RefreshToken, refreshTokenSchema } from "./Types.ts";
import { getAccessToken, getRefreshToken } from "./Utilities.ts";
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
  private authToken: RefreshToken | null;
  private dispatch: React.Dispatch<AuthAction> | null;
  private stateID: string;
  private usedAuthCodes: Array<string>;
  private currentAccount: BungieUser | null;
  private currentUserID: string;

  private constructor() {
    this.dispatch = null;
    this.stateID = "";
    this.authToken = null;
    this.usedAuthCodes = [];
    this.currentAccount = null;
    this.currentUserID = "";
    const p1 = performance.now();

    this.init()
      // .then((result) => {})
      .catch((e) => {
        console.info("No valid user and auth found");
      })
      .finally(() => {
        this.setInitComplete();
        const p2 = performance.now();
        console.log("took:", (p2 - p1).toFixed(4), "ms");
      });
  }

  public static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService();
    }

    return AuthService.instance;
  }

  init(): Promise<boolean> {
    return new Promise((resolve, reject) => {
      // Is there a current user?
      AsyncStorage.getItem(Store._bungie_user)
        .then((currentAccount) => {
          if (currentAccount === null) {
            return reject(false);
          }
          const validatedAccount = v.parse(BungieUserSchema, JSON.parse(currentAccount));
          this.setCurrentAccount(validatedAccount);

          // Then is there an auth token?
          AsyncStorage.getItem(`${this.currentUserID}${Store._refresh_token}`)
            .then((token) => {
              try {
                const stringToken = v.parse(v.string(), token);
                const validatedToken = v.parse(refreshTokenSchema, JSON.parse(stringToken));
                this.setAuthToken(validatedToken);
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

  // TODO: Make this check the current token if valid and if not get a new one and return that.
  // This also needs an async queue to handle multiple requests for the token.
  static getTokenAsync(): Promise<RefreshToken | null> {
    return new Promise((resolve, reject) => {
      if (AuthService.instance.authToken) {
        return resolve(AuthService.instance.authToken);
      }
      reject(AuthService.instance.authToken);
    });
  }

  // Method to subscribe to auth changes
  subscribe(dispatch: React.Dispatch<AuthAction>) {
    this.dispatch = dispatch;
  }

  // Method to unsubscribe from auth changes
  unsubscribe() {
    this.dispatch = null;
  }

  // Method to check if user data and auth token exist
  isAuthenticated(): boolean {
    const account = this.currentAccount;
    // TODO: This is wrong. It should use getTokenAsync so it needs to be async and whatever calls it should await.
    return account && this.authToken ? true : false;
  }

  // Method to get current user data
  getCurrentAccount(): BungieUser | null {
    return this.currentAccount;
  }

  setCurrentAccount(bungieUser: BungieUser | null) {
    this.currentAccount = bungieUser;
    if (bungieUser) {
      this.currentUserID = bungieUser.profile.membershipId;
    } else {
      this.currentUserID = "";
    }

    if (this.dispatch) {
      this.dispatch({ type: "setCurrentAccount", payload: bungieUser });
    } else {
      console.error("No dispatch");
    }
  }

  setAuthToken(token: RefreshToken | null) {
    this.authToken = token;
    if (this.dispatch) {
      this.dispatch({ type: "setAuthenticated", payload: this.isAuthenticated() });
    } else {
      console.error("No dispatch");
    }
  }

  setInitComplete() {
    if (this.dispatch) {
      this.dispatch({ type: "setInitComplete", payload: true });
    } else {
      console.error("No dispatch");
    }
  }

  startAuth(): void {
    this.stateID = randomUUID();
    const authURL = `https://www.bungie.net/en/oauth/authorize?client_id=${clientID}&response_type=code&reauth=true&state=${this.stateID}`;

    WebBrowser.openAuthSessionAsync(authURL, redirectURL).then((result) => {
      // Used for Web and Android
      if (result.type === "success") {
        this.processURL(result.url);
      }
    });
  }

  async processURL(url: string) {
    const { queryParams } = parse(url);

    if (queryParams?.code && queryParams?.state === this.stateID) {
      const code = queryParams.code.toString();

      // Ensure the same auth code can never be processed more than once. If it did the second
      // would fail with 'invalid_grand'.
      const codeExists = this.usedAuthCodes.some((usedCode) => usedCode === code);
      if (codeExists) {
        console.error("!Code already used");
        return;
      }

      this.usedAuthCodes.push(code);

      // If this fails the user needs to auth again. It isn't safe to retry as it can result in 'invalid_grand'.
      const initialJSONToken = await getRefreshToken(code);
      try {
        const validatedToken = v.parse(refreshTokenSchema, initialJSONToken);
        const fullToken = await getAccessToken(validatedToken);
        this.buildBungieAccount(fullToken);
      } catch (e) {
        console.error("Failed to validate token", e);
      }

      // validate the token
    } else {
      console.log("Invalid URL", url, this.stateID);
      return;
    }
  }

  async buildBungieAccount(authToken: RefreshToken) {
    if (authToken) {
      try {
        let rawLinkedProfiles = await getLinkedProfiles(authToken);
        let linkedProfiles = v.parse(linkedProfilesSchema, rawLinkedProfiles);

        if (linkedProfiles.Response.profiles.length === 0) {
          rawLinkedProfiles = await getLinkedProfiles(authToken, true);
          linkedProfiles = v.parse(linkedProfilesSchema, rawLinkedProfiles);
          console.error("NOT IMPLEMENTED SPECIAL ACCOUNT SUPPORT: Contact support@guardianghost.com");
        }

        if (linkedProfiles.Response.profiles.length === 0) {
          console.error("No linked profiles");
          return;
        }
        const bungieUser = getBungieUser(linkedProfiles);
        this.setCurrentAccount(bungieUser);
        AsyncStorage.setItem(Store._bungie_user, JSON.stringify(bungieUser));
        AsyncStorage.setItem(`${this.currentUserID}${Store._refresh_token}`, JSON.stringify(authToken));
        this.setAuthToken(authToken);
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
    console.log("logoutCurrentUser", AuthService.instance.currentUserID);
    try {
      await AsyncStorage.removeItem(Store._bungie_user);
      await AsyncStorage.removeItem(`${AuthService.instance.currentUserID}${Store._refresh_token}`);
      AuthService.instance.setAuthToken(null);
      AuthService.instance.setCurrentAccount(null);
    } catch (e) {
      throw new Error("Error removing current user from storage");
    }
  }

  cleanup() {
    this.unsubscribe();
  }
}

export default AuthService;
