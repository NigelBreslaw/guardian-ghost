import { array, number, object, record, string, unknown, value } from "valibot";
import type { Output } from "valibot";

export type DefinitionKey = "DestinySocketCategoryDefinition" | "DestinyStatGroupDefinition";
type StoreKeys = "ITEM_DEFINITION" | "ACCOUNTS";
export type StorageKey = DefinitionKey | StoreKeys;

export const DatabaseStore = {
  factoryName: "gg-data",
  storeName: "key-values",
  databaseName: "ggDataBase.db",
};

const MINI_ITEM_DEFINITION_VERSION = 3;

export const ItemResponseSchema = object({
  helpers: object(
    {
      BucketTypeHash: array(number()),
      DamageTypeHashes: array(number()),
      Descriptions: array(string()),
      DisplaySources: array(string()),
      ExpirationTooltip: array(string()),
      ExpiredInActivityMessage: array(string()),
      IconWaterMark: array(string()),
      InsertionMaterialRequirementHash: array(number()),
      ItemTypeDisplayName: array(string()),
      ItemValue: array(number()),
      PlugCategoryHash: array(number()),
      PlugCategoryIdentifier: array(string()),
      ReusablePlugSetHash: array(number()),
      SingleInitialItemHash: array(number()),
      SocketCategories: unknown(),
      SocketCategoryHash: array(number()),
      SocketEntries: unknown(),
      SocketIndexes: unknown(),
      SocketTypeHash: array(number()),
      StackUniqueLabel: array(string()),
      StatGroupHash: array(number()),
      StatHash: array(string()),
      TalentGridHash: array(number()),
      TooltipNotifications: array(string()),
      TraitIds: array(string()),
      UiItemDisplayStyle: array(string()),
      UiPlugLabel: array(string()),
      Versions: array(number()),
    },
    unknown(),
  ),

  items: record(string(), unknown()),
  version: number([value(MINI_ITEM_DEFINITION_VERSION)]),
  id: string(),
});

export type ItemResponse = Output<typeof ItemResponseSchema>;
