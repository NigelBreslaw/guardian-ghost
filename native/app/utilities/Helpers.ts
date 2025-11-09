import { GuardianClassType } from "@/app/bungie/Enums.ts";
import type { DestinyItemSort } from "@/app/inventory/logic/Types.ts";
import { apiKey } from "@/constants/env.ts";

declare const __brand: unique symbol;
type Brand<B> = { [__brand]: B };
export type Branded<T, B> = T & Brand<B>;

// biome-ignore lint/complexity/noBannedTypes: The debounce helper forwards any callable without narrowing the signature.
export const debounce = (func: Function, delay = 0) => {
  let timeoutId: ReturnType<typeof setTimeout> | undefined;

  // biome-ignore lint/suspicious/noExplicitAny: Variadic arguments must remain untyped to preserve the wrapped call signature.
  return (...args: any) => {
    clearTimeout(timeoutId);

    timeoutId = setTimeout(() => {
      func.apply(this, args);
    }, delay);
  };
};

export function getCustomItemDefinition(language = "en"): Promise<JSON> {
  const requestOptions: RequestInit = {
    method: "GET",
  };

  return new Promise((resolve, reject) => {
    fetch(`https://app.guardianghost.com/json/${language}.json`, requestOptions)
      .then((response) => {
        if (!response.ok) {
          console.error(response);
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        return response.json();
      })
      .then((data) => {
        resolve(data);
      })
      .catch((error) => {
        console.error("Failed to download custom Item Definition", error);
        reject(new Error(`Failed to download custom Item Definition ${error}`));
      });
  });
}

// biome-ignore lint/suspicious/noExplicitAny: <Generic function>
export function benchmark<T extends any[], R>(func: (...args: T) => R, ...args: T): R {
  const start = performance.now();
  const result = func(...args);
  const end = performance.now();
  console.log(`${func.name}() took: ${(end - start).toFixed(4)} ms`);
  return result;
}

// biome-ignore lint/suspicious/noExplicitAny: <Generic function>
export async function benchmarkAsync<T extends any[], R>(func: (...args: T) => Promise<R>, ...args: T): Promise<R> {
  const start = performance.now();
  const result = await func(...args);
  const end = performance.now();
  console.log(`${func.name}() took: ${(end - start).toFixed(4)} ms`);
  return result;
}

export function bitmaskContains(bitmask: number, value: number): boolean {
  return (bitmask & value) === value;
}

export function getBitmaskValues(bitmask: number): number[] {
  const values: number[] = [];
  let mask = 1;

  while (bitmask >= mask) {
    if ((bitmask & mask) !== 0) {
      values.push(mask);
    }
    mask = mask << 1;
  }

  return values;
}

const consumablesOrder = [
  3905974032, /// Synthstrand
  3855200273, /// Rigid Synthcord
  3107195131, /// Sleek Synthcord
  3552107018, /// Plush Synthcord

  1476367555,
  1210362881,
  1277677855,
  398376520,
  990304814,
  3803054958,
  4076644238,
  2540418730,
  2434439500,
  4046539562,
  3853748946,
  2979281381,
  4257549984,
  3467984096, /// Exotic cipher
  4257549985,
  2891979647,
  685157383,
  685157381,
  2640973641,
  494493680,
  3201839676,
  3825769808,
  3022799524,
  3135658658,
  3899548068,
  1431165322,
  3957264072,
  183980811,
  1504542608,
  1505278293,
  885593286,
  2959556799,
  1270564331,
  2270228604,
  1873857625,
  3702027555,
  759381183,
  3282419336,
  4285666432, //nightfall card

  2201818872, // feeble offering
  2201818875, // robust offering
  2201818874, // powerful offering

  1880080506, // lair key
  1224079819, // defiant key
  2392300858, // witch's key

  4101386442,
  2109561326,
  3260482534,
  3536420626,
  2916406440,
  3196288028,
  478751073,
  950899352,
  461171930,
  2014411539,
  2949414982,
  3487922223,
  3756389242,
  1305274547,
  2386485406,
  49145143,
  685095924,
  31293053, //seraphite
  1177810185,
  592227263,
  3592324052,
  293622383,
  1485756901,

  581237363,
  426283548,

  3421463185,
  3147640224,
  4114204995,
  2993288448,
  2367713531,
  1633854071,
  685299502,
  810623803,
  771273473,
  2473252800,
  3923650007,
  3516481563,
  3040412000,
  3516481562,
  3516481561,
  889896758,
  3552598030,
  3948022968,
  1691570586,
  3782248531,
  717261397,
  457334494,
  4025113300,
  937378714,
  443031982,
  443031983,
  723146156,
  1776857076,
  1425776985,
];

// The array is too large to check, so create a lookup object
const consumablesOrderLookup: Record<number, number> = consumablesOrder.reduce(
  (acc: Record<number, number>, item: number, index: number) => {
    acc[item] = index;
    return acc;
  },
  {},
);

export function itemHashAndQuantitySort(a: DestinyItemSort, b: DestinyItemSort): number {
  const aIndex = consumablesOrderLookup[a.itemHash] ?? 0;
  const bIndex = consumablesOrderLookup[b.itemHash] ?? 0;

  if (aIndex > bIndex) {
    return 1;
  }
  if (aIndex < bIndex) {
    return -1;
  }
  if (a.itemHash > b.itemHash) {
    return 1;
  }
  if (a.itemHash < b.itemHash) {
    return -1;
  }

  return a.quantity < b.quantity ? 1 : -1;
}

export function weaponPowerSort(a: DestinyItemSort, b: DestinyItemSort): number {
  if (a.instance.primaryStat < b.instance.primaryStat) {
    return 1;
  }
  if (a.instance.primaryStat > b.instance.primaryStat) {
    return -1;
  }

  if (a.def.tierType < b.def.tierType) {
    return 1;
  }
  if (a.def.tierType > b.def.tierType) {
    return -1;
  }

  if (a.def.itemSubType > b.def.itemSubType) {
    return 1;
  }
  if (a.def.itemSubType < b.def.itemSubType) {
    return -1;
  }

  if (a.damageType > b.damageType) {
    return 1;
  }
  if (a.damageType < b.damageType) {
    return -1;
  }

  if (a.def.destinyClass > b.def.destinyClass) {
    return 1;
  }
  if (a.def.destinyClass < b.def.destinyClass) {
    return -1;
  }

  if (a.itemHash > b.itemHash) {
    return 1;
  }
  if (a.itemHash < b.itemHash) {
    return -1;
  }

  if (!a.instance.masterwork && b.instance.masterwork) {
    return 1;
  }
  if (a.instance.masterwork && !b.instance.masterwork) {
    return -1;
  }

  return a.itemInstanceId < b.itemInstanceId ? 1 : -1;
}

export function weaponTypeAndPowerSort(a: DestinyItemSort, b: DestinyItemSort): number {
  if (a.def.itemSubType > b.def.itemSubType) {
    return 1;
  }
  if (a.def.itemSubType < b.def.itemSubType) {
    return -1;
  }

  if (a.instance.primaryStat < b.instance.primaryStat) {
    return 1;
  }
  if (a.instance.primaryStat > b.instance.primaryStat) {
    return -1;
  }

  if (a.def.tierType < b.def.tierType) {
    return 1;
  }
  if (a.def.tierType > b.def.tierType) {
    return -1;
  }

  if (a.damageType > b.damageType) {
    return 1;
  }
  if (a.damageType < b.damageType) {
    return -1;
  }

  if (a.def.destinyClass > b.def.destinyClass) {
    return 1;
  }
  if (a.def.destinyClass < b.def.destinyClass) {
    return -1;
  }

  if (a.itemHash > b.itemHash) {
    return 1;
  }
  if (a.itemHash < b.itemHash) {
    return -1;
  }

  if (!a.instance.masterwork && b.instance.masterwork) {
    return 1;
  }
  if (a.instance.masterwork && !b.instance.masterwork) {
    return -1;
  }

  return a.itemInstanceId < b.itemInstanceId ? 1 : -1;
}

export function armorPowerSort(a: DestinyItemSort, b: DestinyItemSort): number {
  if (a.def.destinyClass > b.def.destinyClass) {
    return 1;
  }
  if (a.def.destinyClass < b.def.destinyClass) {
    return -1;
  }

  if (a.instance.primaryStat < b.instance.primaryStat) {
    return 1;
  }
  if (a.instance.primaryStat > b.instance.primaryStat) {
    return -1;
  }

  if (a.def.tierType < b.def.tierType) {
    return 1;
  }
  if (a.def.tierType > b.def.tierType) {
    return -1;
  }
  if (!a.instance.masterwork && b.instance.masterwork) {
    return 1;
  }
  if (a.instance.masterwork && !b.instance.masterwork) {
    return -1;
  }

  if (a.itemHash > b.itemHash) {
    return 1;
  }
  if (a.itemHash < b.itemHash) {
    return -1;
  }

  return a.itemInstanceId < b.itemInstanceId ? 1 : -1;
}

export function armorTypeSort(a: DestinyItemSort, b: DestinyItemSort): number {
  if (a.def.destinyClass > b.def.destinyClass) {
    return 1;
  }
  if (a.def.destinyClass < b.def.destinyClass) {
    return -1;
  }

  if (a.def.tierType < b.def.tierType) {
    return 1;
  }
  if (a.def.tierType > b.def.tierType) {
    return -1;
  }
  if (a.itemHash > b.itemHash) {
    return 1;
  }
  if (a.itemHash < b.itemHash) {
    return -1;
  }

  if (!a.instance.masterwork && b.instance.masterwork) {
    return 1;
  }
  if (a.instance.masterwork && !b.instance.masterwork) {
    return -1;
  }

  if (a.instance.primaryStat < b.instance.primaryStat) {
    return 1;
  }
  if (a.instance.primaryStat > b.instance.primaryStat) {
    return -1;
  }

  return a.itemInstanceId < b.itemInstanceId ? 1 : -1;
}

export function weaponTypeSort(a: DestinyItemSort, b: DestinyItemSort): number {
  if (a.def.itemSubType > b.def.itemSubType) {
    return 1;
  }
  if (a.def.itemSubType < b.def.itemSubType) {
    return -1;
  }

  if (a.def.tierType < b.def.tierType) {
    return 1;
  }
  if (a.def.tierType > b.def.tierType) {
    return -1;
  }

  if (a.damageType > b.damageType) {
    return 1;
  }
  if (a.damageType < b.damageType) {
    return -1;
  }

  if (a.def.destinyClass > b.def.destinyClass) {
    return 1;
  }
  if (a.def.destinyClass < b.def.destinyClass) {
    return -1;
  }

  if (a.itemHash > b.itemHash) {
    return 1;
  }
  if (a.itemHash < b.itemHash) {
    return -1;
  }

  if (a.instance.primaryStat < b.instance.primaryStat) {
    return 1;
  }
  if (a.instance.primaryStat > b.instance.primaryStat) {
    return -1;
  }

  if (!a.instance.masterwork && b.instance.masterwork) {
    return 1;
  }
  if (a.instance.masterwork && !b.instance.masterwork) {
    return -1;
  }

  return a.itemInstanceId < b.itemInstanceId ? 1 : -1;
}

export function modSort(b: DestinyItemSort, a: DestinyItemSort): number {
  /// Criteria 1: sorting value
  if (a.def.plugCategoryIdentifier.includes("mod") && !b.def.plugCategoryIdentifier.includes("mod")) {
    return 1;
  }

  if (!a.def.plugCategoryIdentifier.includes("mod") && b.def.plugCategoryIdentifier.includes("mod")) {
    return -1;
  }

  if (a.def.plugCategoryIdentifier.includes("enhancements") && !b.def.plugCategoryIdentifier.includes("enhancements")) {
    return 1;
  }
  if (!a.def.plugCategoryIdentifier.includes("enhancements") && b.def.plugCategoryIdentifier.includes("enhancements")) {
    return -1;
  }

  if (a.def.plugCategoryIdentifier.includes("spawnfx") && !b.def.plugCategoryIdentifier.includes("spawnfx")) {
    return 1;
  }
  if (!a.def.plugCategoryIdentifier.includes("spawnfx") && b.def.plugCategoryIdentifier.includes("spawnfx")) {
    return -1;
  }

  if (a.def.plugCategoryIdentifier > b.def.plugCategoryIdentifier) {
    return 1;
  }
  if (a.def.plugCategoryIdentifier < b.def.plugCategoryIdentifier) {
    return -1;
  }

  if (a.def.tierType > b.def.tierType) {
    return 1;
  }
  if (a.def.tierType < b.def.tierType) {
    return -1;
  }

  /// criteria 3: itemHash
  return a.itemHash > b.itemHash ? 1 : -1;
}

export function getGuardianClassType(classType: GuardianClassType | undefined) {
  switch (classType) {
    case 0:
      return "Titan";
    case 1:
      return "Hunter";
    case 2:
      return "Warlock";
    case GuardianClassType.Vault:
      return "Vault";
    default:
      return "";
  }
}

export function getGuardianRaceType(raceType: number) {
  switch (raceType) {
    case 0:
      return "Human";
    case 1:
      return "Awoken";
    case 2:
      return "Exo";
    default:
      return "";
  }
}

export function getJsonBlob(jsonUrl: string, includeHeaders?: boolean): Promise<JSON> {
  const headers = new Headers();
  if (includeHeaders) {
    headers.append("X-API-Key", apiKey);
    headers.append("Accept", "application/json");
  }

  const requestOptions: RequestInit = {
    method: "GET",
    headers: headers,
  };
  return new Promise((resolve, reject) => {
    fetch(jsonUrl, requestOptions)
      .then((response) => {
        if (!response.ok) {
          console.error(response);
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        return response.json();
      })
      .then((data) => {
        resolve(data);
      })
      .catch((error) => {
        console.error("Failed to download getJsonBlog", error);
        reject(new Error("Failed to download getJsonBlog", error));
      });
  });
}
