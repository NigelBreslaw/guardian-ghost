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

export const linkedProfilesScheme = v.object({
  ErrorCode: v.number(),
  ErrorStatus: v.string(),
  Message: v.string(),
  MessageData: v.object({}),
  Response: v.object({
    bnetMembership: v.object({}),
  }),
});

export type LinkedProfiles = v.Output<typeof linkedProfilesScheme>;

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

export type BnetMembership = v.Output<typeof BnetMembershipSchema>;
