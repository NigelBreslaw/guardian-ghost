import { SectionBuckets } from "@/app/bungie/Enums.ts";
import type { CharacterId } from "@/app/core/GetProfile.ts";

export function updateBucketSizes() {
  BUCKET_SIZES[SectionBuckets.Consumables] =
    DestinyInventoryBucketDefinition[SectionBuckets.Consumables]?.itemCount ?? 5;
  BUCKET_SIZES[SectionBuckets.Mods] = DestinyInventoryBucketDefinition[SectionBuckets.Mods]?.itemCount ?? 5;
  BUCKET_SIZES[SectionBuckets.LostItem] = DestinyInventoryBucketDefinition[SectionBuckets.LostItem]?.itemCount ?? 5;
  BUCKET_SIZES[SectionBuckets.Vault] = DestinyInventoryBucketDefinition[SectionBuckets.Vault]?.itemCount ?? 5;
}

export const VAULT_CHARACTER_ID = "VAULT" as CharacterId;
export const GLOBAL_MODS_CHARACTER_ID = "GLOBAL_MODS_CHARACTER_ID" as CharacterId;
export const GLOBAL_CONSUMABLES_CHARACTER_ID = "GLOBAL_CONSUMABLES_CHARACTER_ID" as CharacterId;
export const GLOBAL_LOST_ITEMS_CHARACTER_ID = "GLOBAL_LOST_ITEMS_CHARACTER_ID" as CharacterId;

export const GLOBAL_INVENTORY_NAMES = [
  GLOBAL_MODS_CHARACTER_ID,
  GLOBAL_CONSUMABLES_CHARACTER_ID,
  GLOBAL_LOST_ITEMS_CHARACTER_ID,
];

export const BUCKET_SIZES = {
  [SectionBuckets.Consumables]: 50,
  [SectionBuckets.Mods]: 50,
  [SectionBuckets.LostItem]: 21,
  [SectionBuckets.Vault]: 500,
};

import { DamageType } from "@/app/bungie/Enums.ts";
import { DestinyInventoryBucketDefinition } from "@/app/store/Definitions.ts";

export const DEFAULT_OVERLAP_COLOR = "#242429CC";

export const LOGO_DARK = require("../../images/gg-logo-dark.webp");
export const LOGO_LIGHT = require("../../images/gg-logo-light.webp");
export const CRAFTED_OVERLAY = require("../../images/crafted.webp");
export const ENHANCED_OVERLAY = require("../../images/enhanced.webp");
export const EMPTY_ENGRAM = require("../../images/engram-empty.webp");
export const GLOBAL_SPACE_EMBLEM = require("../../images/globalEmblem.webp");
export const vaultEmblemBackgroundPath = require("../../images/vaultEmblem.webp");
export const vaultEmblemPath = require("../../images/vault-emblem-button.png");
export const vaultSecondarySpecial = require("../../images/vaultSecondary.webp");
export const REFRESH_ICON = require("../../images/icons/refresh.webp");
export const SEARCH_ICON = require("../../images/icons/search.png");
export const ENHANCED_TRAIT = require("../../images/enhanced-trait.png");
export const POWER_LEVEL = require("../../images/icons/power-icon.png");

const SOLAR_MINI_ICON_URI = require("../../images/damage/solar_mini.webp");
const VOID_MINI_ICON_URI = require("../../images/damage/void_mini.webp");
const ARC_MINI_ICON_URI = require("../../images/damage/arc_mini.webp");
const _KINETIC_MINI_ICON_URI = require("../../images/damage/kinetic_mini.webp");
const STASIS_ICON_URI = require("../../images/damage/stasis_mini.webp");
const STRAND_ICON_URI = require("../../images/damage/strand_mini.webp");
const SOLAR_ICON_URI = require("../../images/damage/solar_mini.webp");
const VOID_ICON_URI = require("../../images/damage/void_mini.webp");
const ARC_ICON_URI = require("../../images/damage/arc_mini.webp");
const STASIS_MINI_ICON_URI = require("../../images/damage/stasis_mini.webp");
const STRAND_MINI_ICON_URI = require("../../images/damage/strand_mini.webp");
export const MASTERWORK_TRIM = require("../../images/details-masterwork-trim.png");
export const SCREENSHOT_MASTERWORK_OVERLAY = require("../../images/masterwork-landscape-overlay.png");
export const LARGE_CRAFTED = require("../../images/large-crafted.webp");
export const LARGE_ENHANCED = require("../../images/large-enhanced.webp");

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

export function getLargeDamageTypeIconUri(damageType: DamageType | undefined): number | null {
  switch (damageType) {
    case DamageType.Solar:
      return SOLAR_ICON_URI;
    case DamageType.Arc:
      return ARC_ICON_URI;
    case DamageType.Void:
      return VOID_ICON_URI;
    case DamageType.Stasis:
      return STASIS_ICON_URI;
    case DamageType.Strand:
      return STRAND_ICON_URI;
    default:
      return null;
  }
}
