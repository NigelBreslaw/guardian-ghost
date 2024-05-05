import { object, optional, record, string, number, array, type Output, boolean, unknown } from "valibot";

// -------------------------------
// All the minified item definitions
// -------------------------------

export const miniItemSchema = object({
  a: optional(number()),
  at: optional(number()),
  b: optional(number()),
  bt: optional(number()),
  c: optional(number()),
  p: optional(object({ p: optional(number()), pl: optional(number()), im: optional(number()) })),
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

export type MiniSingleItemDefinition = Output<typeof miniItemSchema>;

export const MiniSocketCategorySchema = array(array(object({ h: number(), i: number() })));
export type MiniSocketCategoryItems = Output<typeof MiniSocketCategorySchema>;

const MiniSocketEntrySchema = array(
  array(
    object({
      p: optional(number()),
      r: optional(number()),
      s: optional(number()),
      st: optional(number()),
    }),
  ),
);
export type MiniSocketEntryItems = Output<typeof MiniSocketEntrySchema>;

// -------------------------------
// DestinyStatGroupDefinition Stat Group
// -------------------------------
const StatGroupSchema = record(
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
    // TODO: Fill in whatever this unknown is?
    overrides: unknown(),
    hash: number(),
    index: number(),
    redacted: boolean(),
    blacklisted: boolean(),
  }),
);

export type StatGroupDefinition = Output<typeof StatGroupSchema>;

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
export type SocketCategoryDefinition = Output<typeof SocketCategorySchema>;