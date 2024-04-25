import type { DestinyItemSort } from "@/app/bungie/Types.ts";

// biome-ignore lint/complexity/noBannedTypes: <explanation>
export const debounce = (func: Function, delay = 0) => {
  let timeoutId: string | number | NodeJS.Timeout | undefined;

  // biome-ignore lint/suspicious/noExplicitAny: <explanation>
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
        reject(error);
      });
  });
}

export function getCustomManifest(): Promise<JSON> {
  const requestOptions: RequestInit = {
    cache: "no-store",
    method: "GET",
  };

  return new Promise((resolve, reject) => {
    fetch("https://app.guardianghost.com/json/manifest.json", requestOptions)
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
        console.error("Failed to download custom manifest", error);
        reject(error);
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

export function itemHashAndQuantitySort(a: DestinyItemSort, b: DestinyItemSort): number {
  if (a.itemHash > b.itemHash) {
    return 1;
  }
  if (a.itemHash < b.itemHash) {
    return -1;
  }

  return a.quantity < b.quantity ? 1 : -1;
}

export function typeAndPowerSort(a: DestinyItemSort, b: DestinyItemSort): number {
  ///  subtype
  if (a.itemSubType > b.itemSubType) {
    return 1;
  }
  if (a.itemSubType < b.itemSubType) {
    return -1;
  }

  // /// primaryStat
  if (a.primaryStat < b.primaryStat) {
    return 1;
  }
  if (a.primaryStat > b.primaryStat) {
    return -1;
  }

  ///  tierType
  if (a.tierType < b.tierType) {
    return 1;
  }
  if (a.tierType > b.tierType) {
    return -1;
  }

  if (a.damageType > b.damageType) {
    return 1;
  }
  if (a.damageType < b.damageType) {
    return -1;
  }

  if (a.destinyClass > b.destinyClass) {
    return 1;
  }
  if (a.destinyClass < b.destinyClass) {
    return -1;
  }

  // ///  itemHash
  if (a.itemHash > b.itemHash) {
    return 1;
  }
  if (a.itemHash < b.itemHash) {
    return -1;
  }

  // /// Criteria: masterwork
  if (!a.masterwork && b.masterwork) {
    return 1;
  }
  if (a.masterwork && !b.masterwork) {
    return -1;
  }

  return a.itemInstanceId < b.itemInstanceId ? 1 : -1;
}
