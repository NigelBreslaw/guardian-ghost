import { isoTimestamp, safeParse, string } from "valibot";

import { basePath } from "@/app/core/ApiResponse.ts";
import { getSimpleProfileSchema, type ProfileData } from "@/app/core/GetProfile.ts";
import { useGGStore } from "@/app/store/GGStore.ts";
import { apiKey } from "@/constants/env.ts";

export const profileComponents = "100,102,103,104,200,201,202,205,206,300,301,305,307,309,310,1200";
export const BUNGIE_MANIFEST_URL = "https://www.bungie.net/Platform/Destiny2/Manifest/";
export const CUSTOM_MANIFEST_URL = "https://app.guardianghost.com/json/manifest.json";

export async function getFullProfile(pullToRefresh = false) {
  useGGStore.getState().setLastRefreshTime();
  useGGStore.getState().setRefreshing(true);
  if (pullToRefresh) {
    useGGStore.getState().setPullRefreshing(true);
  }
  try {
    const profile = (await getProfile()) as unknown as ProfileData;
    // The returned data is often old and won't reflect recent transfers. This check ensures the data
    // has a newer timestamp than the previous data.
    const isNewer = isProfileNewer(profile);
    if (isNewer) {
      const validatedProfile = safeParse(getSimpleProfileSchema, profile);
      if (validatedProfile.success) {
        useGGStore.getState().updateProfile(validatedProfile.output as ProfileData);
      } else {
        console.error("Failed to validate profile!", profile);
        console.error("Issues", validatedProfile.issues);
      }
    } else {
      console.info("No new profile");
    }
  } catch (e) {
    console.error("Failed to validate profile!", e);
  } finally {
    useGGStore.getState().setRefreshing(false);
    useGGStore.getState().setPullRefreshing(false);
  }
}

function isProfileNewer(profile: ProfileData): boolean {
  const responseMintedTimestamp = safeParse(string([isoTimestamp()]), profile.Response.responseMintedTimestamp);
  const secondaryComponentsMintedTimestamp = safeParse(
    string([isoTimestamp()]),
    profile.Response.secondaryComponentsMintedTimestamp,
  );

  if (responseMintedTimestamp.success && secondaryComponentsMintedTimestamp.success) {
    const rmTimestamp = new Date(responseMintedTimestamp.output);
    const scmTimestamp = new Date(secondaryComponentsMintedTimestamp.output);

    const previousResponseMintedTimestamp = useGGStore.getState().responseMintedTimestamp;
    const previousSecondaryComponentsMintedTimestamp = useGGStore.getState().secondaryComponentsMintedTimestamp;

    if (
      rmTimestamp.getTime() > previousResponseMintedTimestamp.getTime() &&
      scmTimestamp.getTime() > previousSecondaryComponentsMintedTimestamp.getTime()
    ) {
      return true;
    }
  }

  return false;
}

async function getProfile(): Promise<JSON> {
  const authToken = await useGGStore.getState().getTokenAsync("getProfile");
  const headers = new Headers();
  headers.append("Authorization", `Bearer ${authToken?.access_token}`);
  headers.append("X-API-Key", apiKey);

  const requestOptions: RequestInit = {
    method: "GET",
    headers: headers,
    cache: "no-store",
  };

  const account = useGGStore.getState().bungieUser;
  const membershipType = account.profile.membershipType;
  const membershipId = account.profile.membershipId;

  const endPoint = `${basePath}/Destiny2/${membershipType}/Profile/${membershipId}/`;

  const parameters = `?components=${profileComponents}`;

  return new Promise((resolve, reject) => {
    fetch(`${endPoint}${parameters}`, requestOptions)
      .then((response) => {
        if (!response.ok) {
          console.error(response);

          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        return response.json();
      })
      .then((data) => {
        resolve(data as JSON);
      })
      .catch((error) => {
        console.error("getProfile", error);
        reject(new Error("getProfile", error));
      });
  });
}

export function getJsonBlob(jsonUrl: string): Promise<JSON> {
  const requestOptions: RequestInit = {
    method: "GET",
  };

  return new Promise((resolve, reject) => {
    fetch(jsonUrl, requestOptions)
      .then((response) => {
        if (!response.ok) {
          console.error(response);
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        return response.json();
      })
      .then((data) => {
        resolve(data);
      })
      .catch((error) => {
        console.error("Failed to download getJsonBlog", error);
        reject(new Error("Failed to download getJsonBlog", error));
      });
  });
}
