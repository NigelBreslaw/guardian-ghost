import * as v from "valibot";
import { apiKey } from "../constants/env.ts";

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

export const linkedProfilesScheme = v.object({
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

export async function getLinkedProfiles(
  membership_id: string,
  access_token: string,
  getAllAccounts = false,
): Promise<JSON> {
  const headers = new Headers();
  headers.append("Authorization", `Bearer ${access_token}`);
  headers.append("X-API-Key", apiKey);

  const parameters = "?getAllMemberships=true";

  const requestOptions: RequestInit = {
    method: "GET",
    headers: headers,
  };

  return new Promise((resolve, reject) => {
    fetch(
      `https://www.bungie.net/Platform/Destiny2/254/Profile/${membership_id}/LinkedProfiles/${
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

export type LinkedProfiles = v.Output<typeof linkedProfilesScheme>;

type BungieUser = {
  membershipId: string;
  membershipType: string;
  displayName: string;
};

export function getBungieUser(profile: BungieProfile): BungieUser {
  return {
    membershipId: profile.membershipId,
    membershipType: profile.membershipType.toString(),
    displayName: profile.displayName,
  };
}
// internalBungieUser.membershipId = String(data.profiles[0].membershipId)
//             internalBungieUser.membershipType = String(data.profiles[0].membershipType)
//             internalBungieUser.displayName = String(data.profiles[0].displayName)

// static async function getBungieUser ( Network.ApiResponse apiResonse ) -> BungieUser {

//   BungieUser internalBungieUser

//   var responseJson = apiResonse.json

//   if Debug.logNewAuth {
//       System.log("saving getBungieUser()", responseJson)
//   }

//   System.saveSetting(App.GetSettingKey.LinkedAccountsResponse.format("V"), responseJson)

//   System.log("load okay?", System.getSettingJson(App.GetSettingKey.LinkedAccountsResponse.format("V")))

//   var accountsModel = new Models.BungieAccount {}

//   accountsModel.load( responseJson )

//   var data = accountsModel.data

//   if data.profiles.length > 1 {

//       var pt = new Network.Authentication.PlatformChooser {
//           bungieAccounts: accountsModel
//       }
//       View.present(pt, transition: View.Transition.Fade)

//       while true {
//           if Network.Authentication.bungieUser {
//               return Network.Authentication.bungieUser
//           }
//           else {
//               System.log("waiting for platform choice")
//           }

//           await Task.delay(1000)
//       }

//   }
//   else if data.profiles.length == 1 {
//       internalBungieUser = new BungieUser
//       internalBungieUser.membershipId = String(data.profiles[0].membershipId)
//       internalBungieUser.membershipType = String(data.profiles[0].membershipType)
//       internalBungieUser.displayName = String(data.profiles[0].displayName)
//   }

//   return internalBungieUser
// }
