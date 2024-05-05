import type { DefinitionKey } from "@/app/core/BungieDefinitions.ts";

type StoreKeys = "ITEM_DEFINITION" | "ACCOUNTS";
export type StorageKey = DefinitionKey | StoreKeys;

export const DatabaseStore = {
  factoryName: "gg-data",
  storeName: "key-values",
  databaseName: "ggDataBase.db",
};
