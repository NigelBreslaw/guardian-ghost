import { array, boolean, object, string, number, isoTimestamp } from "valibot";
import type { Output } from "valibot";
import { apiKey } from "@/constants/env";
import { AuthToken } from "@/authentication/Utilities";

const PlatformSilverSchema = object({
  itemHash: number(),
  quantity: number(),
  bindStatus: number(),
  location: number(),
  bucketHash: number(),
  transferStatus: number(),
  lockable: boolean(),
  state: number(),
  dismantlePermission: number(),
  isWrapper: boolean(),
});

const ProfileSchema = object({
  applicableMembershipTypes: array(number()),
  bungieGlobalDisplayName: string(),
  bungieGlobalDisplayNameCode: number(),
  crossSaveOverride: number(),
  dateLastPlayed: string([isoTimestamp()]),
  displayName: string(),
  isCrossSavePrimary: boolean(),
  isOverridden: boolean(),
  isPublic: boolean(),
  membershipId: string(),
  membershipType: number(),
  platformSilver: object({
    platformSilver: object({
      BungieNext: PlatformSilverSchema,
      TigerBlizzard: PlatformSilverSchema,
      TigerEgs: PlatformSilverSchema,
      TigerPsn: PlatformSilverSchema,
      TigerStadia: PlatformSilverSchema,
      TigerSteam: PlatformSilverSchema,
      TigerXbox: PlatformSilverSchema,
    }),
  }),
});

export const BnetMembershipSchema = object({
  bungieGlobalDisplayName: string(),
  bungieGlobalDisplayNameCode: number(),
  displayName: string(),
  iconPath: string(),
  isPublic: boolean(),
  membershipId: string(),
  membershipType: number(),
  supplementalDisplayName: string(),
});

export const linkedProfilesSchema = object({
  ErrorCode: number(),
  ErrorStatus: string(),
  Message: string(),
  MessageData: object({}),
  Response: object({
    bnetMembership: BnetMembershipSchema,
    profiles: array(ProfileSchema),
  }),
});

export type BungieProfile = Output<typeof ProfileSchema>;
export type BnetMembership = Output<typeof BnetMembershipSchema>;

export type LinkedProfiles = Output<typeof linkedProfilesSchema>;

export const BungieUserSchema = object({
  supplementalDisplayName: string(),
  iconPath: string(),
  topLevelAccountMembershipId: string(),
  profile: object({
    membershipId: string(),
    membershipType: string(),
    displayName: string(),
  }),
});

export type BungieUser = Output<typeof BungieUserSchema>;

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
