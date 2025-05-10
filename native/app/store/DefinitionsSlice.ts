import AsyncStorage from "@react-native-async-storage/async-storage";
import { AsyncStorage as AsyncStorageSQL } from "expo-sqlite/kv-store";
import { Platform } from "react-native";
import { parse, safeParse, string } from "valibot";
import type { StateCreator } from "zustand";
import Toast from "react-native-toast-message";
import { deepEqual } from "fast-equals";

import {
  setItemDefinition,
  type ItemsDefinition,
  setBucketTypeHashArray,
  setIconWaterMarks,
  setItemTypeDisplayName,
  setStackUniqueLabel,
  setPlugCategoryIdentifier,
  setDamageTypeHashes,
  setDescriptions,
  setDisplaySources,
  setExpirationTooltip,
  setExpiredInActivityMessage,
  setItemValue,
  setInsertionMaterialRequirementHash,
  setPlugCategoryHash,
  setReusablePlugSetHash,
  setSingleInitialItemHash,
  setSocketCategoryHash,
  setSocketTypeHash,
  setStatGroupHash,
  setStatHash,
  setTalentGridHash,
  setTooltipNotifications,
  setTraitIds,
  setUiItemDisplayStyle,
  setUiPlugLabel,
  setSocketCategories,
  setSocketEntries,
  setSocketIndexes,
  setDestinySocketCategoryDefinition,
  setDestinyStatGroupDefinition,
  setIcons,
  setDestinyStatDefinition,
  setDestinyInventoryBucketDefinition,
} from "@/app/store/Definitions.ts";
import type { IStore } from "@/app/store/GGStore.ts";
import { DatabaseStore, type AsyncStorageKey, type StorageKey } from "@/app/store/Types.ts";
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
import type { ItemHash } from "@/app/core/GetProfile.ts";

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
    await removeAsyncStorageItem("@GG_profile");
    await removeAsyncStorageItem("@GG_itemComponents");
    await removeAsyncStorageItem("@GG_profilePlugSets");
    set({ itemDefinitionVersion: "", bungieDefinitionVersions: "", itemsDefinitionReady: false });
  },
});

async function loadLocalItemDefinitionVersion(get: DefinitionsSliceGetter, set: DefinitionsSliceSetter): Promise<void> {
  try {
    const loadedDefinition = await getData("ITEM_DEFINITION", "getItemDefinition()");
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
    await setData(itemDefinition as unknown as JSON, "ITEM_DEFINITION", "setupItemDefinition()");
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
      setDestinySocketCategoryDefinition(completedDefinitions[0] as unknown as SocketCategoryDefinition);
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
      setDestinyStatGroupDefinition(socketGroupDefinition);
    } else {
      throw new Error("No DestinyStatGroupDefinition");
    }

    if (completedDefinitions[2]) {
      const parsedStatDefinition = safeParse(MiniStatSchema, completedDefinitions[2]);
      console.log("parsedStatDefinition", parsedStatDefinition.success, parsedStatDefinition.issues);
      if (parsedStatDefinition.success) {
        const stringifiedStatDefinition = JSON.stringify(parsedStatDefinition.output, null, 0);
        await setAsyncStorage("DestinyStatDefinition", stringifiedStatDefinition);
        setDestinyStatDefinition(parsedStatDefinition.output as unknown as StatDefinition);
      }
    } else {
      throw new Error("No DestinyStatGroupDefinition");
    }

    if (completedDefinitions[3]) {
      const parsedInventoryBucketDefinition = safeParse(InventoryBucketSchema, completedDefinitions[3]);

      if (parsedInventoryBucketDefinition.success) {
        const stringifiedInventoryBucketDefinition = JSON.stringify(parsedInventoryBucketDefinition.output, null, 0);
        await setAsyncStorage("DestinyInventoryBucketDefinition", stringifiedInventoryBucketDefinition);
        setDestinyInventoryBucketDefinition(
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
    const loadSocketTypeDefinition = await getAsyncStorage("DestinySocketCategoryDefinition");
    const socketDefJson = JSON.parse(loadSocketTypeDefinition);
    setDestinySocketCategoryDefinition(socketDefJson as SocketCategoryDefinition);

    const loadStatGroupDefinition = await getAsyncStorage("DestinyStatGroupDefinition");
    const statGroupDefJson = JSON.parse(loadStatGroupDefinition);
    setDestinyStatGroupDefinition(statGroupDefJson as StatGroupDefinition);

    const loadStatDefinition = await getAsyncStorage("DestinyStatDefinition");
    const statDefJson = JSON.parse(loadStatDefinition);
    setDestinyStatDefinition(statDefJson as StatDefinition);

    const loadInventoryBucketDefinition = await getAsyncStorage("DestinyInventoryBucketDefinition");
    const inventoryBucketDefJson = JSON.parse(loadInventoryBucketDefinition);
    setDestinyInventoryBucketDefinition(inventoryBucketDefJson as InventoryBucketDefinition);
    get().setBungieDefinitionsReady();
  } catch (e) {
    console.error("Failed to load bungieDefinition version", e);
    set({ bungieDefinitionVersions: "", bungieDefinitionsReady: false });
    // TODO: Should error. Show something to the user that lets them restart the app. In the sense of running init again.
  }
}

function parseAndSet(get: DefinitionsSliceGetter, itemDefinition: ItemResponse) {
  setItemDefinition(itemDefinition.items as ItemsDefinition);
  setBucketTypeHashArray(itemDefinition.helpers.BucketTypeHash);
  setDamageTypeHashes(itemDefinition.helpers.DamageTypeHashes);
  setDescriptions(itemDefinition.helpers.Descriptions);
  setDisplaySources(itemDefinition.helpers.DisplaySources);
  setExpirationTooltip(itemDefinition.helpers.ExpirationTooltip);
  setExpiredInActivityMessage(itemDefinition.helpers.ExpiredInActivityMessage);
  setIconWaterMarks(itemDefinition.helpers.IconWaterMark);
  setItemTypeDisplayName(itemDefinition.helpers.ItemTypeDisplayName);
  setItemValue(itemDefinition.helpers.ItemValue);
  setInsertionMaterialRequirementHash(itemDefinition.helpers.InsertionMaterialRequirementHash);
  setPlugCategoryHash(itemDefinition.helpers.PlugCategoryHash);
  setPlugCategoryIdentifier(itemDefinition.helpers.PlugCategoryIdentifier);
  setReusablePlugSetHash(itemDefinition.helpers.ReusablePlugSetHash);
  setSingleInitialItemHash(itemDefinition.helpers.SingleInitialItemHash as ItemHash[]);
  setSocketCategories(itemDefinition.helpers.SocketCategories);
  setSocketCategoryHash(itemDefinition.helpers.SocketCategoryHash);
  setSocketEntries(itemDefinition.helpers.SocketEntries);
  setSocketIndexes(itemDefinition.helpers.SocketIndexes);
  setSocketTypeHash(itemDefinition.helpers.SocketTypeHash);
  setStackUniqueLabel(itemDefinition.helpers.StackUniqueLabel);
  setStatGroupHash(itemDefinition.helpers.StatGroupHash);
  setStatHash(itemDefinition.helpers.StatHash);
  setTalentGridHash(itemDefinition.helpers.TalentGridHash);
  setTooltipNotifications(itemDefinition.helpers.TooltipNotifications);
  setTraitIds(itemDefinition.helpers.TraitIds);
  setUiItemDisplayStyle(itemDefinition.helpers.UiItemDisplayStyle);
  setUiPlugLabel(itemDefinition.helpers.UiPlugLabel);
  setIcons(itemDefinition.helpers.Icons);

  get().setItemsDefinitionReady();
}

async function getData(storageKey: StorageKey, errorMessage: string): Promise<JSON> {
  if (Platform.OS === "web") {
    return getWebStore(storageKey, errorMessage);
  }
  const dataString = await getAsyncStorageSQL(storageKey);
  const data = JSON.parse(dataString);
  return data;
}

function getWebStore(storageKey: StorageKey, errorMessage: string): Promise<JSON> {
  return new Promise((resolve, reject) => {
    const openRequest = indexedDB.open(DatabaseStore.factoryName, 1);

    openRequest.onupgradeneeded = () => {
      const db = openRequest.result;
      if (!db.objectStoreNames.contains(DatabaseStore.storeName)) {
        db.createObjectStore(DatabaseStore.storeName);
      }
    };

    openRequest.onerror = () => {
      console.error("setWebStore Error", errorMessage, openRequest.error);
      reject(new Error(`setWebStore Error ${errorMessage}`));
    };

    openRequest.onsuccess = () => {
      const db = openRequest.result;
      const tx = db.transaction(DatabaseStore.storeName, "readwrite");
      const store = tx.objectStore(DatabaseStore.storeName);

      const getRequest = store.get(storageKey);

      getRequest.onsuccess = () => {
        console.log("data retrieved from store", storageKey);
        resolve(getRequest.result);
      };

      getRequest.onerror = () => {
        console.error("Error", getRequest.error);
      };
    };
  });
}

async function setData(data: JSON, storageKey: StorageKey, errorMessage: string): Promise<void> {
  if (Platform.OS === "web") {
    try {
      await setWebStore(data, storageKey, errorMessage);
    } catch (e) {
      console.log("setData() ERROR", e);
    }
  } else {
    try {
      const jsonString = JSON.stringify(data, null, 0);
      await setAsyncStorageSQL(storageKey, jsonString);
    } catch (e) {
      console.log("setData() ERROR", e);
    }
  }
}

function setWebStore(data: JSON, storageKey: StorageKey, errorMessage: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const openRequest = indexedDB.open(DatabaseStore.factoryName, 1);

    openRequest.onupgradeneeded = () => {
      const db = openRequest.result;
      if (!db.objectStoreNames.contains(DatabaseStore.storeName)) {
        db.createObjectStore(DatabaseStore.storeName);
      }
    };

    openRequest.onerror = () => {
      console.error("setWebStore Error", errorMessage, openRequest.error);
      reject(new Error(`setWebStore Error ${errorMessage}`));
    };

    openRequest.onsuccess = () => {
      const db = openRequest.result;
      const tx = db.transaction(DatabaseStore.storeName, "readwrite");
      const store = tx.objectStore(DatabaseStore.storeName);

      const request = store.put(data, storageKey);
      request.onsuccess = () => {
        console.log("data added to the store", storageKey);
        resolve();
      };
      request.onerror = () => {
        console.error("Error", request.error);
        reject(new Error(`setWebStore Error ${errorMessage}`));
      };
    };
  });
}

export async function getAsyncStorage(key: AsyncStorageKey): Promise<string> {
  const data = await AsyncStorage.getItem(key);
  if (data) {
    const validatedVersion = safeParse(string(), data);

    if (validatedVersion.success) {
      return validatedVersion.output;
    }
    throw new Error("Validation failed");
  }
  throw new Error(`No saved AsyncStorage found: ${key}`);
}

export async function setAsyncStorage(key: AsyncStorageKey, data: string): Promise<void> {
  try {
    await AsyncStorage.setItem(key, data);
    console.log("saved", key);
  } catch (error: unknown) {
    console.error("Failed to save", error, key);
    throw new Error(`Failed to save AsyncStorage ${key}`);
  }
}

export async function removeAsyncStorageItem(key: string): Promise<void> {
  try {
    await AsyncStorage.removeItem(key);
    console.log("removed", key);
  } catch (error: unknown) {
    console.error("Failed to remove", error, key);
    throw new Error(`Failed to remove AsyncStorage ${key}`);
  }
}

export async function getAsyncStorageSQL(key: StorageKey): Promise<string> {
  const data = await AsyncStorageSQL.getItem(key);
  if (data) {
    const validatedVersion = safeParse(string(), data);

    if (validatedVersion.success) {
      return validatedVersion.output;
    }
    throw new Error("Validation failed");
  }
  throw new Error(`No saved AsyncStorage found: ${key}`);
}

export async function setAsyncStorageSQL(key: StorageKey, data: string): Promise<void> {
  try {
    await AsyncStorageSQL.setItem(key, data);
    console.log("saved", key);
  } catch (error: unknown) {
    console.error("Failed to save", error, key);
    throw new Error(`Failed to save AsyncStorage ${key}`);
  }
}
