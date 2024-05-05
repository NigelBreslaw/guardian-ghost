import { SectionBuckets, type DestinyIconData } from "@/app/bungie/Types.ts";
import { iconUrl } from "@/app/core/ApiResponse.ts";

export enum InventoryPageEnums {
  Unknown = 0,
  Weapons = 1,
  Armor = 2,
  General = 3,
}

export const weaponBuckets = [SectionBuckets.Kinetic, SectionBuckets.Energy, SectionBuckets.Power];

const localizedSectionNames = {
  [SectionBuckets.Kinetic]: "/ Kinetic Weapons",
  [SectionBuckets.Energy]: "/ Energy Weapons",
  [SectionBuckets.Power]: "/ Power Weapons",
  [SectionBuckets.Helmet]: "/ Helmet",
  [SectionBuckets.Gauntlets]: "/ Gauntlets",
  [SectionBuckets.Chest]: "/ Chest Armor",
  [SectionBuckets.Leg]: "/ Leg Armor",
  [SectionBuckets.Class]: "/ Class Armor",
  [SectionBuckets.Ghost]: "/ Ghost",
  [SectionBuckets.Vehicle]: "/ Vehicle",
  [SectionBuckets.Ship]: "/ Ships",
  [SectionBuckets.Subclass]: "/ Subclass",
  [SectionBuckets.Banner]: "/ Banner",
  [SectionBuckets.Emblem]: "/ Emblems",
  [SectionBuckets.Finisher]: "/ Finishers",
  [SectionBuckets.Emote]: "/ Emotes",
  [SectionBuckets.Artifact]: "/ Artifact",
  [SectionBuckets.Engram]: "/ Engrams",
  [SectionBuckets.LostItem]: "/ Postmaster",
  [SectionBuckets.Consumables]: "/ Consumables",
  [SectionBuckets.Mods]: "/ Modifications",
};

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
  Vault5x5 = 2,
  VaultFlex = 3,
  Engrams = 4,
  LostItems = 5,
  Artifact = 6,
  VaultSpacer = 7,
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

export type Vault5x5Section = BaseSection & {
  type: UISection.Vault5x5;
  inventory: DestinyIconData[];
};

export type VaultFlexSection = BaseSection & {
  type: UISection.VaultFlex;
  inventory: DestinyIconData[];
  minimumSpacerHeight?: number;
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
  | Vault5x5Section
  | VaultFlexSection
  | EngramsSection
  | LostItemsSection
  | ArtifactSection
  | VaultSpacerSection;

export type DestinyItemIdentifier = {
  itemHash: number;
  itemInstanceId: string | undefined;
  characterId: string;
};

export function getSectionDetails(bucket: SectionBuckets): { label: string; icon: string } {
  const section = localizedSectionNames[bucket];
  return { label: section, icon: iconUrl };
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
