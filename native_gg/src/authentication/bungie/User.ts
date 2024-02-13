import { apiKey } from "../../constants/env.ts";

export async function getLinkedProfiles(membership_id: string, access_token: string): Promise<JSON> {
  const headers = new Headers();
  headers.append("Authorization", `Bearer ${access_token}`);
  headers.append("X-API-Key", apiKey);

  const parameters = "?getAllMemberships=true";

  console.log("parameters", parameters);

  const requestOptions: RequestInit = {
    method: "GET",
    headers: headers,
  };

  return new Promise((resolve, reject) => {
    fetch(
      `https://www.bungie.net/Platform/Destiny2/254/Profile/${membership_id}/LinkedProfiles/${parameters}`,
      requestOptions,
    )
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
        console.error("getRefreshToken", error);
        reject(error);
      });
  });
}
