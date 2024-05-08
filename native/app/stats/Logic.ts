import { StatType } from "@/app/bungie/Enums.ts";
import { ArmorStatInvestments } from "@/app/inventory/logic/Helpers.ts";
import type { SocketCategory } from "@/app/inventory/logic/Sockets.ts";
import type { DestinyItem } from "@/app/inventory/logic/Types.ts";
import { StatGroupHelper } from "@/app/store/Definitions.ts";

// CREDIT: DIM for this article and code that collates information from their app,
// the community and info directly from Bungie.
// https://www.reddit.com/r/DestinyTheGame/comments/d8ahdl/dim_updates_stat_calculation_for_shadowkeep/
export function interpolateStatValue(value: number, investment: StatType, socketTypeHash: number) {
  if (ArmorStatInvestments.includes(investment)) {
    return value;
  }
  const statData = StatGroupHelper.get(socketTypeHash)?.get(investment);
  if (!statData) {
    console.log("No statData found", investment, socketTypeHash);
    return value;
  }
  const interpolation = statData.displayInterpolation;
  // Clamp the value to prevent overfilling
  const v = Math.min(value, statData.maximumValue);
  console.log("interpolation", statData);

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

  const t = (value - start.value) / (end.value - start.value);

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

export function socketDebug(destinyItem: DestinyItem, socketCategory: SocketCategory) {
  const p1 = performance.now();
  const stats = new Map<number, number>();

  destinyItem.def.investmentStats.map((stat) => {
    stats.set(stat.statTypeHash, stat.value);
  });

  socketCategory.topLevelSockets.map((column) => {
    if (column) {
      column.map((e) => {
        if (e.isEnabled && e.socketDefinition?.investmentStats) {
          e.socketDefinition.investmentStats.map((stat) => {
            if (stats.has(stat.statTypeHash)) {
              const currentValue = stats.get(stat.statTypeHash) ?? 0;
              stats.set(stat.statTypeHash, currentValue + stat.value);
            } else {
              stats.set(stat.statTypeHash, stat.value);
            }
          });
        }
      });
    }
  });

  // const statsGroupData = buildStatsInterpolationData(destinyItem.def.statGroupHash);
  // console.log("StatGroupHash", destinyItem.def.statGroupHash);
  const foo: Record<string, number> = {};
  for (const [key, value] of stats) {
    const keyName = StatType[key];
    const newValue = interpolateStatValue(value, key, destinyItem.def.statGroupHash);
    if (keyName) {
      foo[keyName] = newValue;
    }
  }
  const p2 = performance.now();
  console.log("debug", `${(p2 - p1).toFixed(4)} ms`);
  console.log(foo);
}
