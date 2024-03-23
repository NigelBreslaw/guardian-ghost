import AuthService from "@/authentication/AuthService.ts";
import { apiKey } from "@/constants/env.ts";

const _bungieUrl = "https://www.bungie.net";
const basePath = "https://www.bungie.net/Platform";
const _iconUrl = "https://www.bungie.net/common/destiny2_content/icons/";
const _screenshotUrl = "https://www.bungie.net/common/destiny2_content/screenshots/";

export const profileComponents = "100,102,103,104,200,201,202,205,206,300,301,305,307,309,310,1200";

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
