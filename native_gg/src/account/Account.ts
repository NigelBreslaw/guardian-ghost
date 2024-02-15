import * as v from "valibot";
import { apiKey } from "../constants/env.ts";
import { RefreshToken } from "../authentication/Types.ts";

const PlatformSilverSchema = v.object({
  itemHash: v.number(),
  quantity: v.number(),
  bindStatus: v.number(),
  location: v.number(),
  bucketHash: v.number(),
  transferStatus: v.number(),
  lockable: v.boolean(),
  state: v.number(),
  dismantlePermission: v.number(),
  isWrapper: v.boolean(),
});

const ProfileSchema = v.object({
  applicableMembershipTypes: v.array(v.number()),
  bungieGlobalDisplayName: v.string(),
  bungieGlobalDisplayNameCode: v.number(),
  crossSaveOverride: v.number(),
  dateLastPlayed: v.string([v.isoTimestamp()]),
  displayName: v.string(),
  isCrossSavePrimary: v.boolean(),
  isOverridden: v.boolean(),
  isPublic: v.boolean(),
  membershipId: v.string(),
  membershipType: v.number(),
  platformSilver: v.object({
    platformSilver: v.object({
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

export const BnetMembershipSchema = v.object({
  bungieGlobalDisplayName: v.string(),
  bungieGlobalDisplayNameCode: v.number(),
  displayName: v.string(),
  iconPath: v.string(),
  isPublic: v.boolean(),
  membershipId: v.string(),
  membershipType: v.number(),
  supplementalDisplayName: v.string(),
});

export const linkedProfilesSchema = v.object({
  ErrorCode: v.number(),
  ErrorStatus: v.string(),
  Message: v.string(),
  MessageData: v.object({}),
  Response: v.object({
    bnetMembership: BnetMembershipSchema,
    profiles: v.array(ProfileSchema),
  }),
});

export type BungieProfile = v.Output<typeof ProfileSchema>;
export type BnetMembership = v.Output<typeof BnetMembershipSchema>;

export type LinkedProfiles = v.Output<typeof linkedProfilesSchema>;

export const BungieUserSchema = v.object({
  supplementalDisplayName: v.string(),
  iconPath: v.string(),
  topLevelAccountMembershipId: v.string(),
  profile: v.object({
    membershipId: v.string(),
    membershipType: v.string(),
    displayName: v.string(),
  }),
});

export type BungieUser = v.Output<typeof BungieUserSchema>;

export async function getLinkedProfiles(authToken: RefreshToken, getAllAccounts = false): Promise<JSON> {
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
