import { array, boolean, isoTimestamp, merge, number, object, optional, string, record, unknown } from "valibot";
import type { Output } from "valibot";

export const bungieResponseSchema = object({
  ErrorCode: number(),
  ErrorStatus: string(),
  Message: string(),
  MessageData: object({}),
  ThrottleSeconds: optional(number()),
});

export type BungieResponse = Output<typeof bungieResponseSchema>;

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

export const linkedProfilesSchema = merge([
  bungieResponseSchema,
  object({
    Response: object({
      bnetMembership: BnetMembershipSchema,
      profiles: array(ProfileSchema),
    }),
  }),
]);

export type LinkedProfiles = Output<typeof linkedProfilesSchema>;

export type BungieProfile = Output<typeof ProfileSchema>;
export type BnetMembership = Output<typeof BnetMembershipSchema>;

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

export const CharactersSchema = object({
  membershipId: string(),
  membershipType: number(),
  characterId: string(),
  dateLastPlayed: string([isoTimestamp()]),
  minutesPlayedThisSession: string(),
  minutesPlayedTotal: string(),
  light: number(),
  stats: record(string(), number()),
  raceHash: number(),
  genderHash: number(),
});

export const getProfileSchema = merge([
  bungieResponseSchema,
  object({
    Response: object({
      characterActivities: object({}),
      characterEquipment: object({}),
      characterInventories: object({}),
      characterLoadouts: object({}),
      characterPlugSets: object({}),
      characterProgressions: object({}),
      characterRecords: object({}),
      characterStringVariables: object({}),
      characterUninstancedItemComponents: object({}),
      characters: object({
        data: record(string(), CharactersSchema),
      }),
      itemComponents: object({}),
      profile: object({}),
      profileCurrencies: object({}),
      profileInventory: object({}),
      profilePlugSets: object({}),
      profileProgression: object({}),
      profileRecords: object({}),
      profileStringVariables: object({}),
      responseMintedTimestamp: string([isoTimestamp()]),
      secondaryComponentsMintedTimestamp: string([isoTimestamp()]),
    }),
  }),
]);
