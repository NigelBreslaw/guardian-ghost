import {
  array,
  boolean,
  isoTimestamp,
  number,
  object,
  optional,
  record,
  string,
  type InferOutput,
  pipe,
} from "valibot";

// -------------------------------
// URL constants
// -------------------------------
export const bungieUrl = "https://www.bungie.net";
export const basePath = "https://www.bungie.net/Platform";
export const iconUrl = "https://www.bungie.net/common/destiny2_content/icons/";
export const screenshotUrl = "https://www.bungie.net/common/destiny2_content/screenshots/";

// -------------------------------
// Bungie Manifest
// -------------------------------

export const bungieManifestSchema = object({
  Response: object({
    jsonWorldComponentContentPaths: record(
      string(),
      object({
        DestinySocketCategoryDefinition: string(),
        DestinyStatGroupDefinition: string(),
        DestinyStatDefinition: string(),
      }),
    ),

    version: string(),
  }),
});

export type BungieManifest = InferOutput<typeof bungieManifestSchema>;

// -------------------------------
// Authenticated API Responses
// -------------------------------

export const bungieResponseSchema = object({
  ErrorCode: number(),
  ErrorStatus: string(),
  Message: string(),
  MessageData: object({}),
  ThrottleSeconds: optional(number()),
});

export type BungieResponse = InferOutput<typeof bungieResponseSchema>;

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

export type BnetMembership = InferOutput<typeof BnetMembershipSchema>;

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
  dateLastPlayed: pipe(string(), isoTimestamp()),
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

export type BungieProfile = InferOutput<typeof BungieProfileSchema>;

export const linkedProfilesSchema = object({
  ...bungieResponseSchema.entries,
  ...object({
    Response: object({
      bnetMembership: BnetMembershipSchema,
      profiles: optional(array(BungieProfileSchema)),
    }),
  }).entries,
});

export type LinkedProfiles = InferOutput<typeof linkedProfilesSchema>;
