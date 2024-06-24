import { SectionBuckets, StatType } from "@/app/bungie/Enums.ts";
import type { DestinyIconData } from "@/app/inventory/logic/Types.ts";
import { iconUrl } from "@/app/core/ApiResponse.ts";
import type { BucketHash, CharacterId, ItemHash, ItemInstanceId } from "@/app/core/GetProfile.ts";
import { DestinyInventoryBucketDefinition } from "@/app/store/Definitions.ts";

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

export enum UiRowType {
  Header = 0,
  CharacterEquipped = 1,
  CharacterInventory = 2,
  VaultInventory = 3,
}

export enum UISection {
  Separator = 0,
  CharacterEquipment = 1,
  VaultFlex = 2,
  Engrams = 3,
  LostItems = 4,
  Artifact = 5,
  VaultSpacer = 6,
  LootIconRow = 7,
}

export type BaseSection = {
  id: string;
  type: UISection;
};

export type SeparatorSection = BaseSection & {
  type: UISection.Separator;
  label: string;
  info?: string;
};

export type EngramsSection = BaseSection & {
  type: UISection.Engrams;
  inventory: DestinyIconData[];
};

export type EquipSection = BaseSection & {
  type: UISection.CharacterEquipment;
  equipped: DestinyIconData | null;
  inventory: DestinyIconData[];
};

export type VaultFlexSection = BaseSection & {
  type: UISection.VaultFlex;
  inventory: DestinyIconData[];
  minimumSpacerHeight?: number;
};

export type LootIconSection = BaseSection & {
  type: UISection.LootIconRow;
  inventory: DestinyIconData[];
};

export type LostItemsSection = BaseSection & {
  type: UISection.LostItems;
  inventory: DestinyIconData[];
};

export type ArtifactSection = BaseSection & {
  type: UISection.Artifact;
  equipped: DestinyIconData | null;
};

export type VaultSpacerSection = BaseSection & {
  type: UISection.VaultSpacer;
  size: number;
};

export type UISections =
  | SeparatorSection
  | EquipSection
  | VaultFlexSection
  | EngramsSection
  | LostItemsSection
  | ArtifactSection
  | VaultSpacerSection
  | LootIconSection;

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
  const section = DestinyInventoryBucketDefinition[bucket]?.displayProperties?.name ?? "";
  return { label: `\\ ${section}`, icon: iconUrl };
}

export function getInventoryPage(bucket: number): InventoryPageEnums {
  if (weaponsPageBuckets.includes(bucket)) {
    return InventoryPageEnums.Weapons;
  }
  if (armorPageBuckets.includes(bucket)) {
    return InventoryPageEnums.Armor;
  }
  if (generalPageBuckets.includes(bucket)) {
    return InventoryPageEnums.General;
  }
  console.log("Unknown page", bucket);
  return InventoryPageEnums.Unknown;
}
