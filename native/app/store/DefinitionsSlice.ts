import AsyncStorage from "@react-native-async-storage/async-storage";
import * as SQLite from "expo-sqlite/legacy";
import { Platform } from "react-native";
import { parse, safeParse, string } from "valibot";
import type { StateCreator } from "zustand";
import Toast from "react-native-toast-message";
import * as SplashScreen from "expo-splash-screen";
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
import { DatabaseStore, Store, type AsyncStorageKey, type StorageKey } from "@/app/store/Types.ts";
import { getCustomItemDefinition } from "@/app/utilities/Helpers.ts";
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
  definitionsReady: boolean;
  snackBarVisible: boolean;
  snackBarMessage: string;
  inventorySectionWidth: number;
  itemDefinitionVersion: string;
  bungieDefinitionVersions: string;
  initDefinitions: () => Promise<void>;
  loadCustomDefinitions: (uniqueKey: string | null) => Promise<void>;
  loadBungieDefinitions: (bungieManifest: BungieManifest | null) => Promise<void>;
  showSnackBar: (message: string) => void;
  setInventorySectionWidth: (inventorySectionWidth: number) => void;
  clearCache: () => void;
}

export const createDefinitionsSlice: StateCreator<IStore, [], [], DefinitionsSlice> = (set, get) => ({
  definitionsReady: false,
  snackBarVisible: false,
  snackBarMessage: "",
  inventorySectionWidth: 0,
  itemDefinitionVersion: "",
  bungieDefinitionVersions: "",
  initDefinitions: async () => {
    try {
      const loadedDefinitionVersion = await loadItemDefinitionVersion();
      set({ itemDefinitionVersion: loadedDefinitionVersion });
    } catch (e) {
      console.log("No saved itemDefinition version", e);
    }

    try {
      const bungieDefinitionVersion = await loadBungieDefinitionsVersion();
      set({ bungieDefinitionVersions: bungieDefinitionVersion });
    } catch (e) {
      console.log("No saved bungieDefinition version", e);
    } finally {
      SplashScreen.hideAsync();
    }
  },
  loadCustomDefinitions: async (uniqueKey) => {
    const storedVersion = get().itemDefinitionVersion;
    if (storedVersion === "") {
      // download a version
      console.log("download a version");
      await downloadAndStoreItemDefinition(set);
    } else if (uniqueKey === null) {
      // try to use the already downloaded version
      await loadLocalItemDefinitionVersion(set);
    } else if (uniqueKey === storedVersion) {
      // use the already downloaded version
      await loadLocalItemDefinitionVersion(set);
    } else {
      // download a new version
      console.log("download a new version as KEY is different");
      await downloadAndStoreItemDefinition(set);
    }
  },
  loadBungieDefinitions: async (bungieManifest) => {
    if (bungieManifest === null) {
      Toast.show({
        type: "error",
        text1: "Restart the app. Failed to load bungie manifest",
      });
    }
    const storedVersion = get().bungieDefinitionVersions;
    const versionKey = bungieManifest?.Response.version;

    try {
      if (storedVersion === "") {
        // download a version
        await downloadAndStoreBungieDefinitions(bungieManifest);
      } else if (versionKey === null) {
        // try to use the already downloaded version
        await loadLocalBungieDefinitions();
      } else if (versionKey === storedVersion) {
        // use the already downloaded version
        await loadLocalBungieDefinitions();
      } else {
        // download a new version
        console.log("download a new bungie definitions as KEY is different");
        await downloadAndStoreBungieDefinitions(bungieManifest);
      }
    } catch (e) {
      console.error("Failed to load bungieDefinition version. Downloading new version...", e);
    }
  },
  showSnackBar: (message) => {
    Toast.show({
      type: "success",
      text1: message,
    });
  },
  setInventorySectionWidth: (inventorySectionWidth) => set({ inventorySectionWidth }),
  clearCache: () => {
    saveItemDefinitionVersion("");
    saveBungieDefinitionsVersion("");
    set({ definitionsReady: false });
  },
});

async function loadLocalItemDefinitionVersion(set: DefinitionsSliceSetter): Promise<void> {
  try {
    const loadedDefinition = await getData("ITEM_DEFINITION", "getItemDefinition()");
    const itemDefinition = parse(ItemResponseSchema, loadedDefinition);
    set(parseAndSet(itemDefinition));
  } catch (e) {
    console.error("Failed to load itemDefinition version. Downloading new version...", e);
    await downloadAndStoreItemDefinition(set);
  }
}

async function downloadAndStoreItemDefinition(set: DefinitionsSliceSetter): Promise<void> {
  try {
    const downloadedDefinition = await getCustomItemDefinition();
    const itemDefinition = parse(ItemResponseSchema, downloadedDefinition);
    const versionKey = itemDefinition.id;
    console.log("versionKey", versionKey);
    await saveItemDefinitionVersion(versionKey);
    await setData(itemDefinition as unknown as JSON, "ITEM_DEFINITION", "setupItemDefinition()");
    return set(parseAndSet(itemDefinition));
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

async function downloadAndStoreBungieDefinitions(bungieManifest: BungieManifest | null): Promise<void> {
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
        const downloadedDefinition = getBungieDefinition(url);
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

    await saveBungieDefinitionsVersion(versionKey);
  } catch (e) {
    console.error("Failed to download and save bungieDefinition", e);
    if (failCount < 3) {
      failCount++;
      console.error("Failed to download and save bungieDefinition", e);
      await downloadAndStoreBungieDefinitions(bungieManifest);
    } else {
      // show error toast
      console.error("Failed to download and save bungieDefinition", e);
      throw new Error("Failed to download and save bungieDefinition");
    }
  }
}

async function loadLocalBungieDefinitions(): Promise<void> {
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
  } catch (e) {
    console.error("Failed to load bungieDefinition version", e);
    saveBungieDefinitionsVersion("");
    // TODO: Should error. Show something to the user that lets them restart the app. In the sense of running init again.
  }
}

function parseAndSet(itemDefinition: ItemResponse) {
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

  return { definitionsReady: true };
}

function getData(storageKey: StorageKey, errorMessage: string): Promise<JSON> {
  return new Promise((resolve, _reject) => {
    if (Platform.OS === "web") {
      return resolve(getWebStore(storageKey, errorMessage));
    }
    resolve(getNativeStore(storageKey, errorMessage));
  });
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

function getNativeStore(key: string, errorMessage: string): Promise<JSON> {
  return new Promise((resolve, reject) => {
    const nativeStore = SQLite.openDatabase(DatabaseStore.databaseName);
    nativeStore.transaction((tx) => {
      tx.executeSql(
        "CREATE TABLE IF NOT EXISTS json_table (key TEXT UNIQUE, value TEXT);",
        [],
        () => {
          // console.log("Table created successfully")
        },
        (_, error) => {
          console.log("Error occurred while creating the table");
          console.log(error);
          return false;
        },
      );
    });
    if (nativeStore) {
      nativeStore.transaction((tx) => {
        tx.executeSql(
          "SELECT value FROM json_table WHERE key = ?;",
          [key],
          (_, resultSet) => {
            if (resultSet.rows.length > 0) {
              const json = JSON.parse(resultSet.rows.item(0).value);
              return resolve(json as JSON);
            }
            console.log("No JSON found for the provided key", key, errorMessage);
            reject(new Error(errorMessage));
          },
          (_, error) => {
            console.log("Error occurred while getting JSON", errorMessage);
            console.log(error);
            throw new Error(errorMessage);
          },
        );
      });
    }
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
      await setNativeStore(data, storageKey, errorMessage);
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

async function setNativeStore(json: object, key: string, errorMessage: string) {
  const nativeStore = SQLite.openDatabase(DatabaseStore.databaseName);
  nativeStore.transaction((tx) => {
    tx.executeSql(
      "CREATE TABLE IF NOT EXISTS json_table (key TEXT UNIQUE, value TEXT);",
      [],
      () => {
        // console.log("Table created successfully")
      },
      (_, error) => {
        console.log("Error occurred while creating the table");
        console.log(error);
        return true;
      },
    );
  });

  const jsonString = JSON.stringify(json, null, 0);

  nativeStore.transaction((tx) => {
    tx.executeSql(
      "INSERT OR REPLACE INTO json_table (key, value) VALUES (?, ?);",
      [key, jsonString],
      (_) => console.log("JSON set successfully", key),
      (_, error) => {
        console.log("Error occurred while setting JSON", errorMessage);
        console.log(error);
        return true;
      },
    );
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

export async function loadItemDefinitionVersion(): Promise<string> {
  const version = await AsyncStorage.getItem(Store._item_definition);
  if (version) {
    const validatedVersion = safeParse(string(), version);

    if (validatedVersion.success) {
      return validatedVersion.output;
    }
    throw new Error("Validation failed");
  }
  throw new Error("No saved itemDefinition version found");
}

export async function saveItemDefinitionVersion(version: string): Promise<void> {
  try {
    await AsyncStorage.setItem(Store._item_definition, version);
    console.log("saved", version);
  } catch (error: unknown) {
    console.error("Failed to save itemDefinition version", error);
    throw new Error("Failed to save itemDefinition version");
  }
}

export async function loadBungieDefinitionsVersion(): Promise<string> {
  const version = await AsyncStorage.getItem(Store._bungie_definitions);
  if (version) {
    const validatedVersion = safeParse(string(), version);

    if (validatedVersion.success) {
      return validatedVersion.output;
    }
    throw new Error("Validation failed");
  }
  throw new Error("No saved bungieDefinitions version found");
}

export async function saveBungieDefinitionsVersion(version: string): Promise<void> {
  try {
    await AsyncStorage.setItem(Store._bungie_definitions, version);
    console.log("saved bungie", version);
  } catch (error: unknown) {
    console.error("Failed to save itemDefinition version", error);
    throw new Error("Failed to save itemDefinition version");
  }
}

async function getBungieDefinition(definitionUrl: string): Promise<JSON> {
  const requestOptions: RequestInit = {
    method: "GET",
  };

  return new Promise((resolve, reject) => {
    fetch(definitionUrl, requestOptions)
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
        console.error("getBungieDefinition", definitionUrl, error);
        reject(new Error(`getBungieDefinition Error ${error}`));
      });
  });
}
