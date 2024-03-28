import { getProfileSchema } from "@/app/bungie/Types.ts";
import { useGGStore } from "@/app/store/GGStore.ts";
import { benchmark } from "@/app/utilities/Helpers.ts";
import { apiKey } from "@/constants/env.ts";
import { parse } from "valibot";

const _bungieUrl = "https://www.bungie.net";
const basePath = "https://www.bungie.net/Platform";
const _iconUrl = "https://www.bungie.net/common/destiny2_content/icons/";
const _screenshotUrl = "https://www.bungie.net/common/destiny2_content/screenshots/";

export const profileComponents = "100,102,103,104,200,201,202,205,206,300,301,305,307,309,310,1200";

export async function getFullProfile() {
  useGGStore.getState().setRefreshing(true);
  try {
    const profile = await getProfile();
    const validatedProfile = benchmark(parse, getProfileSchema, profile);
    const p1 = performance.now();
    useGGStore.getState().updateProfile(validatedProfile);
    const p2 = performance.now();
    console.info("NEW updateProfile() took:", (p2 - p1).toFixed(5), "ms");
  } catch (e) {
    console.error("Failed to validate profile!", e);
  } finally {
    useGGStore.getState().setRefreshing(false);
  }
}

async function getProfile(): Promise<JSON> {
  const authToken = await useGGStore.getState().getTokenAsync("getProfile");
  const headers = new Headers();
  headers.append("Authorization", `Bearer ${authToken?.access_token}`);
  headers.append("X-API-Key", apiKey);

  const requestOptions: RequestInit = {
    method: "GET",
    headers: headers,
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
        resolve(data);
      })
      .catch((error) => {
        console.error("getProfile", error);
        reject(error);
      });
  });
}
