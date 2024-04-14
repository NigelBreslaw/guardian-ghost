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
import type { AccountSliceGetter } from "@/app/store/AccountSlice.ts";

const queue: (() => Promise<void>)[] = [];
let isProcessing = false;
const usedAuthCodes: string[] = [];

export async function loadBungieUser(): Promise<BungieUser | null> {
  const savedAccount = await AsyncStorage.getItem(Store._bungie_user);
  if (savedAccount) {
    const validatedAccount = safeParse(BungieUserSchema, JSON.parse(savedAccount));
    if (validatedAccount.success) {
      return validatedAccount.output;
    }
    throw new Error("Validation failed");
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

async function getUpdatedAccessToken(token: AuthToken): Promise<AuthToken> {
  const isValidRefresh = isValidRefreshToken(token);
  if (!isValidRefresh) {
    // Nothing can be done. The user needs to re-auth.
    // TODO: Log out the user
    console.error("Refresh token expired");
    throw new Error("Refresh token expired");
  }

  const isValidAccess = isValidAccessToken(token);
  if (!isValidAccess) {
    console.info("Access token expired");
    try {
      const updateToken = await getAccessToken(token);
      const parsedToken = safeParse(authTokenSchema, updateToken);
      if (parsedToken.success) {
        return parsedToken.output;
      }

      // check for system disabled
      const parsedError = safeParse(object({ error: string(), error_description: string() }), updateToken);
      if (parsedError.success) {
        throw new Error(parsedError.output.error_description);
      }
    } catch (e) {
      const error = e as Error;
      throw new Error(error.message);
    }
  }

  return token;
}

export function getTokenAsync(get: AccountSliceGetter, authToken: AuthToken, errorMessage: string): Promise<AuthToken> {
  return new Promise((resolve, reject) => {
    // Function to add a new request to the queue
    const enqueue = () => {
      if (queue.length > 0) {
        console.log("getTokenAsync queue length:", queue.length);
      }
      queue.push(async () => {
        try {
          const result = await getTokenInternal(get, authToken, errorMessage);

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

async function getTokenInternal(
  get: AccountSliceGetter,
  authToken: AuthToken,
  errorMessage: string,
): Promise<AuthToken> {
  try {
    const updatedToken = await getUpdatedAccessToken(authToken);
    return updatedToken;
  } catch (e) {
    console.error("Failed to validate token", errorMessage, e);
    const error = e as Error;
    if (error.message === "ProvidedTokenNotValidRefreshToken" || error.message.includes("NotFound (SQL Return Value")) {
      console.error(error.message);
      get().logoutCurrentUser();
    }
    throw new Error("Failed to validate token");
  }
}

export async function deleteUserData(membershipId: string) {
  try {
    await AsyncStorage.removeItem(Store._bungie_user);
    await AsyncStorage.removeItem(`${membershipId}${Store._refresh_token}`);
  } catch {
    throw new Error("Error removing current user from storage");
  }
}

export const stateID = randomUUID();

export async function urlToToken(url: string): Promise<AuthToken> {
  const { queryParams } = linkingParse(url);

  if (queryParams?.code && queryParams?.state === stateID) {
    const code = queryParams.code.toString();

    // Ensure the same auth code can never be processed more than once. If it did the second
    // would fail with 'invalid_grand'.
    const codeExists = usedAuthCodes.some((usedCode) => usedCode === code);
    if (codeExists) {
      console.error("!Code already used");
      throw new Error("Code already used");
    }

    usedAuthCodes.push(code);

    try {
      const initialJSONToken = await getRefreshToken(code);
      return initialJSONToken;
    } catch (e) {
      console.error("Failed to validate token", e);
      throw new Error("Failed to validate token");
    }
  }
  throw new Error("Invalid URL");
}

export async function getBungieAccount(authToken: AuthToken): Promise<BungieUser> {
  let rawLinkedProfiles = await getLinkedProfiles(authToken);
  let parsedProfiles = safeParse(linkedProfilesSchema, rawLinkedProfiles);

  if (parsedProfiles.success && parsedProfiles.output.Response.profiles?.length === 0) {
    rawLinkedProfiles = await getLinkedProfiles(authToken, true);
    parsedProfiles = safeParse(linkedProfilesSchema, rawLinkedProfiles);
    console.error("NOT IMPLEMENTED SPECIAL ACCOUNT SUPPORT: Contact support@guardianghost.com");
  }

  if (parsedProfiles.success && parsedProfiles.output.Response.profiles?.length === 0) {
    console.error("No linked profiles");
    throw new Error("Unable to find valid Destiny 2 user");
  }

  if (parsedProfiles.success) {
    const bungieUser = getBungieUser(parsedProfiles.output);
    return bungieUser;
  }
  // This is a catastrophic failure. The user is logged in but we can't get their linked profiles.
  // It needs some kind of big alert and then a logout.
  console.error("Error in buildBungieAccount", parsedProfiles.output);
  throw new Error("Unable to find valid Destiny 2 user");
}

export async function saveToken(token: AuthToken, membershipId: string): Promise<void> {
  if (membershipId === "") {
    console.error("No membershipId !!!!!");
    throw new Error("No membershipId");
  }
  const parsedToken = safeParse(authTokenSchema, token);

  if (parsedToken.success) {
    try {
      await AsyncStorage.setItem(`${membershipId}${Store._refresh_token}`, JSON.stringify(token));
    } catch (error: unknown) {
      console.error("Failed to save token", error);
      throw new Error("Failed to save token");
    }
  } else {
    throw new Error("Token did not parse!");
  }
}

export async function saveBungieUser(bungieUser: BungieUser): Promise<void> {
  const parsedAccount = safeParse(BungieUserSchema, bungieUser);

  if (parsedAccount.success) {
    try {
      await AsyncStorage.setItem(Store._bungie_user, JSON.stringify(bungieUser));
    } catch (error: unknown) {
      console.error("Failed to save bungie user", error);
      throw new Error("Failed to save bungie user");
    }
  } else {
    throw new Error("BungieUser did not parse!");
  }
}
