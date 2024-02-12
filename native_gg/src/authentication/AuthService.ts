import AsyncStorage from "@react-native-async-storage/async-storage";
import { randomUUID } from "expo-crypto";
import { parse } from "expo-linking";
import * as WebBrowser from "expo-web-browser";
import * as v from "valibot";
import { getRefreshToken } from "./Utilities.ts";
import { clientID, redirectURL } from "../constants/env.ts";
import { AppAction } from "../state/Actions.ts";

const refreshTokenSchema = v.object({
  access_token: v.string(),
  expires_in: v.number(),
  membership_id: v.string(),
  refresh_expires_in: v.number(),
  refresh_token: v.string(),
  time_stamp: v.optional(v.string([v.isoTimestamp()])),
  token_type: v.string(),
});

type RefreshToken = v.Output<typeof refreshTokenSchema>;

class AuthService {
  private static instance: AuthService;
  private authToken: RefreshToken | null;
  private dispatch: React.Dispatch<AppAction> | null;
  private userObservers: ((setUser: string) => void)[];
  private currentUserID: string;
  private stateID: string;
  private usedAuthCodes: Array<string>;

  private constructor() {
    this.dispatch = null;
    this.userObservers = [];
    this.stateID = "";
    this.authToken = null;
    this.currentUserID = "";
    this.usedAuthCodes = [];
    this.init()
      // .then((result) => {})
      .catch((e) => {
        console.log("No valid user and auth found");
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
      AsyncStorage.getItem("current_user")
        .then((current_user) => {
          if (current_user === null) {
            return reject(false);
          }
          this.currentUserID = current_user;
          console.log("user!", this.currentUserID);

          // Then is there an auth token?
          AsyncStorage.getItem(`${this.currentUserID}_auth_token`)
            .then((token) => {
              console.log("token!", token);
              resolve(true);
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
      } catch (e) {
        console.error("Failed to validate token", e);
      }

      // validate the token
    } else {
      console.log("Invalid URL", url, this.stateID);
      return;
    }
  }
}

export default AuthService;
