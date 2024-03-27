import { BungieUserSchema, type BungieUser, linkedProfilesSchema } from "@/app/bungie/Types.ts";
// import { useGGStore } from "@/app/store/GGStore.ts";
import {
  authTokenSchema,
  isValidAccessToken,
  isValidRefreshToken,
  type AuthToken,
  getAccessToken,
  getRefreshToken,
} from "@/app/store/Utilities.ts";
import { Store } from "@/constants/storage.ts";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { object, safeParse, string } from "valibot";
import { parse as linkingParse } from "expo-linking";
import { getBungieUser, getLinkedProfiles } from "@/app/bungie/Account.ts";
import { randomUUID } from "expo-crypto";
import * as WebBrowser from "expo-web-browser";
import { clientID, redirectURL } from "@/constants/env.ts";
import { Platform } from "react-native";

const queue: (() => Promise<void>)[] = [];
let isProcessing = false;
let stateID = "";
const usedAuthCodes: Array<string> = [];

export async function loadBungieUser(): Promise<BungieUser | null> {
  const savedAccount = await AsyncStorage.getItem(Store._bungie_user);
  if (savedAccount) {
    const validatedAccount = safeParse(BungieUserSchema, JSON.parse(savedAccount));
    if (validatedAccount.success) {
      return validatedAccount.output;
    }
    throw new Error("Validation failed");
    // Logout as the saved token is invalid
    // logoutCurrentUser();
  }
  throw new Error("No saved account found");
}

export async function loadToken(membershipId: string): Promise<AuthToken | null> {
  const savedToken = await AsyncStorage.getItem(`${membershipId}${Store._refresh_token}`);
  if (savedToken) {
    const tokenParse = safeParse(authTokenSchema, JSON.parse(savedToken));

    if (tokenParse.success) {
      return tokenParse.output;
    }
    throw new Error("Validation failed");
  }
  throw new Error("No saved token found");
}

function validateAndSetToken(token: AuthToken, membershipId: string): Promise<boolean> {
  return new Promise((resolve, reject) => {
    const isValidRefresh = isValidRefreshToken(token);
    if (!isValidRefresh) {
      // Nothing can be done. The user needs to re-auth.
      // TODO: Log out the user
      console.error("Refresh token expired");
      logoutCurrentUser(membershipId);
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
            saveAndSetToken(parsedToken.output, membershipId);
            return resolve(true);
          }

          const parsedError = safeParse(object({ error: string(), error_description: string() }), newAuthToken);
          if (parsedError.success && parsedError.output.error_description === "SystemDisabled") {
            console.warn("System disabled");
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
      saveAndSetToken(token, membershipId);

      return resolve(true);
    }
  });
}

// TODO: Async and needs error handling?
function saveAndSetToken(token: AuthToken, membershipId: string) {
  if (membershipId === "") {
    console.error("No membershipId !!!!!");
    return;
  }

  const parsedToken = safeParse(authTokenSchema, token);

  if (parsedToken.success) {
    AsyncStorage.setItem(`${membershipId}${Store._refresh_token}`, JSON.stringify(token));
    // setAuthToken(token);
  }
}

export function getTokenAsync(
  authToken: AuthToken | null,
  membershipId: string,
  errorMessage: string,
): Promise<AuthToken | null> {
  return new Promise((resolve, reject) => {
    // Function to add a new request to the queue
    const enqueue = () => {
      console.log("getTokenAsync queue length:", queue.length);
      queue.push(async () => {
        try {
          const result = await getTokenInternal(authToken, membershipId, errorMessage);

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

function getTokenInternal(
  authToken: AuthToken | null,
  membershipId: string,
  errorMessage: string,
): Promise<AuthToken | null> {
  return new Promise((resolve, reject) => {
    if (authToken) {
      validateAndSetToken(authToken, membershipId)
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

export async function logoutCurrentUser(membershipId: string) {
  if (membershipId === "") {
    console.error("No membershipId !!!!!");
  }
  try {
    await AsyncStorage.removeItem(Store._bungie_user);
    await AsyncStorage.removeItem(`${membershipId}${Store._refresh_token}`);
  } catch {
    throw new Error("Error removing current user from storage");
  }
}

export async function processURL(url: string) {
  const { queryParams } = linkingParse(url);

  if (queryParams?.code && queryParams?.state === stateID) {
    const code = queryParams.code.toString();

    // Ensure the same auth code can never be processed more than once. If it did the second
    // would fail with 'invalid_grand'.
    const codeExists = usedAuthCodes.some((usedCode) => usedCode === code);
    if (codeExists) {
      console.error("!Code already used");
      return;
    }

    usedAuthCodes.push(code);

    // If this fails the user needs to auth again. It isn't safe to retry as it can result in 'invalid_grand'.

    try {
      const initialJSONToken = await getRefreshToken(code);
      buildBungieAccount(initialJSONToken);
    } catch (e) {
      console.error("Failed to validate token", e);
    }

    // validate the token
  } else {
    console.log("Invalid URL", url, stateID);
    return;
  }
}

async function buildBungieAccount(authToken: AuthToken) {
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
      // setCurrentAccount(bungieUser);
      saveBungieUser(bungieUser);
      saveToken(authToken, bungieUser.profile.membershipId);
      // useGGStore.getState().setLoggingIn(false);
      return;
    }
    // This is a catastrophic failure. The user is logged in but we can't get their linked profiles.
    // It needs some kind of big alert and then a logout.
    console.error("Error in buildBungieAccount", parsedProfiles.output);
    // useGGStore.getState().setLoggingIn(false);
  }
}

function saveBungieUser(bungieUser: BungieUser): Promise<void> {
  return new Promise((resolve, reject) => {
    AsyncStorage.setItem(Store._bungie_user, JSON.stringify(bungieUser))
      .then(() => {
        resolve();
      })
      .catch((error: unknown) => {
        console.error("Failed to save bungie user", error);
        reject(error as string);
      });
  });
}

export function startAuth(): void {
  stateID = randomUUID();
  const authURL = `https://www.bungie.net/en/oauth/authorize?client_id=${clientID}&response_type=code&reauth=true&state=${stateID}`;

  WebBrowser.openAuthSessionAsync(authURL, redirectURL)
    .then((result) => {
      // Used for Web and Android
      if (result.type === "success") {
        processURL(result.url);
      } else if (result.type === "dismiss") {
        // iOS only on universal link callback
        if (Platform.OS === "android") {
          // User probably went back from the login webview without completing auth flow
          console.info("Failed to complete auth session", result);
        }
      } else {
        // Used for all platforms
        console.info("Failed to open auth session", result);
      }
    })
    .catch((e) => {
      console.error("login issue?", e);
    });
}
