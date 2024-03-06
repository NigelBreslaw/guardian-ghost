export const weaponsPageBuckets = [
  1498876634, // kinetic weapons
  2465295065, // energy weapons
  953998645, // power weapons
  4023194814, // ghost
  1506418338, // artifact
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
  itemInstanceId?: string;
  icon: string;
  watermark?: string;
  damageType?: DamageType;
  breakerType?: BreakerType;
  primaryStat?: number;
  calculatedWaterMark: string;
};

export enum UiRowType {
  Header = 0,
  CharacterEquipped = 1,
  CharacterInventory = 2,
  VaultInventory = 3,
}

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
