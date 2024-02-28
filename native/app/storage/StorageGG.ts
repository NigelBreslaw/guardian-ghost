import { Platform } from "react-native";
import { MMKV } from "react-native-mmkv";

const Store = {
  factoryName: "gg-data",
  storeName: "key-values",
};

type storageKey = "item_definition" | "accounts";

class StorageGG {
  private static instance: StorageGG;

  private nativeStore: MMKV | null = null;

  private constructor() {
    if (Platform.OS !== "web") {
      this.nativeStore = new MMKV();
    }
  }

  public static getInstance(): StorageGG {
    if (!StorageGG.instance) {
      StorageGG.instance = new StorageGG();
    }
    return StorageGG.instance;
  }

  static setData(data: JSON, storageKey: storageKey, errorMessage: string): Promise<void> {
    return new Promise((resolve, reject) => {
      if (Platform.OS === "web") {
        return resolve(StorageGG.setWebStore(data, storageKey, errorMessage));
      }
      resolve(StorageGG.setNativeStore(data, storageKey, errorMessage));
    });
  }

  static getData(storageKey: storageKey, errorMessage: string): Promise<JSON> {
    return new Promise((resolve, reject) => {
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
          db.createObjectStore(Store.storeName); // create it
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

  private static setNativeStore(data: JSON, storageKey: storageKey, errorMessage: string): void {
    try {
      const nativeStore = StorageGG.getInstance().nativeStore;
      if (nativeStore) {
        nativeStore.set(storageKey, JSON.stringify(data));
        console.log("data added to native store", storageKey);
      }
    } catch (e) {
      console.error("setNativeStore Error", errorMessage, e);
    }
  }

  private static getNativeStore(storageKey: storageKey, errorMessage: string): JSON {
    try {
      const nativeStore = StorageGG.getInstance().nativeStore;
      if (nativeStore) {
        const data = nativeStore.getString(storageKey) as string;
        console.log("data retrieved from native store", storageKey);
        return JSON.parse(data);
      }
      throw new Error(errorMessage);
    } catch (e) {
      console.error("getNativeStore Error", errorMessage, e);
      throw new Error(String(e));
    }
  }

  static cleanUp() {}
}

export default StorageGG;
