import { number, object, string, type InferOutput } from "valibot";

import {
  SectionBuckets,
  type DamageType,
  type DestinyClass,
  type GGCharacterType,
  type GuardianClassType,
  type GuardianGenderType,
  type GuardianRaceType,
  type ItemSubType,
  type ItemType,
  type TierType,
} from "@/app/bungie/Enums.ts";
import type {
  BucketHash,
  CharacterId,
  DestinyItemBase,
  GuardianData,
  ItemHash,
  ItemInstanceId,
} from "@/app/core/GetProfile.ts";

export type GuardiansAndVault = {
  vault: VaultData;
  guardians: Map<string, Guardian>;
};

export type Guardian = {
  data: GuardianData;
  items: Map<number, GuardianGear>;
};

export type GuardianGear = {
  equipped: DestinyItem | null;
  inventory: DestinyItem[];
};

export type VaultData = {
  generalVault: Map<number, DestinyItem[]>;
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

export type BungieUser = InferOutput<typeof BungieUserSchema>;

export type ItemInstance = {
  id: string;
  icon: string;
  screenshot: string;
  calculatedWaterMark?: string;
  crafted?: boolean;
  damageType?: DamageType;
  deepSightResonance?: boolean;
  masterwork?: boolean;
  primaryStat: number;
  search: string;
};

export type DestinyItemDefinition = {
  destinyClass: DestinyClass;
  displayVersionWatermarkIcons: string[];
  doesPostmasterPullHaveSideEffects: boolean;
  equippable: boolean;
  flavorText: string;
  icon: string;
  investmentStats: StatsCollection[];
  itemSubType: ItemSubType;
  itemType: ItemType;
  itemTypeDisplayName: string;
  maxStackSize: number;
  name: string;
  nonTransferrable: boolean;
  plugCategoryIdentifier: string;
  recoveryBucketHash: BucketHash;
  search: string;
  secondaryIcon: string;
  screenshot: string;
  stackUniqueLabel?: string;
  statGroupHash: number;
  stats: StatsCollection[];
  tierType: TierType;
  traitIds: string[];
  watermark: string;
};

export type DestinyItem = DestinyItemBase & {
  characterId: CharacterId;
  previousCharacterId: CharacterId; //Used by the transfer system to update the UI
  equipped: boolean;
  instance: ItemInstance;
  def: DestinyItemDefinition;
};

export type StatsCollection = { statTypeHash: number; value: number };

export type DestinyItemSort = DestinyItem & {
  itemInstanceId: ItemInstanceId;
  damageType: DamageType;
};

export type GGCharacterUiData = {
  characterId: CharacterId;
  guardianClassType: GuardianClassType;
  genderType: GuardianGenderType;
  raceType: GuardianRaceType;
  emblemPath: string;
  emblemBackgroundPath: string;
  secondarySpecial: string;
  lastActiveCharacter: boolean;
  ggCharacterType: GGCharacterType;
};

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

export type DestinyIconData = {
  itemHash: ItemHash;
  itemInstanceId: ItemInstanceId | undefined;
  characterId: CharacterId;
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
  bucketHash: BucketHash;
};

export const DestinyIconDataEmpty: DestinyIconData = {
  itemHash: 0 as ItemHash,
  itemInstanceId: "" as ItemInstanceId,
  characterId: "" as CharacterId,
  icon: "",
  damageTypeIconUri: null,
  primaryStat: 0,
  quantity: 0,
  calculatedWaterMark: "",
  masterwork: false,
  borderColor: "#555555",
  bucketHash: -1 as BucketHash,
};
