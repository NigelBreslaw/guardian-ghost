import {
  isValidRefreshToken,
  type AuthToken,
  isValidAccessToken,
  getAccessToken,
  authTokenSchema,
} from "@/app/authentication/Utilities.ts";
import { useGGStore } from "@/app/store/GGStore.ts";
import { Store } from "@/constants/storage.ts";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { object, safeParse, string } from "valibot";
import type { StateCreator } from "zustand";

export interface AuthenticationSlice {
  authenticated: boolean;
  setAuthenticated: () => void;
  setNotAuthenticated: () => void;
  loggingIn: boolean;
  setLoggingIn: (loggingIn: boolean) => void;
  getTokenAsync: (errorMessage: string) => Promise<AuthToken | null>;
}

export const createAuthenticationSlice: StateCreator<AuthenticationSlice> = (set) => ({
  authenticated: false,
  loggingIn: false,
  setAuthenticated: () => set({ authenticated: true }),
  setNotAuthenticated: () => set({ authenticated: false }),
  setLoggingIn: (payload) => set({ loggingIn: payload }),
  getTokenAsync,
});

const queue: (() => Promise<void>)[] = [];
let isProcessing = false;
let authToken: AuthToken | null = null;
let currentUserID = "";
let currentAccount: BungieUser | null = null;

function getTokenAsync(errorMessage: string): Promise<AuthToken | null> {
  return new Promise((resolve, reject) => {
    // Function to add a new request to the queue
    const enqueue = () => {
      console.log("getTokenAsync queue length:", queue.length);
      queue.push(async () => {
        try {
          const result = await getTokenInternal(errorMessage);

          resolve(result);
        } catch {
          reject(null);
        } finally {
          processNext();
        }
      });
      if (!isProcessing) {
        processNext();
      }
    };

    const processNext = () => {
      if (queue.length > 0) {
        isProcessing = true;
        const next = queue.shift();
        next?.();
      } else {
        isProcessing = false;
      }
    };

    enqueue();
  });
}

function getTokenInternal(errorMessage: string): Promise<AuthToken | null> {
  return new Promise((resolve, reject) => {
    if (authToken) {
      validateAndSetToken(authToken)
        .then(() => {
          const token = authToken;
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

function validateAndSetToken(token: AuthToken): Promise<boolean> {
  return new Promise((resolve, reject) => {
    const isValidRefresh = isValidRefreshToken(token);
    if (!isValidRefresh) {
      // Nothing can be done. The user needs to re-auth.
      // TODO: Log out the user
      console.error("Refresh token expired");
      logoutCurrentUser();
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
            saveAndSetToken(parsedToken.output);
            useGGStore.getState().setSystemDisabled(false);
            return resolve(true);
          }

          const parsedError = safeParse(object({ error: string(), error_description: string() }), newAuthToken);
          if (parsedError.success && parsedError.output.error_description === "SystemDisabled") {
            console.warn("System disabled");
            useGGStore.getState().setSystemDisabled(true);
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
      saveAndSetToken(token);

      return resolve(true);
    }
  });
}

function saveAndSetToken(token: AuthToken) {
  const parsedToken = safeParse(authTokenSchema, token);

  if (parsedToken.success) {
    if (currentUserID === "") {
      console.error("No currentUserID!!!");
    } else {
      AsyncStorage.setItem(`${currentUserID}${Store._refresh_token}`, JSON.stringify(token));
      setAuthToken(token);
    }
  } else {
    console.error("Failed to save token. Token is invalid");
  }
}

// Method to check if user data and auth token exist
function isAuthenticated(): boolean {
  // TODO: This is wrong. It should use getTokenAsync so it needs to be async and whatever calls it should await.
  return authToken ? true : false;
}

function setAuthToken(token: AuthToken | null) {
  authToken = token;

  const authenticated = isAuthenticated();
  if (authenticated) {
    useGGStore.getState().setAuthenticated();
  } else {
    useGGStore.getState().setNotAuthenticated();
  }
}

async function logoutCurrentUser() {
  console.info("logoutCurrentUser");
  try {
    useGGStore.getState().setNotAuthenticated();
    await AsyncStorage.removeItem(Store._bungie_user);
    await AsyncStorage.removeItem(`${currentUserID}${Store._refresh_token}`);
    authToken = null;
    currentUserID = "";
  } catch {
    throw new Error("Error removing current user from storage");
  }
}
