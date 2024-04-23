export const bungieUrl = "https://www.bungie.net";
export const basePath = "https://www.bungie.net/Platform";
export const iconUrl = "https://www.bungie.net/common/destiny2_content/icons/";
export const screenshotUrl = "https://www.bungie.net/common/destiny2_content/screenshots/";

export enum InventoryPageEnums {
  Unknown = 0,
  Weapons = 1,
  Armor = 2,
  General = 3,
}

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

export function getSectionDetails(bucket: SectionBuckets): { label: string; icon: string } {
  const section = localizedSectionNames[bucket];
  return { label: section, icon: iconUrl };
}

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
  minimumSpacerSize?: number;
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

export const DEFAULT_OVERLAP_COLOR = "#242429CC";

const SOLAR_MINI_ICON_URI = require("../../images/solar_mini.webp");
const VOID_MINI_ICON_URI = require("../../images/void_mini.webp");
const ARC_MINI_ICON_URI = require("../../images/arc_mini.webp");
const _KINETIC_MINI_ICON_URI = require("../../images/kinetic_mini.webp");
const STASIS_MINI_ICON_URI = require("../../images/stasis_mini.webp");
const STRAND_MINI_ICON_URI = require("../../images/strand_mini.webp");

export function getDamageTypeIconUri(damageType: DamageType | undefined): number | null {
  switch (damageType) {
    case DamageType.Solar:
      return SOLAR_MINI_ICON_URI;
    case DamageType.Arc:
      return ARC_MINI_ICON_URI;
    case DamageType.Void:
      return VOID_MINI_ICON_URI;
    case DamageType.Stasis:
      return STASIS_MINI_ICON_URI;
    case DamageType.Strand:
      return STRAND_MINI_ICON_URI;
    default:
      return null;
  }
}

export const LOGO_DARK = require("../../images/gg-logo-dark.webp");
export const LOGO_LIGHT = require("../../images/gg-logo-light.webp");
export const CRAFTED_OVERLAY = require("../../images/crafted.webp");
export const EMPTY_ENGRAM = require("../../images/engram-empty.webp");