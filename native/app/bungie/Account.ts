import { parse } from "valibot";

import type { AuthToken } from "@/app/store/Authentication/Utilities.ts";
import { apiKey } from "@/constants/env.ts";
import type { BungieUser } from "../inventory/logic/Types.ts";
import { BungieProfileSchema, type BungieProfile, type LinkedProfiles } from "@/app/core/ApiResponse.ts";

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
        reject(new Error("Failed to get authToken"));
      });
  });
}

export function getBungieUser(linkedProfiles: LinkedProfiles): BungieUser {
  const profiles = linkedProfiles.Response?.profiles;

  try {
    if (profiles) {
      const bungieProfile: BungieProfile = parse(BungieProfileSchema, profiles[0]);

      return {
        supplementalDisplayName: linkedProfiles.Response.bnetMembership.supplementalDisplayName,
        iconPath: linkedProfiles.Response.bnetMembership.iconPath,
        topLevelAccountMembershipId: linkedProfiles.Response.bnetMembership.membershipId,
        profile: {
          membershipId: bungieProfile.membershipId,
          membershipType: bungieProfile.membershipType,
          displayName: bungieProfile.displayName,
        },
      };
    }
    console.error("No profiles found");
    throw new Error("Unable to find valid Destiny 2 user");
  } catch (e) {
    console.error(e);
    throw new Error("Unable to find valid Destiny 2 user");
  }
}
