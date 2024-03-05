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

export type DestinyIconData = {
  itemHash: number;
  itemInstanceId?: string;
  icon: string;
  watermark?: string;
  damageType?: DamageType;
};
