import { AsyncStorage } from "expo-sqlite/kv-store";
import { parse, safeParse, string } from "valibot";
import type { StateCreator } from "zustand";
import Toast from "react-native-toast-message";
import { deepEqual } from "fast-equals";

import * as Defs from "@/app/store/Definitions.ts";
import type { ItemsDefinition } from "@/app/store/Definitions.ts";
import type { IStore } from "@/app/store/GGStore.ts";
import type { AsyncStorageKey } from "@/app/store/Types.ts";
import { getCustomItemDefinition, getJsonBlob } from "@/app/utilities/Helpers.ts";
import {
  ItemResponseSchema,
  MiniStatSchema,
  type DefinitionKey,
  type ItemResponse,
  type SocketCategoryDefinition,
  type StatDefinition,
  type StatGroupDefinition,
  type InventoryBucketDefinition,
  InventoryBucketSchema,
} from "@/app/core/BungieDefinitions.ts";
import { bungieUrl, type BungieManifest } from "@/app/core/ApiResponse.ts";

export type DefinitionsSliceSetter = Parameters<StateCreator<IStore, [], [], DefinitionsSlice>>[0];
export type DefinitionsSliceGetter = Parameters<StateCreator<IStore, [], [], DefinitionsSlice>>[1];

export interface DefinitionsSlice {
  itemsDefinitionReady: boolean;
  itemDefinitionVersion: string;
  bungieDefinitionsReady: boolean;
  bungieDefinitionVersions: string;
  previousDefinitionsSuccessfullyLoaded: boolean;

  snackBarVisible: boolean;
  snackBarMessage: string;
  inventorySectionWidth: number;
  setItemsDefinitionReady: () => void;
  setBungieDefinitionsReady: () => void;
  loadCustomDefinitions: (uniqueKey: string) => Promise<void>;
  loadBungieDefinitions: (bungieManifest: BungieManifest) => Promise<void>;
  fastLoadDefinitions: () => Promise<void>;
  showSnackBar: (message: string) => void;
  setInventorySectionWidth: (inventorySectionWidth: number) => void;
  clearCache: () => Promise<void>;
}

export const createDefinitionsSlice: StateCreator<IStore, [], [], DefinitionsSlice> = (set, get) => ({
  itemsDefinitionReady: false,
  itemDefinitionVersion: "",
  bungieDefinitionsReady: false,
  bungieDefinitionVersions: "",
  previousDefinitionsSuccessfullyLoaded: false,

  snackBarVisible: false,
  snackBarMessage: "",
  inventorySectionWidth: 0,
  setItemsDefinitionReady: () => {
    set({ itemsDefinitionReady: true });
    if (get().bungieDefinitionsReady && get().stateHydrated) {
      set({ appReady: true, previousDefinitionsSuccessfullyLoaded: true });
    }
  },
  setBungieDefinitionsReady: () => {
    set({ bungieDefinitionsReady: true });
    if (get().itemsDefinitionReady && get().stateHydrated) {
      const p1 = get().appStartupTime;
      const p2 = performance.now();
      console.log("setItemsDefinitionReady", `${(p2 - p1).toFixed(4)} ms`);
      set({ appReady: true, previousDefinitionsSuccessfullyLoaded: true });
    }
  },
  loadCustomDefinitions: async (uniqueKey) => {
    const storedVersion = get().itemDefinitionVersion;
    // Don't attempt to get an already loaded definition
    if (storedVersion === uniqueKey && get().itemsDefinitionReady) {
      return;
    }

    if (storedVersion === uniqueKey) {
      // use the already downloaded version
      await loadLocalItemDefinitionVersion(get, set);
    } else {
      // download a version
      console.log("download a version");
      await downloadAndStoreItemDefinition(get, set);
    }
  },
  loadBungieDefinitions: async (bungieManifest) => {
    const storedVersion = get().bungieDefinitionVersions;
    const versionKey = bungieManifest?.Response.version;

    // Don't attempt to get an already loaded definition
    if (storedVersion === versionKey && get().bungieDefinitionsReady) {
      return;
    }

    if (storedVersion === versionKey) {
      // use the already downloaded version
      await loadLocalBungieDefinitions(get, set);
    } else {
      // download a new version
      console.log("download a new bungie definitions as KEY is different", storedVersion, ":", versionKey);
      await downloadAndStoreBungieDefinitions(get, set, bungieManifest);
    }
  },
  fastLoadDefinitions: async () => {
    loadLocalItemDefinitionVersion(get, set);
    loadLocalBungieDefinitions(get, set);
  },
  showSnackBar: (message) => {
    Toast.show({
      type: "success",
      text1: message,
    });
  },
  setInventorySectionWidth: (inventorySectionWidth) => set({ inventorySectionWidth }),
  clearCache: async () => {
    await removeAsyncStorageItem("CACHED_PROFILE");
    set({ itemDefinitionVersion: "", bungieDefinitionVersions: "", itemsDefinitionReady: false });
  },
});

async function loadLocalItemDefinitionVersion(get: DefinitionsSliceGetter, set: DefinitionsSliceSetter): Promise<void> {
  try {
    const loadedDefinition = await getAsyncStorageJSON("ITEM_DEFINITION", "getItemDefinition()");
    const itemDefinition = parse(ItemResponseSchema, loadedDefinition);
    parseAndSet(get, itemDefinition);
  } catch (e) {
    console.error("Failed to load itemDefinition version. Downloading new version...", e);
    await downloadAndStoreItemDefinition(get, set);
  }
}

async function downloadAndStoreItemDefinition(get: DefinitionsSliceGetter, set: DefinitionsSliceSetter): Promise<void> {
  try {
    const downloadedDefinition = await getCustomItemDefinition();
    const itemDefinition = parse(ItemResponseSchema, downloadedDefinition);
    const versionKey = itemDefinition.id;
    set({ itemDefinitionVersion: versionKey });
    await setAsyncStorageJSON("ITEM_DEFINITION", itemDefinition as unknown as JSON, "setupItemDefinition()");
    parseAndSet(get, itemDefinition);
  } catch (e) {
    // TODO: Show big error message
    console.error("Failed to download and save itemDefinition", e);
  }
}

const BungieDefinitions: DefinitionKey[] = [
  "DestinySocketCategoryDefinition",
  "DestinyStatGroupDefinition",
  "DestinyStatDefinition",
  "DestinyInventoryBucketDefinition",
];

const NonInterpolationTable = [
  { value: 0, weight: 0 },
  { value: 100, weight: 100 },
];

let failCount = 0;

async function downloadAndStoreBungieDefinitions(
  get: DefinitionsSliceGetter,
  set: DefinitionsSliceSetter,
  bungieManifest: BungieManifest | null,
): Promise<void> {
  const versionKey = bungieManifest?.Response.version;
  if (!versionKey) {
    console.error("No version key found in bungieManifest");
    return;
  }
  try {
    const promises: Promise<JSON>[] = [];

    for (const key of BungieDefinitions) {
      console.log("downloading", key);
      const path = bungieManifest?.Response.jsonWorldComponentContentPaths.en?.[key];

      if (path) {
        const url = `${bungieUrl}${path}`;
        const downloadedDefinition = getJsonBlob(url);
        promises.push(downloadedDefinition);
      }
    }
    const completedDefinitions = await Promise.all(promises);

    if (completedDefinitions[0]) {
      const stringifiedSocketCategoryDefinition = JSON.stringify(completedDefinitions[0]);

      await setAsyncStorage("DestinySocketCategoryDefinition", stringifiedSocketCategoryDefinition);
      Defs.setDestinySocketCategoryDefinition(completedDefinitions[0] as unknown as SocketCategoryDefinition);
    } else {
      throw new Error("No DestinySocketCategoryDefinition");
    }

    if (completedDefinitions[1]) {
      // Strip out the interpolation tables that do nothing and halve the size of the saved definition.
      // This also saves interpolateStatValue() from having to do a calculation.
      const socketGroupDefinition = completedDefinitions[1] as unknown as StatGroupDefinition;
      for (const stat in socketGroupDefinition) {
        const socketGroup = socketGroupDefinition?.[stat];
        if (socketGroup) {
          for (const statHash of socketGroup.scaledStats) {
            if (deepEqual(statHash.displayInterpolation, NonInterpolationTable)) {
              socketGroup.scaledStats = socketGroup.scaledStats.filter((s) => s.statHash !== statHash.statHash);
            }
          }
        }
      }
      const stringifiedStatGroupDefinition = JSON.stringify(socketGroupDefinition, null, 0);

      await setAsyncStorage("DestinyStatGroupDefinition", stringifiedStatGroupDefinition);
      Defs.setDestinyStatGroupDefinition(socketGroupDefinition);
    } else {
      throw new Error("No DestinyStatGroupDefinition");
    }

    if (completedDefinitions[2]) {
      const parsedStatDefinition = safeParse(MiniStatSchema, completedDefinitions[2]);
      console.log("parsedStatDefinition", parsedStatDefinition.success, parsedStatDefinition.issues);
      if (parsedStatDefinition.success) {
        const stringifiedStatDefinition = JSON.stringify(parsedStatDefinition.output, null, 0);
        await setAsyncStorage("DestinyStatDefinition", stringifiedStatDefinition);
        Defs.setDestinyStatDefinition(parsedStatDefinition.output as unknown as StatDefinition);
      }
    } else {
      throw new Error("No DestinyStatGroupDefinition");
    }

    if (completedDefinitions[3]) {
      const parsedInventoryBucketDefinition = safeParse(InventoryBucketSchema, completedDefinitions[3]);

      if (parsedInventoryBucketDefinition.success) {
        const stringifiedInventoryBucketDefinition = JSON.stringify(parsedInventoryBucketDefinition.output, null, 0);
        await setAsyncStorage("DestinyInventoryBucketDefinition", stringifiedInventoryBucketDefinition);
        Defs.setDestinyInventoryBucketDefinition(
          parsedInventoryBucketDefinition.output as unknown as InventoryBucketDefinition,
        );
      }
    } else {
      throw new Error("No DestinyInventoryBucketDefinition");
    }
    set({ bungieDefinitionVersions: versionKey });
    get().setBungieDefinitionsReady();
  } catch (e) {
    console.error("Failed to download and save bungieDefinition", e);
    if (failCount < 5) {
      failCount++;
      console.error("Failed to download and save bungieDefinition", e);
      await new Promise((resolve) => setTimeout(resolve, 500));
      await downloadAndStoreBungieDefinitions(get, set, bungieManifest);
    } else {
      // show error toast
      console.error("Failed to download and save bungieDefinition", e);
      throw new Error("Failed to download and save bungieDefinition");
    }
  }
}

async function loadLocalBungieDefinitions(get: DefinitionsSliceGetter, set: DefinitionsSliceSetter): Promise<void> {
  try {
    const socketDefJson = await getAsyncStorageJSON("DestinySocketCategoryDefinition");
    Defs.setDestinySocketCategoryDefinition(socketDefJson as unknown as SocketCategoryDefinition);

    const statGroupDefJson = await getAsyncStorageJSON("DestinyStatGroupDefinition");
    Defs.setDestinyStatGroupDefinition(statGroupDefJson as unknown as StatGroupDefinition);

    const statDefJson = await getAsyncStorageJSON("DestinyStatDefinition");
    Defs.setDestinyStatDefinition(statDefJson as unknown as StatDefinition);

    const inventoryBucketDefJson = await getAsyncStorageJSON("DestinyInventoryBucketDefinition");
    Defs.setDestinyInventoryBucketDefinition(inventoryBucketDefJson as unknown as InventoryBucketDefinition);
    get().setBungieDefinitionsReady();
  } catch (e) {
    console.error("Failed to load bungieDefinition version", e);
    set({ bungieDefinitionVersions: "", bungieDefinitionsReady: false });
    // TODO: Should error. Show something to the user that lets them restart the app. In the sense of running init again.
  }
}

function parseAndSet(get: DefinitionsSliceGetter, itemDefinition: ItemResponse) {
  Defs.setItemDefinition(itemDefinition.items as ItemsDefinition);
  Defs.setHelpers(itemDefinition.helpers);
  get().setItemsDefinitionReady();
}

export async function removeAsyncStorageItem(key: AsyncStorageKey): Promise<void> {
  try {
    await AsyncStorage.removeItem(key);
    console.log("removed", key);
  } catch (error: unknown) {
    console.error("Failed to remove", error, key);
    throw new Error(`Failed to remove AsyncStorage ${key}`);
  }
}

export async function getAsyncStorageJSON(key: AsyncStorageKey, errorMessage?: string): Promise<JSON> {
  const data = await getAsyncStorage(key, errorMessage);
  return JSON.parse(data);
}

export async function getAsyncStorage(key: AsyncStorageKey, errorMessage?: string): Promise<string> {
  const data = await AsyncStorage.getItem(key);
  if (data) {
    const validatedVersion = safeParse(string(), data);

    if (validatedVersion.success) {
      return validatedVersion.output;
    }
    console.error("Validation failed", errorMessage);
    throw new Error("Validation failed");
  }
  console.error("No saved AsyncStorage found", errorMessage);
  throw new Error(`No saved AsyncStorage found: ${key}`);
}

export async function setAsyncStorageJSON(key: AsyncStorageKey, data: JSON, errorMessage?: string): Promise<void> {
  const stringifiedData = JSON.stringify(data);
  await setAsyncStorage(key, stringifiedData, errorMessage);
}

export async function setAsyncStorage(key: AsyncStorageKey, data: string, errorMessage?: string): Promise<void> {
  try {
    await AsyncStorage.setItem(key, data);
    console.log("saved", key);
  } catch (error: unknown) {
    console.error("Failed to save", error, key, errorMessage);
    throw new Error(`Failed to save AsyncStorage ${key}`);
  }
}
