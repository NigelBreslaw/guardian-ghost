import { MMKV } from "react-native-mmkv";
import { Platform } from "react-native";

const Store = {
  factoryName: "gg-data",
  storeName: "key-values",
};

type storageKey = "item_definition" | "accounts";

class StorageGG {
  private static instance: StorageGG;
  private static isReady = false;
  private nativeStore = new MMKV();

  private constructor() {}

  public static getInstance(): StorageGG {
    if (!StorageGG.instance) {
      StorageGG.instance = new StorageGG();
    }
    return StorageGG.instance;
  }

  private init() {}

  setData(data: string, storageKey: storageKey, errorMessage: string): Promise<void> {
    if (Platform.OS === "web") {
      return this.setWebStore(data, storageKey, errorMessage);
    }
    return this.setNativeStore(data, storageKey, errorMessage);
  }

  // getString and getJson

  private setWebStore(data: string, storageKey: storageKey, errorMessage: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const openRequest = indexedDB.open(Store.factoryName, 1);

      openRequest.onupgradeneeded = () => {
        const db = openRequest.result;
        if (!db.objectStoreNames.contains(Store.storeName)) {
          db.createObjectStore(Store.storeName); // create it
        }
      };

      openRequest.onerror = () => {
        console.error("setWebStore Error", errorMessage, openRequest.error);
        reject(errorMessage);
      };

      openRequest.onsuccess = () => {
        const db = openRequest.result;
        // Start a transaction
        const tx = db.transaction(Store.storeName, "readwrite");
        // Get the store
        const store = tx.objectStore(Store.storeName);

        // Add the string to the store
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

  private getWebStore(storageKey: storageKey, errorMessage: string): Promise<string> {
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

  setNativeStore(data: string, storageKey: storageKey, errorMessage: string): void {
    try {
      this.nativeStore.set(storageKey, data);
      console.log("data added to native store", storageKey);
    } catch (e) {
      console.error("setNativeStore Error", errorMessage, e);
    }
  }

  getNativeStore(storageKey: storageKey, errorMessage: string): string {
    try {
      const data = this.nativeStore.getString(storageKey) as string;
      console.log("data retrieved from native store", storageKey);
      return data;
    } catch (e) {
      console.error("getNativeStore Error", errorMessage, e);
    }
  }

  cleanUp() {}
}

export default StorageGG;
