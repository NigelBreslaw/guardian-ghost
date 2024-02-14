import * as v from "valibot";

export const refreshTokenSchema = v.object({
  access_token: v.string(),
  expires_in: v.number(),
  membership_id: v.string(),
  refresh_expires_in: v.number(),
  refresh_token: v.string(),
  time_stamp: v.optional(v.string([v.isoTimestamp()])),
  token_type: v.string(),
});

export type RefreshToken = v.Output<typeof refreshTokenSchema>;

export type LinkedProfiles = v.Output<typeof linkedProfilesScheme>;

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

export type BnetMembership = v.Output<typeof BnetMembershipSchema>;
