import {
  object,
  optional,
  record,
  string,
  number,
  array,
  type InferOutput,
  boolean,
  unknown,
  value,
  looseObject,
  pipe,
} from "valibot";

// Bungie definition list
export type DefinitionKey =
  | "DestinySocketCategoryDefinition"
  | "DestinyStatGroupDefinition"
  | "DestinyStatDefinition"
  | "DestinyInventoryBucketDefinition";

// -------------------------------
// Mini socket schemas (used by helpers)
// -------------------------------

export const MiniSocketCategorySchema = array(array(object({ h: number(), i: number() })));
export type MiniSocketCategoryItems = InferOutput<typeof MiniSocketCategorySchema>;

const MiniSocketEntrySchema = array(
  array(
    object({
      p: optional(number()),
      r: optional(number()),
      s: optional(number()),
      st: optional(number()),
      ra: optional(number()),
    }),
  ),
);
export type MiniSocketEntryItems = InferOutput<typeof MiniSocketEntrySchema>;

// -------------------------------
// The self hosted minified JSON response definition
// -------------------------------

const MINI_ITEM_DEFINITION_VERSION = 9;

export const ItemResponseSchema = object({
  helpers: looseObject({
    BucketTypeHash: array(number()),
    DamageTypeHashes: array(number()),
    Descriptions: array(string()),
    DisplaySources: array(string()),
    ExpirationTooltip: array(string()),
    ExpiredInActivityMessage: array(string()),
    IconWaterMark: array(string()),
    IconWaterMarkFeatured: array(string()),
    InsertionMaterialRequirementHash: array(number()),
    ItemTypeDisplayName: array(string()),
    ItemValue: array(number()),
    PlugCategoryHash: array(number()),
    PlugCategoryIdentifier: array(string()),
    RandomizedPlugSetHash: array(number()),
    ReusablePlugSetHash: array(number()),
    SingleInitialItemHash: array(number()),
    SocketCategories: MiniSocketCategorySchema,
    SocketCategoryHash: array(number()),
    SocketEntries: MiniSocketEntrySchema,
    SocketIndexes: array(array(number())),
    SocketTypeHash: array(number()),
    StackUniqueLabel: array(string()),
    StatGroupHash: array(number()),
    StatHash: array(number()),
    TalentGridHash: array(number()),
    TooltipNotifications: array(string()),
    TraitIds: array(string()),
    UiItemDisplayStyle: array(string()),
    UiPlugLabel: array(string()),
    Icons: array(string()),
    Versions: array(number()),
  }),

  items: record(string(), unknown()),
  version: pipe(number(), value(MINI_ITEM_DEFINITION_VERSION)),
  id: string(),
});

export type ItemResponse = InferOutput<typeof ItemResponseSchema>;

// -------------------------------
// All the minified item definitions
// -------------------------------

export const miniItemSchema = object({
  a: optional(number()),
  at: optional(number()),
  b: optional(number()),
  bt: optional(number()),
  c: optional(number()),
  d: optional(number()),
  ds: optional(number()),
  dt: optional(array(number())),
  dvwi: optional(array(number())),
  e: optional(number()),
  em: optional(number()),
  et: optional(number()),
  f: optional(string()),
  fi: optional(number()),
  i: optional(number()),
  if: optional(array(array(number()))),
  is: optional(number()),
  ids: optional(number()),
  it: optional(number()),
  itd: optional(number()),
  iv: optional(record(string(), number())),
  iw: optional(number()),
  iwf: optional(number()),
  m: optional(number()),
  n: optional(string()),
  nt: optional(number()),
  p: optional(object({ p: optional(number()), pl: optional(number()), im: optional(number()) })),
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

export type MiniSingleItemDefinition = InferOutput<typeof miniItemSchema>;

// -------------------------------
// DestinyStatGroupDefinition Stat Group
// -------------------------------
export const StatGroupSchema = record(
  string(),
  object({
    maximumValue: number(),
    uiPosition: number(),
    scaledStats: array(
      object({
        statHash: number(),
        maximumValue: number(),
        displayAsNumeric: boolean(),
        displayInterpolation: array(
          object({
            value: number(),
            weight: number(),
          }),
        ),
      }),
    ),
    overrides: unknown(),
    hash: number(),
    index: number(),
    redacted: boolean(),
    blacklisted: boolean(),
  }),
);

export const MiniStatGroupSchema = record(
  string(),
  object({
    scaledStats: array(
      object({
        statHash: number(),
        maximumValue: number(),
        displayInterpolation: array(
          object({
            value: number(),
            weight: number(),
          }),
        ),
      }),
    ),
    redacted: boolean(),
  }),
);

export type StatGroupDefinition = InferOutput<typeof MiniStatGroupSchema>;

// -------------------------------
// DestinyStatDefinition
// -------------------------------
export const MiniStatSchema = record(
  string(),
  object({
    displayProperties: object({
      description: string(),
      name: string(),
    }),
  }),
);

export type StatDefinition = InferOutput<typeof MiniStatSchema>;

// -------------------------------
// DestinySocketCategoryDefinition Socket Category
// -------------------------------

const SocketCategorySchema = record(
  string(),
  object({
    blacklisted: boolean(),
    categoryStyle: number(),
    displayProperties: object({
      description: string(),
      hasIcon: boolean(),
      name: string(),
    }),
    hash: number(),
    index: number(),
    redacted: boolean(),
    uiCategoryStyle: number(),
  }),
);
export type SocketCategoryDefinition = InferOutput<typeof SocketCategorySchema>;

// -------------------------------
// DestinyInventoryBucketDefinition
// -------------------------------

export const InventoryBucketSchema = record(
  string(),
  object({
    displayProperties: optional(
      object({
        // description: optional(string()), // No need for the description currently
        name: optional(string()),
      }),
    ),
    itemCount: optional(number()),
  }),
);
export type InventoryBucketDefinition = InferOutput<typeof InventoryBucketSchema>;
