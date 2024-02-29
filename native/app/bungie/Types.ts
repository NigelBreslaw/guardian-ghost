import { array, boolean, isoTimestamp, merge, number, object, optional, string, record } from "valibot";
import type { Output } from "valibot";

export type CharactersAndVault = {
  vault: VaultData;
  characters: Record<string, CharacterData>;
};

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

const BungieProfileSchema = object({
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

export const linkedProfilesSchema = merge([
  bungieResponseSchema,
  object({
    Response: object({
      bnetMembership: BnetMembershipSchema,
      profiles: array(BungieProfileSchema),
    }),
  }),
]);

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

export const ProfileInventorySchema = array(
  object({
    bindStatus: number(),
    bucketHash: number(),
    dismantlePermission: number(),
    expirationDate: optional(string([isoTimestamp()])),
    isWrapper: boolean(),
    itemHash: number(),
    itemInstanceId: optional(string()),
    itemValueVisibility: optional(array(boolean())),
    location: number(),
    lockable: boolean(),
    overrideStyleItemHash: optional(number()),
    quantity: number(),
    state: number(),
    tooltipNotificationIndexes: optional(array(number())),
    transferStatus: number(),
    versionNumber: optional(number()),
  }),
);

export const CharactersSchema = object({
  baseCharacterLevel: number(),
  characterId: string(),
  classHash: number(),
  classType: number(),
  dateLastPlayed: string([isoTimestamp()]),
  emblemBackgroundPath: string(),
  emblemColor: object({}),
  emblemHash: number(),
  emblemPath: string(),
  genderHash: number(),
  genderType: number(),
  levelProgression: object({
    currentProgress: number(),
    dailyLimit: number(),
    dailyProgress: number(),
    level: number(),
    levelCap: number(),
    nextLevelAt: number(),
    progressToNextLevel: number(),
    progressionHash: number(),
    stepIndex: number(),
    weeklyLimit: number(),
    weeklyProgress: number(),
  }),
  light: number(),
  membershipId: string(),
  membershipType: number(),
  minutesPlayedThisSession: string(),
  minutesPlayedTotal: string(),
  percentToNextLevel: number(),
  raceHash: number(),
  raceType: number(),
  stats: record(string(), number()),
  titleRecordHash: number(),
});

type CharacterData = Output<typeof CharactersSchema>;

export type VaultData = {
  characterId: string;
  emblemBackgroundPath: string;
};

export const getProfileSchema = merge([
  bungieResponseSchema,
  object({
    Response: object({
      characterActivities: object({}),
      characterEquipment: object({
        data: record(string(), object({ items: ProfileInventorySchema })),
        privacy: number(),
      }),
      characterInventories: object({
        data: record(string(), object({ items: ProfileInventorySchema })),
      }),
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
      profileInventory: object({
        data: object({ items: ProfileInventorySchema }),
      }),
      profilePlugSets: object({}),
      profileProgression: object({}),
      profileRecords: object({}),
      profileStringVariables: object({}),
      responseMintedTimestamp: string([isoTimestamp()]),
      secondaryComponentsMintedTimestamp: string([isoTimestamp()]),
    }),
  }),
]);

export type ProfileData = Output<typeof getProfileSchema>;
