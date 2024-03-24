export const weaponsPageBuckets = [
  1498876634, // kinetic weapons
  2465295065, // energy weapons
  953998645, // power weapons
  4023194814, // ghost
  1506418338, // artifact
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
  215593132, // LostItems
  4274335291, // Emblems
  284967655, // Ships
  2025709351, // Vehicle
  3683254069, // Finisher
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
  icon: string;
  damageTypeIconUri: number | null;
  primaryStat: string;
  calculatedWaterMark: string | undefined;
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
}

export type BaseCell = {
  id: string;
  type: UiCellType;
  itemHash?: number;
  itemInstanceId?: string;
};

export type SeparatorCell = BaseCell & {
  type: UiCellType.Separator;
};

export type DestinyCell = BaseCell & {
  type: UiCellType.DestinyCell;
  icon: string;
  itemInstanceId: string | undefined;
  primaryStat: string;
  calculatedWaterMark: string | undefined;
  damageTypeIconUri: number | null;
};

export type EmptyCell = BaseCell & {
  type: UiCellType.EmptyCell;
};

export type BlankCell = BaseCell & {
  type: UiCellType.BlankCell;
};

export type UiCell = SeparatorCell | DestinyCell | EmptyCell | BlankCell;

export type CharacterEquippedRow = {
  id: string;
  equipped: DestinyIconData | null;
  inventory: Array<DestinyIconData>;
  type: UiRowType.CharacterEquipped;
};

export type CharacterInventoryRow = {
  id: string;
  inventory: Array<DestinyIconData>;
  type: UiRowType.CharacterInventory;
};

export type VaultInventoryRow = {
  id: string;
  inventory: Array<DestinyIconData>;
  type: UiRowType.VaultInventory;
};

export type HeaderRow = {
  id: string;
  type: UiRowType.Header;
};

export type UiRow = HeaderRow | CharacterEquippedRow | CharacterInventoryRow | VaultInventoryRow;

export const ITEM_SIZE = 90;
export const SEPARATOR_SIZE = 45;

const SOLAR_MINI_ICON_URI = require("../../images/solar_mini.webp");
const VOID_MINI_ICON_URI = require("../../images/void_mini.webp");
const ARC_MINI_ICON_URI = require("../../images/arc_mini.webp");
const _KINETIC_MINI_ICON_URI = require("../../images/kinetic_mini.webp");
const STASIS_MINI_ICON_URI = require("../../images/stasis_mini.webp");
const STRAND_MINI_ICON_URI = require("../../images/strand_mini.webp");

export function getDamagetypeIconUri(damageType: DamageType): number | null {
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
