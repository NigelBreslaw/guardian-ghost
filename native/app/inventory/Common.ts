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

export const weaponBuckets = [1498876634, 2465295065, 953998645];

export const weaponsPageBuckets = [
  1498876634, // kinetic weapons
  2465295065, // energy weapons
  953998645, // power weapons
  4023194814, // ghost
  1506418338, // artifact
];

export const armorBuckets = [3448274439, 3448274439, 3551918588, 14239492, 20886954];

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
  215593132, // LostItems
  4274335291, // Emblems
  284967655, // Ships
  2025709351, // Vehicle
  3683254069, // Finisher
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

export enum DestinyItemType {
  Unknown = 0,
  Weapon = 1,
  Armor = 2,
  General = 3,
}

export type DestinyIconData = {
  itemHash: number;
  itemInstanceId: string | undefined;
  characterId: string;
  icon: string;
  damageTypeIconUri: number | null;
  primaryStat: string;
  calculatedWaterMark: string | undefined;
  masterwork: boolean;
};

export enum UiRowType {
  Header = 0,
  CharacterEquipped = 1,
  CharacterInventory = 2,
  VaultInventory = 3,
}
export enum UiCellType {
  Separator = 0,
  EmptyCell = 1,
  BlankCell = 2,
  DestinyCell = 3,
  EquipSectionCell = 4,
  Vault5x5Cell = 5,
  VaultFlexCell = 6,
}

export type BaseCell = {
  id: string;
  type: UiCellType;
};

export type SeparatorRow = BaseCell & {
  type: UiCellType.Separator;
};

export type DestinyCell = BaseCell & {
  type: UiCellType.DestinyCell;
  icon: string;
  primaryStat: string;
  calculatedWaterMark: string | undefined;
  damageTypeIconUri: number | null;
  itemHash: number;
  itemInstanceId: string | undefined;
  characterId: string;
  masterwork: boolean;
  crafted: boolean;
};

export type EmptyCell = BaseCell & {
  type: UiCellType.EmptyCell;
};

export type BlankCell = BaseCell & {
  type: UiCellType.BlankCell;
};

export type EquipSectionCell = BaseCell & {
  type: UiCellType.EquipSectionCell;
  equipped: DestinyIconData | null;
  inventory: DestinyIconData[];
};

export type Vault5x5Cell = BaseCell & {
  type: UiCellType.Vault5x5Cell;
  inventory: DestinyIconData[];
};

export type VaultFlexCell = BaseCell & {
  type: UiCellType.VaultFlexCell;
  inventory: DestinyIconData[];
};

export type UiCell =
  | SeparatorRow
  | DestinyCell
  | EmptyCell
  | BlankCell
  | EquipSectionCell
  | Vault5x5Cell
  | VaultFlexCell;

export type DestinyItemIdentifier = {
  itemHash: number;
  itemInstanceId: string | undefined;
  characterId: string;
};

export const ITEM_SIZE = 90;
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
