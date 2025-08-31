import { ItemType, SocketCategoryEnum, StatType, TierType } from "@/app/bungie/Enums.ts";
import { ArmorStatInvestments } from "@/app/inventory/logic/Helpers.ts";
import type { SocketCategory, Sockets } from "@/app/inventory/logic/Sockets.ts";
import type { DestinyItem, StatsCollection } from "@/app/inventory/logic/Types.ts";
import { ProfileDataHelpers } from "@/app/store/Definitions.ts";

// CREDIT: DIM for this article and code that collates information from their app,
// the community and info directly from Bungie.
// https://www.reddit.com/r/DestinyTheGame/comments/d8ahdl/dim_updates_stat_calculation_for_shadowkeep/
export function interpolateStatValue(value: number, investment: StatType, socketTypeHash: number) {
  if (ArmorStatInvestments.includes(investment)) {
    return value;
  }
  const statData = ProfileDataHelpers.statGroupHelper.get(socketTypeHash)?.get(investment);
  if (!statData) {
    return value;
  }
  const interpolation = statData.displayInterpolation;
  // Clamp the value to prevent overfilling
  const v = Math.min(value, statData.maximumValue);

  let endIndex = interpolation.findIndex((p) => p.value > v);

  // value < 0 is for mods with negative stats
  if (endIndex < 0) {
    endIndex = interpolation.length - 1;
  }
  const startIndex = Math.max(0, endIndex - 1);

  const start = interpolation[startIndex]!;
  const end = interpolation[endIndex]!;
  const range = end.value - start.value;

  if (range === 0) {
    return start.weight;
  }

  const t = (v - start.value) / (end.value - start.value);

  const interpolationValue = start.weight + t * (end.weight - start.weight);

  // vthorn has a hunch that magazine size doesn't use banker's rounding, but the rest definitely do:
  // https://github.com/Bungie-net/api/issues/1029#issuecomment-531849137
  return investment === StatType.Magazine ? Math.round(interpolationValue) : bankersRounding(interpolationValue);
}

// Bankers rounding function. Used for all stats but magazine
// https://wiki.c2.com/?BankersRounding
function bankersRounding(num: number): number {
  if (Math.abs(Math.round(num) - num) === 0.5) {
    return Math.floor(num) % 2 === 0 ? Math.floor(num) : Math.ceil(num);
  }
  return Math.round(num);
}

export type ItemStats = Map<StatType, number>;

export function createStats(destinyItem: DestinyItem, sockets: Sockets): ItemStats {
  if (destinyItem.def.itemType === ItemType.Weapon) {
    const stats: ItemStats = new Map<number, number>();

    addBaseStats(stats, destinyItem);

    const intrinsicCategory = sockets?.socketCategories.find(
      (category) => category.socketCategoryHash === SocketCategoryEnum.INTRINSIC_TRAITS,
    );
    if (intrinsicCategory) {
      addSocketStats(stats, intrinsicCategory);
    }
    const perksCategory = sockets?.socketCategories.find(
      (category) => category.socketCategoryHash === SocketCategoryEnum.WEAPON_PERKS,
    );
    if (perksCategory) {
      addSocketStats(stats, perksCategory);
    }
    const modsCategory = sockets?.socketCategories.find(
      (category) => category.socketCategoryHash === SocketCategoryEnum.WEAPON_MODS,
    );
    if (modsCategory) {
      addSocketStats(stats, modsCategory);
    }
    applyStatInterpolation(stats, destinyItem.def.statGroupHash);
    return stats;
  }

  if (destinyItem.def.itemType === ItemType.Armor) {
    const stats: ItemStats = new Map<number, number>();
    if (destinyItem.def.tierType === TierType.Exotic) {
      addBaseStats(stats, destinyItem);
    }

    const perksCategory = sockets?.socketCategories.find(
      (category) => category.socketCategoryHash === SocketCategoryEnum.ARMOR_PERKS,
    );
    if (perksCategory) {
      addSocketStats(stats, perksCategory);
    }

    const tierCategory = sockets?.socketCategories.find(
      (category) => category.socketCategoryHash === SocketCategoryEnum.ARMOR_TIER,
    );
    if (tierCategory) {
      addSocketStats(stats, tierCategory);
    }

    const modsCategory = sockets?.socketCategories.find(
      (category) => category.socketCategoryHash === SocketCategoryEnum.ARMOR_MODS,
    );
    if (modsCategory) {
      addSocketStats(stats, modsCategory);
    }
    return stats;
  }

  return new Map<number, number>();
}

function addBaseStats(stats: ItemStats, destinyItem: DestinyItem) {
  destinyItem.def.investmentStats.forEach((stat) => {
    stats.set(stat.statTypeHash, stat.value);
  });
}

const faultyMasterworkItems = [
  186337601, 266016299, 384158423, 758092021, 1154004463, 1639384016, 2697220197, 2993547493, 3128594062, 3803457565,
];

function fixFaultyMasterworkStats(statsCollection: StatsCollection[]): StatsCollection[] {
  let largestStat: StatsCollection = { statTypeHash: 0, value: 0 };

  for (const stat of statsCollection) {
    if (stat.value > largestStat.value) {
      largestStat = stat;
    }
  }
  return [largestStat];
}

function addSocketStats(statsArg: ItemStats, socketCategory: SocketCategory) {
  const stats = statsArg;

  socketCategory.topLevelSockets.forEach((column) => {
    if (column) {
      column.forEach((e) => {
        if (e.isEnabled) {
          let investments = e.def?.investmentStats;
          if (investments) {
            if (e.socketTypeHash && faultyMasterworkItems.includes(e.itemHash)) {
              investments = fixFaultyMasterworkStats(investments);
            }

            investments.forEach((stat) => {
              if (stats.has(stat.statTypeHash)) {
                const currentValue = stats.get(stat.statTypeHash) ?? 0;
                stats.set(stat.statTypeHash, currentValue + stat.value);
              } else {
                stats.set(stat.statTypeHash, stat.value);
              }
            });
          }
        }
      });
    }
  });
}

function applyStatInterpolation(stats: ItemStats, statGroupHash: number) {
  for (const [key, value] of stats) {
    const interpolationValue = interpolateStatValue(value, key, statGroupHash);
    stats.set(key, interpolationValue);
  }
}

function _logStatsObject(stats: ItemStats) {
  const d: Record<string, number> = {};
  for (const [key, value] of stats) {
    const keyName = StatType[key];
    if (keyName) {
      d[keyName] = value;
    }
  }
  console.log(d);
}
