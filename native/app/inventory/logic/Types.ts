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
import type { DestinyItemBase, GuardianData } from "@/app/core/GetProfile.ts";
import { number, object, string } from "valibot";
import type { Output } from "valibot";

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

export type ItemInstance = {
  icon: string;
  calculatedWaterMark?: string;
  crafted?: boolean;
  damageType?: DamageType;
  deepSightResonance?: boolean;
  masterwork?: boolean;
  primaryStat: number;
};

export type DestinyItemDefinition = {
  icon: string;
  destinyClass: DestinyClass;
  doesPostmasterPullHaveSideEffects: boolean;
  equippable: boolean;
  itemSubType: ItemSubType;
  itemType: ItemType;
  maxStackSize: number;
  nonTransferrable: boolean;
  tierType: TierType;
  recoveryBucketHash: number;
  stackUniqueLabel?: string;
  plugCategoryIdentifier: string;
  investmentStats: InvestmentStat[];
  displayVersionWatermarkIcons: string[];
  watermark: string;
};

export type DestinyItem = DestinyItemBase & {
  characterId: string;
  previousCharacterId: string; //Used by the transfer system to update the UI
  equipped: boolean;
  instance: ItemInstance;
  def: DestinyItemDefinition;
};

export type InvestmentStat = { statTypeHash: number; value: number };

export type SocketDefinition = {
  name: string;
  description: string;
  icon: string;
  itemType: ItemType;
  tierType: TierType; // .Common means its an enhanced perk
  itemTypeDisplayName: string;
  uiItemDisplayStyle: string;
  investmentStats: InvestmentStat[];
};

export type DestinyItemSort = DestinyItem & {
  itemInstanceId: string;
  damageType: DamageType;
};

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
