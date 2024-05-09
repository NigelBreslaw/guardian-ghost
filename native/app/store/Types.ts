import type { DefinitionKey } from "@/app/core/BungieDefinitions.ts";

export type StorageKey = "ITEM_DEFINITION" | "ACCOUNTS";
export type AsyncStorageKey = DefinitionKey;

export const DatabaseStore = {
  factoryName: "gg-data",
  storeName: "key-values",
  databaseName: "ggDataBase.db",
};

export const Store = {
  _refresh_token: "_refresh_token",
  _bungie_user: "_bungie_user",
  _item_definition: "_item_definition",
  _bungie_definitions: "_bungie_definitions",
};
