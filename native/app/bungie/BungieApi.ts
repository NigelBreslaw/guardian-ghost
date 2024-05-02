import { getSimpleProfileSchema, type ProfileData } from "@/app/bungie/Types.ts";
import { basePath } from "@/app/bungie/Common";
import { useGGStore } from "@/app/store/GGStore.ts";
import { apiKey } from "@/constants/env.ts";
import { isoTimestamp, safeParse, string } from "valibot";

export const profileComponents = "100,102,103,104,200,201,202,205,206,300,301,305,307,309,310,1200";

export async function getFullProfile() {
  useGGStore.getState().setLastRefreshTime();
  useGGStore.getState().setRefreshing(true);
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
        reject(error);
      });
  });
}

export async function getBungieManifest(): Promise<JSON> {
  const requestOptions: RequestInit = {
    method: "GET",
  };

  return new Promise((resolve, reject) => {
    fetch("https://www.bungie.net/Platform/Destiny2/Manifest/", requestOptions)
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
        console.error("getManifest", error);
        reject(error);
      });
  });
}
