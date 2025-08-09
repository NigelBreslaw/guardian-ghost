import { DestinyClass, ItemSubType, SectionBuckets, DamageType } from "@/app/bungie/Enums.ts";
import type { CharacterId } from "@/app/core/GetProfile.ts";
import type { DestinyItem } from "@/app/inventory/logic/Types.ts";

export const VAULT_CHARACTER_ID = "VAULT" as CharacterId;
export const GLOBAL_MODS_CHARACTER_ID = "GLOBAL_MODS_CHARACTER_ID" as CharacterId;
export const GLOBAL_CONSUMABLES_CHARACTER_ID = "GLOBAL_CONSUMABLES_CHARACTER_ID" as CharacterId;
export const GLOBAL_LOST_ITEMS_CHARACTER_ID = "GLOBAL_LOST_ITEMS_CHARACTER_ID" as CharacterId;

export const GLOBAL_INVENTORY_NAMES = [
  GLOBAL_MODS_CHARACTER_ID,
  GLOBAL_CONSUMABLES_CHARACTER_ID,
  GLOBAL_LOST_ITEMS_CHARACTER_ID,
];

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
export const GEAR_TIER_2 = require("../../images/icons/inventory-item-tier2.png");
export const GEAR_TIER_3 = require("../../images/icons/inventory-item-tier3.png");
export const GEAR_TIER_4 = require("../../images/icons/inventory-item-tier4.png");
export const GEAR_TIER_5 = require("../../images/icons/inventory-item-tier5.png");

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

export function getGearTierIconUri(gearTier: number | undefined): number | null {
  switch (gearTier) {
    case 2:
      return GEAR_TIER_2;
    case 3:
      return GEAR_TIER_3;
    case 4:
      return GEAR_TIER_4;
    case 5:
      return GEAR_TIER_5;
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

// Objectives icons
export const ARC_OBJECTIVE_ICON = require("../../images/objectives/arc.png");
export const AUTO_RIFLE_OBJECTIVE_ICON = require("../../images/objectives/auto rifle.png");
export const BOW_OBJECTIVE_ICON = require("../../images/objectives/bow.png");
export const CURRENCY_OBJECTIVE_ICON = require("../../images/objectives/currency.png");
export const FINAL_BLOWS_OBJECTIVE_ICON = require("../../images/objectives/final blows.png");
export const FUSION_OBJECTIVE_ICON = require("../../images/objectives/fusion.png");
export const GLAIVE_OBJECTIVE_ICON = require("../../images/objectives/glaive.png");
export const GRENADE_OBJECTIVE_ICON = require("../../images/objectives/grenade.png");
export const GRENADE_LAUNCHER_OBJECTIVE_ICON = require("../../images/objectives/grenade launcher.png");
export const HAND_CANNON_OBJECTIVE_ICON = require("../../images/objectives/hand cannon.png");
export const HEADSHOT_OBJECTIVE_ICON = require("../../images/objectives/headshot.png");
export const LARGE_BLOCKER_OBJECTIVE_ICON = require("../../images/objectives/large blocker.png");
export const LINEAR_FUSION_OBJECTIVE_ICON = require("../../images/objectives/linear fusion.png");
export const LOST_SECTOR_OBJECTIVE_ICON = require("../../images/objectives/lost sector.png");
export const MACHINE_GUN_OBJECTIVE_ICON = require("../../images/objectives/machine gun.png");
export const MEDIUM_BLOCKER_OBJECTIVE_ICON = require("../../images/objectives/medium blocker.png");
export const MELEE_OBJECTIVE_ICON = require("../../images/objectives/melee.png");
export const PULSE_RIFLE_OBJECTIVE_ICON = require("../../images/objectives/pulse rifle.png");
export const QUEST_OBJECTIVE_ICON = require("../../images/objectives/quest.png");
export const ROCKET_LAUNCHER_OBJECTIVE_ICON = require("../../images/objectives/rocket launcher.png");
export const SCOUT_RIFLE_OBJECTIVE_ICON = require("../../images/objectives/scout rifle.png");
export const SHOTGUN_OBJECTIVE_ICON = require("../../images/objectives/shotgun.png");
export const SIDEARM_OBJECTIVE_ICON = require("../../images/objectives/sidearm.png");
export const SMALL_BLOCKER_OBJECTIVE_ICON = require("../../images/objectives/small blocker.png");
export const SMG_OBJECTIVE_ICON = require("../../images/objectives/smg.png");
export const SNIPER_RIFLE_OBJECTIVE_ICON = require("../../images/objectives/sniper rifle.png");
export const SOLAR_OBJECTIVE_ICON = require("../../images/objectives/solar.png");
export const SPECIAL_GRENADE_LAUNCHER_OBJECTIVE_ICON = require("../../images/objectives/special grenade launcher.png");
export const STASIS_OBJECTIVE_ICON = require("../../images/objectives/stasis.png");
export const SWORD_OBJECTIVE_ICON = require("../../images/objectives/sword.png");
export const TRACE_RIFLE_OBJECTIVE_ICON = require("../../images/objectives/trace rifle.png");
export const VOID_OBJECTIVE_ICON = require("../../images/objectives/void.png");

export function getItemSubTypeIcon(destinyItem: DestinyItem): string {
  switch (destinyItem.def.itemSubType) {
    case ItemSubType.AutoRifle:
      return AUTO_RIFLE_OBJECTIVE_ICON;
    case ItemSubType.Bow:
      return BOW_OBJECTIVE_ICON;
    case ItemSubType.FusionRifle:
      return FUSION_OBJECTIVE_ICON;
    case ItemSubType.Glaive:
      return GLAIVE_OBJECTIVE_ICON;
    case ItemSubType.GrenadeLauncher: {
      if (destinyItem.bucketHash === SectionBuckets.Power) {
        return GRENADE_LAUNCHER_OBJECTIVE_ICON;
      }
      return SPECIAL_GRENADE_LAUNCHER_OBJECTIVE_ICON;
    }
    case ItemSubType.HandCannon:
      return HAND_CANNON_OBJECTIVE_ICON;
    case ItemSubType.FusionRifleLine:
      return FUSION_OBJECTIVE_ICON;
    case ItemSubType.MachineGun:
      return MACHINE_GUN_OBJECTIVE_ICON;
    case ItemSubType.PulseRifle:
      return PULSE_RIFLE_OBJECTIVE_ICON;
    case ItemSubType.RocketLauncher:
      return ROCKET_LAUNCHER_OBJECTIVE_ICON;
    case ItemSubType.ScoutRifle:
      return SCOUT_RIFLE_OBJECTIVE_ICON;
    case ItemSubType.Shotgun:
      return SHOTGUN_OBJECTIVE_ICON;
    case ItemSubType.Sidearm:
      return SIDEARM_OBJECTIVE_ICON;
    case ItemSubType.SubmachineGun:
      return SMG_OBJECTIVE_ICON;
    case ItemSubType.SniperRifle:
      return SNIPER_RIFLE_OBJECTIVE_ICON;
    case ItemSubType.Sword:
      return SWORD_OBJECTIVE_ICON;
    case ItemSubType.TraceRifle:
      return TRACE_RIFLE_OBJECTIVE_ICON;
    default:
      return "";
  }
}

// Class icons
export const HUNTER_CLASS_ICON = require("../../images/hunter-logo.png");
export const WARLOCK_CLASS_ICON = require("../../images/warlock-logo.png");
export const TITAN_CLASS_ICON = require("../../images/titan-logo.png");

export const classIcons = {
  [DestinyClass.Hunter]: HUNTER_CLASS_ICON as string,
  [DestinyClass.Warlock]: WARLOCK_CLASS_ICON as string,
  [DestinyClass.Titan]: TITAN_CLASS_ICON as string,
  [DestinyClass.Unknown]: "",
};
