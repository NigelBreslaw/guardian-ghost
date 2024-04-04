import {
  setItemDefinition,
  type ItemsDefinition,
  setBucketTypeHashArray,
  setIconWaterMarks,
  setItemTypeDisplayName,
} from "@/app/store/Definitions.ts";
import type { IStore } from "@/app/store/GGStore.ts";
import { type ItemResponse, ItemResponseSchema, Store } from "@/app/store/Types";
import type { StorageKey } from "@/app/store/Types";
import { getCustomItemDefinition } from "@/app/utilities/Helpers.ts";
import * as SQLite from "expo-sqlite";
import { Platform } from "react-native";
import { parse } from "valibot";
import type { StateCreator } from "zustand";

export interface DefinitionsSlice {
  definitionsReady: boolean;
  snackBarVisible: boolean;
  snackBarMessage: string;
  initDefinitions: () => Promise<void>;
  showSnackBar: (message: string) => void;
  setSnackBarVisible: (snackBarVisible: boolean) => void;
}

export const createDefinitionsSlice: StateCreator<IStore, [], [], DefinitionsSlice> = (set) => ({
  definitionsReady: false,
  snackBarVisible: false,
  snackBarMessage: "",
  initDefinitions: async () => {
    try {
      const loadedDefinition = await getData("ITEM_DEFINITION", "getItemDefinition()");
      const itemDefinition = parse(ItemResponseSchema, loadedDefinition);
      return set(parseAndSet(itemDefinition));
    } catch (e) {
      console.error("No saved itemDefinition. Downloading new version...", e);
    }

    try {
      const downloadedDefinition = await getCustomItemDefinition();
      const itemDefinition = parse(ItemResponseSchema, downloadedDefinition);
      await setData(itemDefinition as unknown as JSON, "ITEM_DEFINITION", "setupItemDefinition()");
      return set(parseAndSet(itemDefinition));
    } catch (e) {
      console.error("Failed to download and save itemDefinition", e);
    }
  },
  setSnackBarVisible: (snackBarVisible: boolean) => set({ snackBarVisible }),
  showSnackBar: (message: string) => set({ snackBarMessage: message, snackBarVisible: true }),
});

function parseAndSet(itemDefinition: ItemResponse) {
  setItemDefinition(itemDefinition.items as ItemsDefinition);
  setBucketTypeHashArray(itemDefinition.helpers.BucketTypeHash);
  setIconWaterMarks(itemDefinition.helpers.IconWaterMark);
  setItemTypeDisplayName(itemDefinition.helpers.ItemTypeDisplayName);
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
    const openRequest = indexedDB.open(Store.factoryName, 1);

    openRequest.onupgradeneeded = () => {
      const db = openRequest.result;
      if (!db.objectStoreNames.contains(Store.storeName)) {
        db.createObjectStore(Store.storeName);
      }
    };

    openRequest.onerror = () => {
      console.error("setWebStore Error", errorMessage, openRequest.error);
      reject(errorMessage);
    };

    openRequest.onsuccess = () => {
      const db = openRequest.result;
      const tx = db.transaction(Store.storeName, "readwrite");
      const store = tx.objectStore(Store.storeName);

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
    const nativeStore = SQLite.openDatabase(Store.databaseName);
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
    const openRequest = indexedDB.open(Store.factoryName, 1);

    openRequest.onupgradeneeded = () => {
      const db = openRequest.result;
      if (!db.objectStoreNames.contains(Store.storeName)) {
        db.createObjectStore(Store.storeName);
      }
    };

    openRequest.onerror = () => {
      console.error("setWebStore Error", errorMessage, openRequest.error);
      reject(errorMessage);
    };

    openRequest.onsuccess = () => {
      const db = openRequest.result;
      const tx = db.transaction(Store.storeName, "readwrite");
      const store = tx.objectStore(Store.storeName);

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
  const nativeStore = SQLite.openDatabase(Store.databaseName);
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
