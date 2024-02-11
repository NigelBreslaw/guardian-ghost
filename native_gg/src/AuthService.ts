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
  private userObservers: ((setUser: string) => void)[];
  private currentUser: string;

  private constructor() {
    console.log("auth init");
    this.observers = [];
    this.userObservers = [];

    this.authToken = null;
    this.currentUser = "";
    this.init()
      // .then((result) => {})
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
          this.currentUser = current_user;
          console.log("user!", this.currentUser);

          // Then is there an auth token?
          AsyncStorage.getItem(`${this.currentUser}_auth_token`)
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

  startAuth(): void {
    console.log("start auth");
  }

  // Method to subscribe to auth changes
  subscribeAuthenticated(fn: (setAuthenticated: boolean) => void): void {
    this.observers.push(fn);
    console.log("subscribed", this.observers.length);
  }

  // Method to unsubscribe from auth changes
  unsubscribeAuthenticated(fn: (isAuthenticated: boolean) => void): void {
    this.observers = this.observers.filter((subscriber) => subscriber !== fn);
    console.log("unsubscribe", this.observers.length);
  }

  subscribeUser(fn: (setUser: string) => void): void {
    this.userObservers.push(fn);
    console.log("subscribed users", this.userObservers.length);
  }

  unsubscribeUser(fn: (user: string) => void): void {
    this.userObservers = this.userObservers.filter((subscriber) => subscriber !== fn);
    console.log("unsubscribe users ", this.observers.length);
  }

  // Method to notify all subscribers of auth changes
  notify(): void {
    for (const observer of this.observers) {
      observer(this.isAuthenticated());
    }
    for (const observer of this.userObservers) {
      observer(this.getCurrentUser());
    }
  }

  // Method to check if user data and auth token exist
  isAuthenticated(): boolean {
    const user = this.currentUser;
    return user && this.authToken ? true : false;
  }

  // Method to get current user data
  getCurrentUser(): string {
    return this.currentUser;
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
