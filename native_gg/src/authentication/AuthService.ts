import AsyncStorage from "@react-native-async-storage/async-storage";
import { randomUUID } from "expo-crypto";
import { parse } from "expo-linking";
import * as WebBrowser from "expo-web-browser";
import * as v from "valibot";
import { clientID, redirectURL } from "../constants/env.ts";
import { Store } from "../constants/storage.ts";
import { AppAction } from "../state/Actions.ts";
import { RefreshToken, refreshTokenSchema } from "./Types.ts";
import { getAccessToken, getRefreshToken } from "./Utilities.ts";

class AuthService {
  private static instance: AuthService;
  private authToken: RefreshToken | null;
  private dispatch: React.Dispatch<AppAction> | null;
  private currentUserID: string;
  private stateID: string;
  private usedAuthCodes: Array<string>;

  private constructor() {
    this.dispatch = null;
    this.stateID = "";
    this.authToken = null;
    this.currentUserID = "";
    this.usedAuthCodes = [];
    const p1 = performance.now();

    this.init()
      // .then((result) => {})
      .catch((e) => {
        console.info("No valid user and auth found");
      })
      .finally(() => {
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
      AsyncStorage.getItem(Store.current_user_ID)
        .then((current_user) => {
          if (current_user === null) {
            return reject(false);
          }
          this.setCurrentUser(current_user);
          console.log("user!", this.currentUserID);

          // Then is there an auth token?
          AsyncStorage.getItem(`${this.currentUserID}${Store._refresh_token}`)
            .then((token) => {
              console.log("token!", token !== null);

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

  static getTokenAsync(): Promise<RefreshToken | null> {
    return new Promise((resolve, reject) => {
      if (AuthService.instance.authToken) {
        return resolve(AuthService.instance.authToken);
      }
      reject(AuthService.instance.authToken);
    });
  }

  // Method to subscribe to auth changes
  subscribe(dispatch: React.Dispatch<AppAction>) {
    this.dispatch = dispatch;
  }

  // Method to unsubscribe from auth changes
  unsubscribe() {
    this.dispatch = null;
  }

  // Method to check if user data and auth token exist
  isAuthenticated(): boolean {
    const user = this.currentUserID;
    // console.log("isAuthenticated", user, this.authToken);
    return user && this.authToken ? true : false;
  }

  // Method to get current user data
  getCurrentUser(): string {
    return this.currentUserID;
  }

  setCurrentUser(membership_id: string) {
    this.currentUserID = membership_id;
    if (this.dispatch) {
      this.dispatch({ type: "setCurrentUserID", payload: membership_id });
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
        this.setCurrentUser(validatedToken.membership_id);

        AsyncStorage.setItem(Store.current_user_ID, validatedToken.membership_id)
          .then(() => console.log("saved new user ID"))
          .catch((e) => {
            console.error("Failed to save user ID", e);
          });

        const fullToken = await getAccessToken(validatedToken);
        console.log("save", `${this.currentUserID}${Store._refresh_token}`);
        AsyncStorage.setItem(`${this.currentUserID}${Store._refresh_token}`, JSON.stringify(fullToken))
          .then(() => this.setAuthToken(fullToken))
          .catch((e) => {
            console.error("Failed to save token", e);
          });
      } catch (e) {
        console.error("Failed to validate token", e);
      }

      // validate the token
    } else {
      console.log("Invalid URL", url, this.stateID);
      return;
    }
  }

  // This does not delete everything. Logging out should still leave user data behind for when they log back in.
  // The 'logout' might simply be the app not being used for so long it needs re-authentication.
  static async logoutCurrentUser() {
    console.log("logoutCurrentUser", AuthService.instance.currentUserID);
    try {
      await AsyncStorage.removeItem(Store.current_user_ID);
      await AsyncStorage.removeItem(`${AuthService.instance.currentUserID}${Store._refresh_token}`);
      AuthService.instance.setAuthToken(null);
      AuthService.instance.setCurrentUser("");
    } catch (e) {
      throw new Error("Error removing current user from storage");
    }
  }

  cleanup() {
    this.unsubscribe();
  }
}

export default AuthService;
