import AuthService from "@/authentication/AuthService.ts";
import { apiKey } from "@/constants/env.ts";

const bungieUrl = "https://www.bungie.net";
const basePath = "https://www.bungie.net/Platform";
const iconUrl = "https://www.bungie.net/common/destiny2_content/icons/";
const screenshotUrl = "https://www.bungie.net/common/destiny2_content/screenshots/";

export const profileComponents =
  "Profiles,ProfileInventories,ProfileCurrencies,ProfileProgression,Characters,CharacterInventories,CharacterLoadouts,CharacterProgressions,CharacterActivities,CharacterEquipment,ItemInstances,ItemObjectives,ItemPerks,ItemStats,ItemSockets,ItemTalentGrids,ItemCommonData,ItemPlugObjectives,ItemReusablePlugs,StringVariables,Records";

export async function getProfile(): Promise<JSON> {
  const authToken = await AuthService.getTokenAsync("getProfile");
  const headers = new Headers();
  headers.append("Authorization", `Bearer ${authToken?.access_token}`);
  headers.append("X-API-Key", apiKey);

  const requestOptions: RequestInit = {
    method: "GET",
    headers: headers,
  };

  const account = AuthService.getCurrentAccount();
  const membershipType = account?.profile.membershipType;
  const membershipId = account?.profile.membershipId;

  const endPoint = `${basePath}/Destiny2/${membershipType}/Profile/${membershipId}/`;

  // TODO: Feed in dynamic language later when this is supported
  const parameters = `?lc=en&components=${profileComponents}`;

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
