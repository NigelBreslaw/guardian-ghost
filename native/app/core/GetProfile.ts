// -------------------------------
// getProfile is so large and an important part it
// lives here in its own file
// -------------------------------

import { bungieResponseSchema } from "@/app/core/ApiResponse.ts";
import type { Branded } from "@/app/utilities/Helpers.ts";
import {
  array,
  boolean,
  isoTimestamp,
  merge,
  number,
  object,
  optional,
  record,
  string,
  unknown,
  type Output,
} from "valibot";

// -------------------------------
// PlugSets are used all over the API. Not just in getProfile
// -------------------------------

export const PlugSetsSchema = array(
  object({
    canInsert: boolean(),
    enabled: boolean(),
    plugItemHash: number(),
    enableFailIndexes: optional(array(number())),
    insertFailIndexes: optional(array(number())),
    plugObjectives: optional(
      array(
        object({
          complete: boolean(),
          completionValue: number(),
          objectiveHash: number(),
          progress: number(),
          visible: boolean(),
        }),
      ),
    ),
  }),
);

export type PlugSet = Output<typeof PlugSetsSchema>;

// -------------------------------
// sub schemas that getProfile uses
// -------------------------------

export const ItemSchema = object({
  bindStatus: number(),
  bucketHash: number(),
  dismantlePermission: number(),
  expirationDate: optional(string([isoTimestamp()])),
  isWrapper: boolean(),
  itemHash: number(),
  itemInstanceId: optional(string()),
  itemValueVisibility: optional(array(boolean())),
  location: number(),
  lockable: boolean(),
  overrideStyleItemHash: optional(number()),
  quantity: number(),
  state: number(),
  tooltipNotificationIndexes: optional(array(number())),
  transferStatus: number(),
  versionNumber: optional(number()),
});

export type ItemHash = Branded<number, "ItemHash">;
export type ItemInstanceId = Branded<string, "ItemInstanceId">;

type RawDestinyItemBase = Output<typeof ItemSchema>;
export type DestinyItemBase = Omit<RawDestinyItemBase, "itemHash" | "itemInstanceId" | "overrideStyleItemHash"> & {
  itemHash: ItemHash;
  itemInstanceId?: ItemInstanceId;
  overrideStyleItemHash?: ItemHash;
};

export const GuardiansSchema = object({
  baseCharacterLevel: number(),
  characterId: string(),
  classHash: number(),
  classType: number(),
  dateLastPlayed: string([isoTimestamp()]),
  emblemBackgroundPath: string(),
  emblemColor: object({}),
  emblemHash: number(),
  emblemPath: string(),
  genderHash: number(),
  genderType: number(),
  levelProgression: object({
    currentProgress: number(),
    dailyLimit: number(),
    dailyProgress: number(),
    level: number(),
    levelCap: number(),
    nextLevelAt: number(),
    progressToNextLevel: number(),
    progressionHash: number(),
    stepIndex: number(),
    weeklyLimit: number(),
    weeklyProgress: number(),
  }),
  light: number(),
  membershipId: string(),
  membershipType: number(),
  minutesPlayedThisSession: string(),
  minutesPlayedTotal: string(),
  percentToNextLevel: number(),
  raceHash: number(),
  raceType: number(),
  stats: record(string(), number()),
  titleRecordHash: optional(number()),
});

export type GuardianData = Output<typeof GuardiansSchema>;

const ReusablePlugSetSchema = object({
  plugs: record(string(), PlugSetsSchema),
});

const instancesSchema = record(
  string(),
  object({
    canEquip: boolean(),
    cannotEquipReason: number(),
    damageType: number(),
    damageTypeHash: optional(number()),
    energy: optional(
      object({
        energyCapacity: number(),
        energyType: number(),
        energyTypeHash: number(),
        energyUnused: number(),
        energyUsed: number(),
      }),
    ),
    equipRequiredLevel: number(),
    isEquipped: boolean(),
    itemLevel: number(),
    primaryStat: optional(
      object({
        statHash: number(),
        value: number(),
      }),
    ),
    quality: number(),
    unlockHashesRequiredToEquip: array(number()),
  }),
);

export type GGInstances = Output<typeof instancesSchema>;

export const SocketSchema = object({
  sockets: array(
    object({
      plugHash: optional(number()),
      isEnabled: boolean(),
      isVisible: boolean(),
      enableFailIndexes: optional(array(number())),
    }),
  ),
});

export type SocketData = Output<typeof SocketSchema>;

// -------------------------------
// getProfile
// NOTE: There are two validation versions. The full version that defines the entire response.
// The simple version is then used to validate the response. It makes an assumption that the
// rest of the response is valid. This means the validation takes around 30ms instead of 1000ms.
// -------------------------------

export const getProfileSchema = merge([
  bungieResponseSchema,
  object({
    Response: object({
      characterEquipment: object({
        data: record(string(), object({ items: array(ItemSchema) })),
        privacy: number(),
      }),
      characterInventories: object({
        data: record(string(), object({ items: array(ItemSchema) })),
      }),
      characterLoadouts: object({}),
      characterPlugSets: object({
        data: optional(record(string(), object({ plugs: record(string(), PlugSetsSchema) }))),
      }),
      characterProgressions: object({}),
      characterStringVariables: object({}),
      characterUninstancedItemComponents: object({}),
      characters: object({
        data: record(string(), GuardiansSchema),
      }),

      itemComponents: object({
        instances: object({
          data: instancesSchema,
        }),
        sockets: object({
          data: record(string(), SocketSchema),
        }),
        reusablePlugs: object({
          data: record(string(), ReusablePlugSetSchema),
        }),
      }),
      profile: object({}),
      profileCurrencies: object({}),
      profileInventory: object({
        data: object({ items: array(ItemSchema) }),
      }),
      profilePlugSets: object({
        data: optional(
          object({
            plugs: record(string(), PlugSetsSchema),
          }),
        ),
      }),
      profileProgression: object({}),
      profileStringVariables: object({}),
      responseMintedTimestamp: string([isoTimestamp()]),
      secondaryComponentsMintedTimestamp: string([isoTimestamp()]),
    }),
  }),
]);

export type ProfileData = Output<typeof getProfileSchema>;

export const getSimpleProfileSchema = merge([
  bungieResponseSchema,
  object({
    Response: object({
      characterEquipment: object({
        data: record(string(), unknown()),
        privacy: number(),
      }),
      characterInventories: object({
        data: unknown(),
      }),
      characterLoadouts: object({}),
      characterPlugSets: object({ data: optional(unknown()) }),
      characterProgressions: object({}),
      characterStringVariables: object({}),
      characterUninstancedItemComponents: object({}),
      characters: object({
        data: record(string(), unknown()),
      }),

      itemComponents: object({
        instances: object({
          data: unknown(),
        }),
        sockets: object({
          data: unknown(),
        }),
        reusablePlugs: object({
          data: unknown(),
        }),
      }),
      profile: object({}),
      profileCurrencies: object({}),
      profileInventory: object({
        data: object({ items: unknown() }),
      }),
      profilePlugSets: optional(
        object({
          data: object({
            plugs: unknown(),
          }),
        }),
      ),
      profileProgression: object({}),
      profileStringVariables: object({}),
      responseMintedTimestamp: string([isoTimestamp()]),
      secondaryComponentsMintedTimestamp: string([isoTimestamp()]),
    }),
  }),
]);
