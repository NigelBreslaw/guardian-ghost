import type { DefinitionKey } from "@/app/core/BungieDefinitions.ts";

export type AsyncStorageKey =
  | DefinitionKey
  | "CACHED_PROFILE"
  | "ITEM_DEFINITION"
  | "ACCOUNTS"
  | "REFRESH_TOKEN"
  | "BUNGIE_USER";

export enum WeaponsSort {
  Power = "POWER",
  Type = "TYPE",
  TypeAndPower = "TYPE_AND_POWER",
}

export enum ArmorSort {
  Power = "POWER",
  Type = "TYPE",
}

export const DatabaseStore = {
  factoryName: "gg-data",
  storeName: "key-values",
  databaseName: "ggDataBase.db",
};
