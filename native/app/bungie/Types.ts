import type { DestinyItemBase, GuardianData } from "@/app/core/GetProfile.ts";
import { number, object, string } from "valibot";
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

export type DestinyItemDefinition = {
  characterId: string;
  equipped: boolean;
  previousCharacterId: string; //Used by the transfer system to update the UI
  recoveryBucketHash: number;
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
  maxStackSize: number;
  stackUniqueLabel?: string;
  nonTransferrable: boolean;
  equippable: boolean;
  plugCategoryIdentifier?: string;
};

export type DestinyItem = DestinyItemBase & DestinyItemDefinition;

export type DestinyItemSort = DestinyItem & {
  itemInstanceId: string;
  damageType: DamageType;
  plugCategoryIdentifier: string;
};

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
  secondarySpecial: string;
  lastActiveCharacter: boolean;
  ggCharacterType: GGCharacterType;
};

export enum GuardianClassType {
  Titan = 0,
  Hunter = 1,
  Warlock = 2,
  Unknown = 3,
  Vault = 100,
}

export enum DestinyClass {
  Titan = 0,
  Hunter = 1,
  Warlock = 2,
  Unknown = 3,
}

export enum GuardianGenderType {
  Male = 0,
  Female = 1,
  Unknown = 2,
}

export enum GuardianRaceType {
  Human = 0,
  Awoken = 1,
  Exo = 2,
  Unknown = 3,
}

export enum ItemType {
  None = 0,
  Currency = 1,
  Armor = 2,
  Weapon = 3,
  Message = 7,
  Engram = 8,
  Consumable = 9,
  ExchangeMaterial = 10,
  MissionReward = 11,
  QuestStep = 12,
  QuestStepComplete = 13,
  Emblem = 14,
  Quest = 15,
  Subclass = 16,
  ClanBanner = 17,
  Aura = 18,
  Mod = 19,
  Dummy = 20,
  Ship = 21,
  Vehicle = 22,
  Emote = 23,
  Ghost = 24,
  Package = 25,
  Bounty = 26,
  Wrapper = 27,
  SeasonalArtifact = 28,
  Finisher = 29,
}

export enum SectionBuckets {
  Kinetic = 1498876634,
  Energy = 2465295065,
  Power = 953998645,
  Helmet = 3448274439,
  Gauntlets = 3551918588,
  Chest = 14239492,
  Leg = 20886954,
  Class = 1585787867,
  Ghost = 4023194814,
  Vehicle = 2025709351,
  Ship = 284967655,
  Subclass = 3284755031,
  Banner = 4292445962,
  Emblem = 4274335291,
  Finisher = 3683254069,
  Emote = 1107761855,
  Artifact = 1506418338,
  Engram = 375726501,
  LostItem = 215593132,
  Consumables = 1469714392,
  Mods = 3313201758,
}

export const characterBuckets = [
  SectionBuckets.Kinetic,
  SectionBuckets.Energy,
  SectionBuckets.Power,
  SectionBuckets.Helmet,
  SectionBuckets.Gauntlets,
  SectionBuckets.Chest,
  SectionBuckets.Leg,
  SectionBuckets.Class,
  SectionBuckets.Ghost,
  SectionBuckets.Vehicle,
  SectionBuckets.Ship,
  SectionBuckets.Subclass,
  SectionBuckets.Banner,
  SectionBuckets.Emblem,
  SectionBuckets.Finisher,
  SectionBuckets.Emote,
  SectionBuckets.Artifact,
  SectionBuckets.Engram,
  SectionBuckets.LostItem,
  SectionBuckets.Consumables,
  SectionBuckets.Mods,
];

export enum DamageType {
  None = 0,
  Kinetic = 1,
  Arc = 2,
  Solar = 3,
  Void = 4,
  Raid = 5,
  Stasis = 6,
  Strand = 7,
}

export enum BreakerType {
  None = 0,
  ShieldPiercing = 1,
  Disruption = 2,
  Stagger = 3,
}

export type DestinyIconData = {
  itemHash: number;
  itemInstanceId: string | undefined;
  characterId: string;
  icon: string;
  damageTypeIconUri: number | null;
  primaryStat: number;
  quantity: number;
  calculatedWaterMark: string | undefined;
  masterwork: boolean;
  borderColor: string;
  crafted?: boolean;
  stackSizeMaxed?: boolean;
  engram?: boolean;
};

export const DestinyIconDataEmpty: DestinyIconData = {
  itemHash: 0,
  itemInstanceId: "",
  characterId: "",
  icon: "",
  damageTypeIconUri: null,
  primaryStat: 0,
  quantity: 0,
  calculatedWaterMark: "",
  masterwork: false,
  borderColor: "#555555",
};
