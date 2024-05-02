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
} from "@/app/store/Definitions.ts";
import * as SplashScreen from "expo-splash-screen";
import type { IStore } from "@/app/store/GGStore.ts";
import { type ItemResponse, ItemResponseSchema, DatabaseStore } from "@/app/store/Types";
import type { SocketCategoryDefinition, StorageKey } from "@/app/store/Types";
import { getCustomItemDefinition } from "@/app/utilities/Helpers.ts";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as SQLite from "expo-sqlite/legacy";
import { Platform } from "react-native";
import { parse, safeParse, string } from "valibot";
import { Store } from "@/constants/storage.ts";
import type { StateCreator } from "zustand";
import Toast from "react-native-toast-message";
import type { BungieManifest } from "@/app/bungie/Types.ts";
import { bungieUrl } from "@/app/bungie/Common.ts";

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
    }
  },
  loadCustomDefinitions: async (uniqueKey) => {
    const storedVersion = get().itemDefinitionVersion;
    if (storedVersion === "") {
      // download a version
      console.log("download a version");
      downloadAndStoreItemDefinition(set);
    } else if (uniqueKey === null) {
      // try to use the already downloaded version
      console.log("NULL use the already downloaded version");
      loadLocalItemDefinitionVersion(set);
    } else if (uniqueKey === storedVersion) {
      // use the already downloaded version
      console.log("use the already downloaded version");
      loadLocalItemDefinitionVersion(set);
    } else {
      // download a new version
      console.log("download a new version as KEY is different");
      downloadAndStoreItemDefinition(set);
    }
    SplashScreen.hideAsync();
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
    if (storedVersion === "") {
      // download a version

      downloadAndStoreBungieDefinitions(bungieManifest);
    } else if (versionKey === null) {
      // try to use the already downloaded version
      console.log("NULL use the already downloaded version");
      loadLocalBungieDefinitions();
    } else if (versionKey === storedVersion) {
      // use the already downloaded version
      console.log("use the already downloaded version");
      loadLocalBungieDefinitions();
    } else {
      // download a new version
      console.log("download a new bungie definitions as KEY is different");
      downloadAndStoreBungieDefinitions(bungieManifest);
    }
  },
  showSnackBar: (message) => {
    Toast.show({
      type: "success",
      text1: message,
    });
  },
  setInventorySectionWidth: (inventorySectionWidth) => set({ inventorySectionWidth }),
});

async function loadLocalItemDefinitionVersion(set: DefinitionsSliceSetter): Promise<void> {
  try {
    const loadedDefinition = await getData("ITEM_DEFINITION", "getItemDefinition()");
    const itemDefinition = parse(ItemResponseSchema, loadedDefinition);
    set(parseAndSet(itemDefinition));
  } catch (e) {
    console.error("Failed to load itemDefinition version. Downloading new version...", e);
    downloadAndStoreItemDefinition(set);
  }
}

async function downloadAndStoreItemDefinition(set: DefinitionsSliceSetter): Promise<void> {
  try {
    const downloadedDefinition = await getCustomItemDefinition();
    const itemDefinition = parse(ItemResponseSchema, downloadedDefinition);
    const versionKey = itemDefinition.id;
    await saveItemDefinitionVersion(versionKey);
    await setData(itemDefinition as unknown as JSON, "ITEM_DEFINITION", "setupItemDefinition()");
    return set(parseAndSet(itemDefinition));
  } catch (e) {
    // TODO: Show big error message
    console.error("Failed to download and save itemDefinition", e);
  }
}

async function downloadAndStoreBungieDefinitions(bungieManifest: BungieManifest | null): Promise<void> {
  const versionKey = bungieManifest?.Response.version;
  if (!versionKey) {
    console.error("No version key found in bungieManifest");
    return;
  }
  try {
    const path = bungieManifest?.Response.jsonWorldComponentContentPaths.en?.DestinySocketCategoryDefinition;
    const url = `${bungieUrl}${path}`;
    const downloadedDefinition = await getBungieDefinition(url);
    await setData(downloadedDefinition, "DestinySocketCategoryDefinition", "downloadAndStoreBungieDefinitions()");
    await saveBungieDefinitionsVersion(versionKey);
    setDestinySocketCategoryDefinition(downloadedDefinition as unknown as SocketCategoryDefinition);
  } catch (e) {
    console.error("Failed to download and save bungieDefinition", e);
  }
}

async function loadLocalBungieDefinitions(): Promise<void> {
  try {
    const loadedDefinition = await getData("DestinySocketCategoryDefinition", "loadLocalBungieDefinitions()");
    // const socketDefinition = parse(ItemResponseSchema, loadedDefinition);
    setDestinySocketCategoryDefinition(loadedDefinition as unknown as SocketCategoryDefinition);
  } catch (e) {
    console.error("Failed to load bungieDefinition version", e);
    saveBungieDefinitionsVersion("");
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
  setSingleInitialItemHash(itemDefinition.helpers.SingleInitialItemHash);
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
      reject(errorMessage);
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
          return true;
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
            console.log("No JSON found for the provided key", errorMessage);
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

function setData(data: JSON, storageKey: StorageKey, errorMessage: string): Promise<void> {
  return new Promise((resolve, _reject) => {
    if (Platform.OS === "web") {
      return resolve(setWebStore(data, storageKey, errorMessage));
    }
    resolve(setNativeStore(data, storageKey, errorMessage));
  });
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
      reject(errorMessage);
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
        reject(errorMessage);
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

  const jsonString = JSON.stringify(json);

  nativeStore.transaction((tx) => {
    tx.executeSql(
      "INSERT OR REPLACE INTO json_table (key, value) VALUES (?, ?);",
      [key, jsonString],
      (_) => console.log("JSON set successfully"),
      (_, error) => {
        console.log("Error occurred while setting JSON", errorMessage);
        console.log(error);
        return true;
      },
    );
  });
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
        reject(error);
      });
  });
}
