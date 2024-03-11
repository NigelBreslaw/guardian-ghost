import { array, number, object, optional, record, string, unknown } from "valibot";
import type { Output } from "valibot";

const itemSchema = object({
  a: optional(number()),
  at: optional(number()),
  b: optional(number()),
  bt: optional(number()),
  c: optional(number()),
  ds: optional(number()),
  dt: optional(array(number())),
  dvwi: optional(array(number())),
  e: optional(number()),
  em: optional(number()),
  et: optional(number()),
  i: optional(string()),
  is: optional(number()),
  ids: optional(number()),
  it: optional(number()),
  itd: optional(number()),
  iv: optional(record(string(), number())),
  iw: optional(number()),
  m: optional(number()),
  n: optional(string()),
  nt: optional(number()),
  pm: optional(number()),
  pv: optional(number()),
  qv: optional(array(number())),
  r: optional(number()),
  s: optional(string()),
  sd: optional(
    object({
      qN: optional(string()),
    }),
  ),
  si: optional(string()),
  so: optional(string()),
  su: optional(number()),
  ss: optional(string()),
  sk: optional(
    object({
      sc: optional(number()),
      se: optional(number()),
    }),
  ),
  st: optional(
    object({
      s: optional(record(string(), number())),
      sgs: optional(number()),
    }),
  ),
  t: optional(number()),
  tI: optional(array(number())),
  th: optional(number()),
  ttn: optional(array(number())),
});

export type SingleItemDefinition = Output<typeof itemSchema>;

export const ItemDefinitionSchema = object({
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
});

export type ItemDefinition = Output<typeof ItemDefinitionSchema>;
