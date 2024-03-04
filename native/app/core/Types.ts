import { array, number, object, unknown, string } from "valibot";
import type { Output } from "valibot";

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
  items: unknown(),
});

// SocketCategories: (226) ['[{"h":0,"i":0},{"h":1,"i":1},{"h":2,"i":2},{"h":3,"i":3}]', '[{"h":1,"i":4},{"h":3,"i":5}]', '[{"h":4,"i":6},{"h":5,"i":2},{"h":6,"i":7},{"h":7,"i":8}]', '[{"h":4,"i":6},{"h":7,"i":9},{"h":5,"i":2},{"h":6,"i":10}]', '[{"h":4,"i":6},{"h":7,"i":11},{"h":6,"i":12},{"h":5,"i":13}]', '[{"h":0,"i":14},{"h":1,"i":15},{"h":2,"i":2},{"h":3,"i":3}]', '[{"h":4,"i":6},{"h":7,"i":16}]', '[{"h":0,"i":17},{"h":1,"i":15},{"h":2,"i":2},{"h":3,"i":3}]', '[{"h":4,"i":6},{"h":7,"i":18},{"h":5,"i":2},{"h":6,"i":10}]', '[{"h":0,"i":14},{"h":1,"i":19},{"h":2,"i":2}]', …]
// SocketEntries: (4057) ['[{"p":13,"st":0,"r":0,"s":0},{"p":13,"st":1,"r":1,"s":1},{"p":1},{"p":1},{"p":7,"st":2,"r":2,"s":2},{"p":2,"st":3,"r":3,"s":3},{"p":1,"st":4,"s":4},{"p":1,"st":4,"s":5},{"p":1,"st":4,"s":6},{"p":1,"st":4,"s":7}]', '[{"p":1},{"p":1},{"p":1},{"p":1},{"p":1},{"p":1},{"p":1},{"p":1},{"p":1},{"p":1},{"p":7,"st":5,"r":4,"s":8},{"p":6,"st":6,"r":5,"s":9}]', '[{"p":6,"st":7,"r":6,"s":10},{"p":1},{"p":1},{"p":1},{"p":1},{"p":7,"st":8,"r":2,"s":11},{"p":7,"st":9,"r":7,"s":12},{"p":3,"st":10,"r":8},{"p":1},{"p":6,"st":11,"r":9,"s":13},{"p":1},{"p":1},{"p":1,"st":12,"s":14}]', '[{"p":6,"st":7,"r":10,"s":15},{"p":2,"st":13,"s":16},{"p":2,"st":14,"s":17},{"p":2,"st":15,"s":18},{"p":2,"st":16,"s":19},{"p":7,"st":8,"r":2,"s":11},{"p":7,"st":17,"r":11,"s":12},{"p":3,"st":10,"r":8,"s":20},{"p":6,"st":18,"r":12,"s":21},{"p":6,"st":11,"r":9,"s":13}]', '[{"p":6,"st":7,"r":13,"s":22},{"p":2,"st":13,"s":23},{"p":2,"st":19,"s":24},{"p":2,"st":15,"s":25},{"p":2,"st":16,"s":26},{"p":7,"st":8,"r":2,"s":11},{"p":7,"st":20,"r":14,"s":12},{"p":3,"st":10,"r":8,"s":20},{"p":6,"st":18,"r":15,"s":27},{"p":6,"st":11,"r":9,"s":13}]', '[{"p":6,"st":7,"r":16,"s":28},{"p":6,"st":21,"r":17,"s":29},{"p":6,"st":19,"r":18,"s":30},{"p":6,"st":15,"r":19,"s":31},{"p":1,"st":22,"s":32},{"p":1},{"p":7,"st":8,"r":2,"s":11},{"p":5,"st":23,"r":20,"s":33}]', '[{"p":13,"st":0,"r":0,"s":0},{"p":13,"st":24,"r":21,"s":34},{"p":13,"st":24,"r":21,"s":34},{"p":13,"st":24,"r":21,"s":34},{"p":7,"st":2,"r":2,"s":35},{"p":2,"st":3,"r":3,"s":36},{"st":25,"s":4},{"st":26,"s":4},{"st":27,"s":6},{"st":28,"s":6},{"p":15,"st":29,"r":22,"s":8}]', '[{"p":6,"st":7,"r":23,"s":37},{"p":1},{"p":1},{"p":2,"st":15,"s":38},{"p":1},{"p":1},{"p":1},{"p":1},{"p":2,"st":30,"s":39}]', '[{"p":13,"st":0,"r":0,"s":0},{"p":13,"st":24,"r":21,"s":34},{"p":13,"st":24,"r":21,"s":34},{"p":13,"st":24,"r":21,"s":34},{"p":7,"st":2,"r":2,"s":40},{"p":2,"st":3,"r":3,"s":36},{"st":25,"s":4},{"st":26,"s":4},{"st":27,"s":6},{"st":28,"s":6},{"p":15,"st":29,"r":22,"s":8},{"p":5,"st":31,"r":24,"s":41}]', '[{"p":6,"st":7,"r":25,"s":42},{"p":2,"st":13,"s":43},{"p":2,"st":19,"s":44},{"p":2,"st":15,"s":45},{"p":2,"st":16,"s":46},{"p":7,"st":8,"r":2,"s":11},{"p":7,"st":9,"r":7,"s":12},{"p":3,"st":10,"r":8,"s":47},{"p":6,"st":18,"r":26,"s":48},{"p":6,"st":11,"r":27,"s":49}]', …]
// SocketIndexes: (115) ['[0,1]', '[4]', '[5]', '[6,7,8,9]', '[10]', '[11]', '[0]', '[6,7,12]', '[9]', '[1,2,3,4,8,9]', …]

export type ItemDefinition = Output<typeof ItemDefinitionSchema>;
