import { AuthToken } from "@/authentication/Utilities.ts";
import { apiKey } from "@/constants/env.ts";
import { BungieProfile, BungieUser, LinkedProfiles } from "./Types";

export async function getLinkedProfiles(authToken: AuthToken, getAllAccounts = false): Promise<JSON> {
  const headers = new Headers();
  headers.append("Authorization", `Bearer ${authToken.access_token}`);
  headers.append("X-API-Key", apiKey);

  const parameters = "?getAllMemberships=true";

  const requestOptions: RequestInit = {
    method: "GET",
    headers: headers,
  };

  return new Promise((resolve, reject) => {
    fetch(
      `https://www.bungie.net/Platform/Destiny2/254/Profile/${authToken.membership_id}/LinkedProfiles/${
        getAllAccounts ? parameters : ""
      }`,
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

export function getBungieUser(linkedProfiles: LinkedProfiles): BungieUser {
  if (linkedProfiles.Response.profiles[0]) {
    const bungieProfile: BungieProfile = linkedProfiles.Response.profiles[0];

    return {
      supplementalDisplayName: linkedProfiles.Response.bnetMembership.supplementalDisplayName,
      iconPath: linkedProfiles.Response.bnetMembership.iconPath,
      topLevelAccountMembershipId: linkedProfiles.Response.bnetMembership.membershipId,
      profile: {
        membershipId: bungieProfile.membershipId,
        membershipType: bungieProfile.membershipType.toString(),
        displayName: bungieProfile.displayName,
      },
    };
  }

  throw new Error("Unable to find valid Destiny 2 user");
}
