import { randomUUID } from "expo-crypto";
import { setAsyncStorage, removeAsyncStorageItem, getAsyncStorageJSON } from "@/app/store/DefinitionsSlice.ts";
import { object, safeParse, string } from "valibot";
import { parse as linkingParse } from "expo-linking";

import { BungieUserSchema, type BungieUser } from "@/app/inventory/logic/Types.ts";
import {
  authTokenSchema,
  isValidAccessToken,
  isValidRefreshToken,
  type AuthToken,
  getAccessToken,
  getRefreshToken,
} from "@/app/store/Authentication/Utilities.ts";
import { getLinkedProfiles } from "@/app/bungie/Account.ts";
import type { AccountSliceGetter } from "@/app/store/Account/AccountSlice";
import { linkedProfilesSchema, type LinkedProfiles } from "@/app/core/ApiResponse.ts";
import type { AsyncStorageKey } from "@/app/store/Types.ts";

const queue: (() => Promise<void>)[] = [];
let isProcessing = false;
const usedAuthCodes: string[] = [];

export async function loadBungieUser(): Promise<BungieUser | null> {
  const savedAccount = await getAsyncStorageJSON("BUNGIE_USER");
  const validatedAccount = safeParse(BungieUserSchema, savedAccount);
  if (validatedAccount.success) {
    return validatedAccount.output;
  }
  throw new Error("No saved account found");
}

export async function loadToken(membershipId: string): Promise<AuthToken | null> {
  const savedToken = await getAsyncStorageJSON(`${membershipId}"REFRESH_TOKEN"` as AsyncStorageKey);
  const tokenParse = safeParse(authTokenSchema, savedToken);

  if (tokenParse.success) {
    return tokenParse.output;
  }
  throw new Error("No saved token found");
}

async function getUpdatedAccessToken(token: AuthToken): Promise<AuthToken> {
  const isValidRefresh = isValidRefreshToken(token);

  if (!isValidRefresh) {
    // Nothing can be done. The user needs to re-auth.
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
    if (
      error.message === "ProvidedTokenNotValidRefreshToken" ||
      error.message.includes("NotFound (SQL Return Value") ||
      error.message.includes("Refresh token expired")
    ) {
      console.error(error.message);
      await get().logoutCurrentUser();
    }
    throw new Error("Failed to validate token");
  }
}

export async function deleteUserData(membershipId: string) {
  try {
    await removeAsyncStorageItem("BUNGIE_USER");
    await removeAsyncStorageItem(`${membershipId}"REFRESH_TOKEN"` as AsyncStorageKey);
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

export async function getBungieAccount(authToken: AuthToken): Promise<LinkedProfiles> {
  let rawLinkedProfiles = await getLinkedProfiles(authToken);
  let parsedProfiles = safeParse(linkedProfilesSchema, rawLinkedProfiles);

  if (parsedProfiles.success && parsedProfiles.output.Response.profiles?.length === 0) {
    rawLinkedProfiles = await getLinkedProfiles(authToken, true);
    parsedProfiles = safeParse(linkedProfilesSchema, rawLinkedProfiles);
  }

  if (parsedProfiles.success && parsedProfiles.output.Response.profiles?.length === 0) {
    console.error("No linked profiles");
    throw new Error("Unable to find valid Destiny 2 user");
  }

  if (parsedProfiles.success) {
    console.log("GetBungieAccount success");
    return parsedProfiles.output;
  }
  // This is a catastrophic failure. The user is logged in but we can't get their linked profiles.
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
      await setAsyncStorage(`${membershipId}"REFRESH_TOKEN"` as AsyncStorageKey, JSON.stringify(token));
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
      await setAsyncStorage("BUNGIE_USER", JSON.stringify(bungieUser));
    } catch (error: unknown) {
      console.error("Failed to save bungie user", error);
      throw new Error("Failed to save bungie user");
    }
  } else {
    throw new Error("BungieUser did not parse!");
  }
}
