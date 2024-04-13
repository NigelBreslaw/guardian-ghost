import type {
  DestinyClass,
  GuardianClassType,
  GuardianGenderType,
  GuardianRaceType,
  ItemType,
} from "@/app/bungie/Hashes.ts";
import type { DamageType } from "@/app/inventory/Common.ts";
import { array, boolean, isoTimestamp, merge, number, object, optional, record, string, unknown } from "valibot";
import type { Output } from "valibot";

export enum TierType {
  Unknown = 0,
  Currency = 1,
  Uncommon = 2,
  Common = 3,
  Rare = 4,
  Legendary = 5,
  Exotic = 6,
}

export enum ItemSubType {
  None = 0,
  Crucible = 1,
  Vanguard = 2,
  Exotic = 5,
  AutoRifle = 6,
  Shotgun = 7,
  MachineGun = 8,
  HandCannon = 9,
  RocketLauncher = 10,
  FusionRifle = 11,
  SniperRifle = 12,
  PulseRifle = 13,
  ScoutRifle = 14,
  Crm = 16,
  Sidearm = 17,
  Sword = 18,
  Mask = 19,
  Shader = 20,
  Ornament = 21,
  FusionRifleLine = 22,
  GrenadeLauncher = 23,
  SubmachineGun = 24,
  TraceRifle = 25,
  HelmetArmor = 26,
  GauntletsArmor = 27,
  ChestArmor = 28,
  LegArmor = 29,
  ClassArmor = 30,
  Bow = 31,
  DummyRepeatableBounty = 32,
  Glaive = 33,
}

export type GuardiansAndVault = {
  vault: VaultData;
  guardians: Record<string, Guardian>;
};

export type Guardian = {
  data: GuardianData;
  items: Record<number, GuardianGear>;
};

export type GuardianGear = {
  equipped: DestinyItem | null;
  inventory: DestinyItem[];
};

export type VaultData = {
  generalVault: Record<number, DestinyItem[]>;
  consumables: DestinyItem[];
  mods: DestinyItem[];
  lostItems: DestinyItem[];
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
      profiles: optional(array(BungieProfileSchema)),
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
    membershipType: number(),
    displayName: string(),
  }),
});

export type BungieUser = Output<typeof BungieUserSchema>;

export const ItemSchema = object({
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
});

export type DestinyItemBase = Output<typeof ItemSchema>;

export type DestinyItemDefinition = {
  characterId: string;
  equipped: boolean;
  previousCharacterId: string; //Used by the transfer system to update the UI
  recoveryBucketHash: number | undefined;
  itemType: ItemType;
  masterwork?: boolean;
  primaryStat: number;
  icon: string;
  calculatedWaterMark?: string;
  damageType?: DamageType;
  deepSightResonance?: boolean;
  crafted?: boolean;
  itemSubType: ItemSubType;
  tierType: TierType;
  destinyClass: DestinyClass;
  doesPostmasterPullHaveSideEffects: boolean;
};

export type DestinyItem = DestinyItemBase & DestinyItemDefinition;

export type DestinyItemSort = DestinyItem & { itemInstanceId: string; damageType: DamageType };

export const SocketSchema = object({
  sockets: array(
    object({
      plugHash: optional(number()),
      isEnabled: boolean(),
      isVisible: boolean(),
      enableFailIndexes: optional(array(number())),
    }),
  ),
});

export type SocketData = Output<typeof SocketSchema>;

export const GuardiansSchema = object({
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
  titleRecordHash: optional(number()),
});

export type GuardianData = Output<typeof GuardiansSchema>;

const PlugSetSchema = array(
  object({
    canInsert: boolean(),
    enabled: boolean(),
    plugItemHash: number(),
    enableFailIndexes: optional(array(number())),
    insertFailIndexes: optional(array(number())),
    plugObjectives: optional(
      array(
        object({
          complete: boolean(),
          completionValue: number(),
          objectiveHash: number(),
          progress: number(),
          visible: boolean(),
        }),
      ),
    ),
  }),
);

export type PlugSet = Output<typeof PlugSetSchema>;

const ReusablePlugSetSchema = object({
  plugs: record(string(), PlugSetSchema),
});

const instancesSchema = record(
  string(),
  object({
    canEquip: boolean(),
    cannotEquipReason: number(),
    damageType: number(),
    damageTypeHash: optional(number()),
    energy: optional(
      object({
        energyCapacity: number(),
        energyType: number(),
        energyTypeHash: number(),
        energyUnused: number(),
        energyUsed: number(),
      }),
    ),
    equipRequiredLevel: number(),
    isEquipped: boolean(),
    itemLevel: number(),
    primaryStat: optional(
      object({
        statHash: number(),
        value: number(),
      }),
    ),
    quality: number(),
    unlockHashesRequiredToEquip: array(number()),
  }),
);

export type GGInstances = Output<typeof instancesSchema>;

export const getProfileSchema = merge([
  bungieResponseSchema,
  object({
    Response: object({
      characterEquipment: object({
        data: record(string(), object({ items: array(ItemSchema) })),
        privacy: number(),
      }),
      characterInventories: object({
        data: record(string(), object({ items: array(ItemSchema) })),
      }),
      characterLoadouts: object({}),
      characterPlugSets: object({}),
      characterProgressions: object({}),
      characterStringVariables: object({}),
      characterUninstancedItemComponents: object({}),
      characters: object({
        data: record(string(), GuardiansSchema),
      }),

      itemComponents: object({
        instances: object({
          data: instancesSchema,
        }),
        sockets: object({
          data: record(string(), SocketSchema),
        }),
        reusablePlugs: object({
          data: record(string(), ReusablePlugSetSchema),
        }),
      }),
      profile: object({}),
      profileCurrencies: object({}),
      profileInventory: object({
        data: object({ items: array(ItemSchema) }),
      }),
      profilePlugSets: object({
        data: object({
          plugs: record(string(), PlugSetSchema),
        }),
      }),
      profileProgression: object({}),
      profileStringVariables: object({}),
      responseMintedTimestamp: string([isoTimestamp()]),
      secondaryComponentsMintedTimestamp: string([isoTimestamp()]),
    }),
  }),
]);

export type ProfileData = Output<typeof getProfileSchema>;

export const getSimpleProfileSchema = merge([
  bungieResponseSchema,
  object({
    Response: object({
      characterEquipment: object({
        data: record(string(), unknown()),
        privacy: number(),
      }),
      characterInventories: object({
        data: unknown(),
      }),
      characterLoadouts: object({}),
      characterPlugSets: object({}),
      characterProgressions: object({}),
      characterStringVariables: object({}),
      characterUninstancedItemComponents: object({}),
      characters: object({
        data: record(string(), unknown()),
      }),

      itemComponents: object({
        instances: object({
          data: unknown(),
        }),
        sockets: object({
          data: unknown(),
        }),
        reusablePlugs: object({
          data: unknown(),
        }),
      }),
      profile: object({}),
      profileCurrencies: object({}),
      profileInventory: object({
        data: object({ items: unknown() }),
      }),
      profilePlugSets: object({
        data: object({
          plugs: unknown(),
        }),
      }),
      profileProgression: object({}),
      profileStringVariables: object({}),
      responseMintedTimestamp: string([isoTimestamp()]),
      secondaryComponentsMintedTimestamp: string([isoTimestamp()]),
    }),
  }),
]);

export enum GGCharacterType {
  Guardian = 0,
  Vault = 1,
}

export type GGCharacterUiData = {
  characterId: string;
  guardianClassType: GuardianClassType;
  genderType: GuardianGenderType;
  raceType: GuardianRaceType;
  emblemPath: string;
  emblemBackgroundPath: string;
  lastActiveCharacter: boolean;
  ggCharacterType: GGCharacterType;
};
