import { DamageType } from "@/app/bungie/Enums.ts";

export const DEFAULT_OVERLAP_COLOR = "#242429CC";

export const LOGO_DARK = require("../../../images/gg-logo-dark.webp");
export const LOGO_LIGHT = require("../../../images/gg-logo-light.webp");
export const CRAFTED_OVERLAY = require("../../../images/crafted.webp");
export const EMPTY_ENGRAM = require("../../../images/engram-empty.webp");
export const GLOBAL_SPACE_EMBLEM = require("../../../images/globalEmblem.webp");
export const vaultEmblemBackgroundPath = require("../../../images/vaultEmblem.webp");
export const vaultEmblemPath = require("../../../images/vault-emblem-button.png");
export const vaultSecondarySpecial = require("../../../images/vaultSecondary.webp");
export const REFRESH_ICON = require("../../../images/icons/refresh.webp");
export const ENHANCED_TRAIT = require("../../../images/enhanced-trait.png");

const SOLAR_MINI_ICON_URI = require("../../../images/solar_mini.webp");
const VOID_MINI_ICON_URI = require("../../../images/void_mini.webp");
const ARC_MINI_ICON_URI = require("../../../images/arc_mini.webp");
const _KINETIC_MINI_ICON_URI = require("../../../images/kinetic_mini.webp");
const STASIS_MINI_ICON_URI = require("../../../images/stasis_mini.webp");
const STRAND_MINI_ICON_URI = require("../../../images/strand_mini.webp");
export const MASTERWORK_TRIM = require("../../../images/details-masterwork-trim.png");

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
