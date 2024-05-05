import { array, boolean, isoTimestamp, merge, number, object, optional, record, string, type Output } from "valibot";

// -------------------------------
// Bungie Manifest
// -------------------------------

export const bungieManifestSchema = object({
  Response: object({
    jsonWorldComponentContentPaths: record(
      string(),
      object({ DestinySocketCategoryDefinition: string(), DestinyStatGroupDefinition: string() }),
    ),

    version: string(),
  }),
});

export type BungieManifest = Output<typeof bungieManifestSchema>;

// -------------------------------
// Authenticated API Responses
// -------------------------------

// TODO: Should this also have 'Response'?
export const bungieResponseSchema = object({
  ErrorCode: number(),
  ErrorStatus: string(),
  Message: string(),
  MessageData: object({}),
  ThrottleSeconds: optional(number()),
});

export type BungieResponse = Output<typeof bungieResponseSchema>;

// -------------------------------
// getLinkedProfiles API Responses | Used only during login
// -------------------------------

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

export type BnetMembership = Output<typeof BnetMembershipSchema>;

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

export const BungieProfileSchema = object({
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

export type BungieProfile = Output<typeof BungieProfileSchema>;

export const linkedProfilesSchema = merge([
  bungieResponseSchema,
  object({
    Response: object({
      bnetMembership: BnetMembershipSchema,
      profiles: optional(array(BungieProfileSchema)),
    }),
  }),
]);

export type LinkedProfiles = Output<typeof linkedProfilesSchema>;
