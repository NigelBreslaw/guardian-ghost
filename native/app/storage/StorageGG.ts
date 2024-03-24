import * as SQLite from "expo-sqlite";
import { Platform } from "react-native";

const Store = {
  factoryName: "gg-data",
  storeName: "key-values",
  databaseName: "ggDataBase.db",
};

type storageKey = "ITEM_DEFINITION" | "ACCOUNTS";

class StorageGG {
  private static instance: StorageGG;

  private nativeStore: SQLite.SQLiteDatabase | null = null;

  private constructor() {
    if (Platform.OS !== "web") {
      this.nativeStore = SQLite.openDatabase(Store.databaseName);
      this.nativeStore.transaction((tx) => {
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
    }
  }

  public static getInstance(): StorageGG {
    if (!StorageGG.instance) {
      StorageGG.instance = new StorageGG();
    }
    return StorageGG.instance;
  }

  static setData(data: JSON, storageKey: storageKey, errorMessage: string): Promise<void> {
    return new Promise((resolve, _reject) => {
      if (Platform.OS === "web") {
        return resolve(StorageGG.setWebStore(data, storageKey, errorMessage));
      }
      resolve(StorageGG.setNativeStore(data, storageKey, errorMessage));
    });
  }

  static getData(storageKey: storageKey, errorMessage: string): Promise<JSON> {
    return new Promise((resolve, _reject) => {
      if (Platform.OS === "web") {
        return resolve(StorageGG.getWebStore(storageKey, errorMessage));
      }
      resolve(StorageGG.getNativeStore(storageKey, errorMessage));
    });
  }

  private static setWebStore(data: JSON, storageKey: storageKey, errorMessage: string): Promise<void> {
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

  private static getWebStore(storageKey: storageKey, errorMessage: string): Promise<JSON> {
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

  private static async setNativeStore(json: object, key: string, errorMessage: string) {
    const jsonString = JSON.stringify(json);
    const nativeStore = StorageGG.getInstance().nativeStore;

    if (nativeStore) {
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
  }

  private static async getNativeStore(key: string, errorMessage: string): Promise<JSON> {
    return new Promise((resolve, reject) => {
      const nativeStore = StorageGG.getInstance().nativeStore;

      if (nativeStore) {
        nativeStore.transaction((tx) => {
          tx.executeSql(
            "SELECT value FROM json_table WHERE key = ?;",
            [key],
            (_, resultSet) => {
              if (resultSet.rows.length > 0) {
                const json = JSON.parse(resultSet.rows.item(0).value);
                return resolve(json);
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
}

export default StorageGG;
