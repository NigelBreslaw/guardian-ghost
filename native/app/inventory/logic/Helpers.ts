import { SectionBuckets, StatType } from "@/app/bungie/Enums.ts";
import type { DestinyItem } from "@/app/inventory/logic/Types.ts";
import { iconUrl } from "@/app/core/ApiResponse.ts";
import type { BucketHash, CharacterId, ItemHash, ItemInstanceId } from "@/app/core/GetProfile.ts";
import { DestinyDefinitions } from "@/app/store/Definitions.ts";

export enum InventoryPageEnums {
  Unknown = 0,
  Weapons = 1,
  Armor = 2,
  General = 3,
}

export const weaponBuckets = [SectionBuckets.Kinetic, SectionBuckets.Energy, SectionBuckets.Power];

export const sectionSupportsBlockingExotic = [
  SectionBuckets.Kinetic,
  SectionBuckets.Energy,
  SectionBuckets.Power,
  SectionBuckets.Helmet,
  SectionBuckets.Gauntlets,
  SectionBuckets.Chest,
  SectionBuckets.Leg,
  SectionBuckets.Class,
];

export const weaponsPageBuckets = [
  SectionBuckets.Kinetic,
  SectionBuckets.Energy,
  SectionBuckets.Power,
  SectionBuckets.Ghost,
  SectionBuckets.Artifact,
];

export const armorBuckets = [
  SectionBuckets.Helmet,
  SectionBuckets.Gauntlets,
  SectionBuckets.Chest,
  SectionBuckets.Leg,
  SectionBuckets.Class,
];

export const armorPageBuckets = [
  SectionBuckets.Subclass,
  SectionBuckets.Helmet,
  SectionBuckets.Gauntlets,
  SectionBuckets.Chest,
  SectionBuckets.Leg,
  SectionBuckets.Class,
];

export const generalPageBuckets = [
  SectionBuckets.Engram,
  SectionBuckets.LostItem,
  SectionBuckets.Consumables,
  SectionBuckets.Mods,
  SectionBuckets.Emblem,
  SectionBuckets.Ship,
  SectionBuckets.Vehicle,
  SectionBuckets.Finisher,
];

export const equipSectionBuckets = [
  SectionBuckets.Kinetic,
  SectionBuckets.Energy,
  SectionBuckets.Power,
  SectionBuckets.Ghost,
  SectionBuckets.Helmet,
  SectionBuckets.Gauntlets,
  SectionBuckets.Chest,
  SectionBuckets.Leg,
  SectionBuckets.Class,
  SectionBuckets.Subclass,
  SectionBuckets.Emblem,
  SectionBuckets.Ship,
  SectionBuckets.Vehicle,
  SectionBuckets.Finisher,
];

export const vaultItemBuckets = [
  SectionBuckets.Kinetic,
  SectionBuckets.Energy,
  SectionBuckets.Power,
  SectionBuckets.Ghost,
  SectionBuckets.Helmet,
  SectionBuckets.Gauntlets,
  SectionBuckets.Chest,
  SectionBuckets.Leg,
  SectionBuckets.Class,
  SectionBuckets.Ship,
  SectionBuckets.Vehicle,
  SectionBuckets.Mods,
  SectionBuckets.Consumables,
];

export const lightLevelBuckets = [
  SectionBuckets.Kinetic,
  SectionBuckets.Energy,
  SectionBuckets.Power,
  SectionBuckets.Helmet,
  SectionBuckets.Gauntlets,
  SectionBuckets.Chest,
  SectionBuckets.Leg,
  SectionBuckets.Class,
];

export enum UiRowType {
  Header = 0,
  CharacterEquipped = 1,
  CharacterInventory = 2,
  VaultInventory = 3,
}

export enum UISection {
  Separator = 0,
  CharacterEquipment = 1,
  Engrams = 2,
  LostItems = 3,
  Artifact = 4,
  VaultSpacer = 5,
  LootRow = 6,
  GuardianDetails = 7,
}

export type BaseSection = {
  id: string;
  type: UISection;
};

export type SeparatorSection = BaseSection & {
  type: UISection.Separator;
  label: string;
  bucketHash: BucketHash;
  characterId: CharacterId;
};

export type EngramsSection = BaseSection & {
  type: UISection.Engrams;
  inventory: DestinyItem[];
};

export type EquipSection = BaseSection & {
  type: UISection.CharacterEquipment;
  equipped: DestinyItem | undefined;
  inventory: DestinyItem[];
};

export type LootSection = BaseSection & {
  type: UISection.LootRow;
  inventory: DestinyItem[];
};

export type LostItemsSection = BaseSection & {
  type: UISection.LostItems;
  inventory: DestinyItem[];
};

export type ArtifactSection = BaseSection & {
  type: UISection.Artifact;
  equipped: DestinyItem | undefined;
};

export type VaultSpacerSection = BaseSection & {
  type: UISection.VaultSpacer;
  size: number;
};

export type GuardianDetailsSection = BaseSection & {
  type: UISection.GuardianDetails;
  characterIndex: number;
};

export type UISections =
  | SeparatorSection
  | EquipSection
  | EngramsSection
  | LostItemsSection
  | ArtifactSection
  | VaultSpacerSection
  | LootSection
  | GuardianDetailsSection;

export type DestinyItemIdentifier = {
  characterId: CharacterId;
  itemHash: ItemHash;
  itemInstanceId: ItemInstanceId | undefined;
  bucketHash: BucketHash;
};

export const ArmorStatInvestments = [
  StatType.Mobility,
  StatType.Resilience,
  StatType.Recovery,
  StatType.Discipline,
  StatType.Intellect,
  StatType.Strength,
];

export function getSectionDetails(bucket: SectionBuckets): { label: string; icon: string } {
  const section = DestinyDefinitions.inventoryBucket?.[bucket]?.displayProperties?.name ?? "";
  return { label: `\\ ${section}`, icon: iconUrl };
}
