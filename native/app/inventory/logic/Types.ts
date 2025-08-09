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
import type { BucketHash, CharacterId, DestinyItemBase, GuardianData, ItemInstanceId } from "@/app/core/GetProfile.ts";

export type Guardian = {
  data: GuardianData;
  items: Map<number, GuardianGear>;
};

export type GuardianGear = {
  equipped: DestinyItem | undefined;
  inventory: DestinyItem[];
};

export type VaultData = {
  generalVault: Map<number, DestinyItem[]>;
  consumables: DestinyItem[];
  mods: DestinyItem[];
  lostItems: DestinyItem[];
};

export const BungieUserSchema = object({
  profile: object({
    membershipId: string(),
    membershipType: number(),
    displayName: string(),
  }),
});

export type BungieUser = InferOutput<typeof BungieUserSchema>;

export type ItemInstance = {
  calculatedWaterMark?: string;
  crafted?: boolean;
  damageType?: DamageType;
  deepSightResonance?: boolean;
  enhanced?: boolean;
  gearTier?: number;
  icon: string;
  masterwork?: boolean;
  primaryStat: number;
  screenshot: string;
  search: string;
};

export type DestinyItemDefinition = {
  description: string;
  destinyClass: DestinyClass;
  doesPostmasterPullHaveSideEffects: boolean;
  equippable: boolean;
  flavorText: string;
  icon: string;
  investmentStats: StatsCollection[];
  isFeatured: boolean;
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
  separatorIcon?: string;
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
  basePowerLevel: number;
  artifactBonus: number;
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
