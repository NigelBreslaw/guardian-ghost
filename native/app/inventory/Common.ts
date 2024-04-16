export const bungieUrl = "https://www.bungie.net";
export const basePath = "https://www.bungie.net/Platform";
export const iconUrl = "https://www.bungie.net/common/destiny2_content/icons/";
export const screenshotUrl = "https://www.bungie.net/common/destiny2_content/screenshots/";

export enum InventoryPage {
  Unknown = 0,
  Weapons = 1,
  Armor = 2,
  General = 3,
}

export const characterBuckets = [
  1498876634, // kinetic weapons
  2465295065, // energy weapons
  953998645, // power weapons
  3448274439, // helmet
  3551918588, // gauntlets
  14239492, // chest armor
  20886954, // leg armor
  1585787867, // class armor
  4023194814, // ghost
  2025709351, // vehicle
  284967655, // ships
  3284755031, // subclass
  4292445962, // banners
  4274335291, // emblems
  3683254069, // finisher
  1107761855, // emotes
  1506418338, // artifact
  375726501, // Engrams
  215593132, // Lost Items
  1469714392, // consumables
  3313201758, // modifications
];

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

export const weaponBuckets = [SectionBuckets.Kinetic, SectionBuckets.Energy, SectionBuckets.Power];

const localizedSectionNames = {
  [SectionBuckets.Kinetic]: "Kinetic",
  [SectionBuckets.Energy]: "Energy",
  [SectionBuckets.Power]: "Power",
  [SectionBuckets.Helmet]: "Helmets",
  [SectionBuckets.Gauntlets]: "Gauntlets",
  [SectionBuckets.Chest]: "Chests",
  [SectionBuckets.Leg]: "Legs",
  [SectionBuckets.Class]: "Class Items",
  [SectionBuckets.Ghost]: "Ghosts",
  [SectionBuckets.Vehicle]: "Vehicles",
  [SectionBuckets.Ship]: "Ships",
  [SectionBuckets.Subclass]: "Subclass",
  [SectionBuckets.Banner]: "Banner",
  [SectionBuckets.Emblem]: "Emblems",
  [SectionBuckets.Finisher]: "Finisher",
  [SectionBuckets.Emote]: "Emotes",
  [SectionBuckets.Artifact]: "Artifact",
  [SectionBuckets.Engram]: "Engrams",
  [SectionBuckets.LostItem]: "Postmaster",
  [SectionBuckets.Consumables]: "Consumables",
  [SectionBuckets.Mods]: "Mods",
};

export const sectionSupportsExotic = [
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
  1498876634, // kinetic weapons
  2465295065, // energy weapons
  953998645, // power weapons
  4023194814, // ghost
  1506418338, // artifact
];

export const armorBuckets = [
  SectionBuckets.Helmet,
  SectionBuckets.Gauntlets,
  SectionBuckets.Chest,
  SectionBuckets.Leg,
  SectionBuckets.Class,
];

export const armorPageBuckets = [
  3284755031, // Subclass
  3448274439, // Helmet
  3551918588, // Gauntlets
  14239492, // ChestArmor
  20886954, // LegArmor
  1585787867, // ClassArmor undefined //1626737477 undefined //1801258597
];

export const generalPageBuckets = [
  375726501, // Engrams undefined 444348033 undefined 497170007
  215593132, // Lost Items
  1469714392, // consumables
  3313201758, // modifications
  4274335291, // Emblems
  284967655, // Ships
  2025709351, // Vehicle
  3683254069, // Finisher
];

export const equipSectionBuckets = [
  SectionBuckets.Kinetic,
  SectionBuckets.Energy,
  SectionBuckets.Power,
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

export function getInventoryPage(bucket: number): InventoryPage {
  if (weaponsPageBuckets.includes(bucket)) {
    return InventoryPage.Weapons;
  }
  if (armorPageBuckets.includes(bucket)) {
    return InventoryPage.Armor;
  }
  if (generalPageBuckets.includes(bucket)) {
    return InventoryPage.General;
  }
  console.log("Unknown page", bucket);
  return InventoryPage.Unknown;
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

export const ITEM_SIZE = 90;
export const ICON_SIZE = 72;
export const ICON_MARGIN = (ITEM_SIZE - ICON_SIZE) / 2;
export const DEFAULT_MARGIN = 6;
export const VISUAL_MARGIN = DEFAULT_MARGIN + ICON_MARGIN;
export const DEFAULT_SECTION_4_WIDTH = ITEM_SIZE * 4;
export const ENGRAMS_SECTION_SIZE = ITEM_SIZE * 2 * 0.9;
export const VAULT_5x5_SIZE = ITEM_SIZE * 5;
export const EQUIP_SECTION_SIZE = ITEM_SIZE * 3;
export const SEPARATOR_SIZE = 45;

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
