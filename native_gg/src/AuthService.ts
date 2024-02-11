import { apiKey, clientID, clientSecret } from "./constants/env.ts";
import * as v from "valibot";
import * as base64 from "base-64";
import AsyncStorage from "@react-native-async-storage/async-storage";

interface User {
  membership_id: string;
  // Add other user properties as needed
}

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
  private observers: ((setAuthenticated: boolean) => void)[];
  private user: string | null;
  private foo: boolean;

  private constructor() {
    console.log("auth init");
    this.foo = false;
    this.observers = [];
    this.authToken = null;
    this.user = null;
    this.init()
      .then((result) => {
        this.foo = result;
      })
      .catch((e) => {
        console.log("No user or token found");
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
          this.user = current_user;
          console.log("user!", this.user);

          // Then is there an auth token?
          AsyncStorage.getItem(`${this.user}_auth_token`)
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
  subscribe(fn: (setAuthenticated: boolean) => void): void {
    this.observers.push(fn);
  }

  // Method to notify all subscribers of auth changes
  notify(): void {
    for (const observer of this.observers) {
      observer(this.isAuthenticated());
    }
  }

  // Method to check if user data and auth token exist
  isAuthenticated(): boolean {
    const user = this.user;
    return user && this.authToken ? true : false;
  }

  // Method to get current user data
  getCurrentUser(): User | null {
    const user = localStorage.getItem("currentUser");
    return user ? JSON.parse(user) : null;
  }

  // Method to set user data and auth token
  //   login(user: User, token: string): void {
  //     localStorage.setItem("currentUser", JSON.stringify(user));
  //     localStorage.setItem("authToken", token);
  //     this.authToken = token;
  //     this.notify();
  //   }

  // Method to clear user data and auth token
  //   logout(): void {
  //     localStorage.removeItem("currentUser");
  //     localStorage.removeItem("authToken");
  //     this.authToken = null;
  //     this.notify();
  //   }
}

export default AuthService;
