import type { DestinyItem, Guardian } from "@/app/inventory/logic/Types.ts";
import type {
  MiniSingleItemDefinition,
  SocketCategoryDefinition,
  StatGroupDefinition,
  StatDefinition,
  InventoryBucketDefinition,
  ItemResponse,
} from "@/app/core/BungieDefinitions";
import type { CharacterId, ProfileData } from "@/app/core/GetProfile.ts";
import { SectionBuckets } from "@/app/bungie/Enums.ts";

export type ItemsDefinition = Record<string, MiniSingleItemDefinition>;

// Centralized Helpers store (all minified helper arrays)
type HelpersType = ItemResponse["helpers"];
const helpersStore: Partial<HelpersType> = {};
export const Helpers = helpersStore as Readonly<HelpersType>;

export const DestinyDefinitions = {
  itemsDefinition: {} as ItemsDefinition,
  socketCategory: {} as SocketCategoryDefinition,
  stat: {} as StatDefinition,
  inventoryBucket: {} as InventoryBucketDefinition,
};

export const ProfileDataHelpers = {
  rawProfile: {} as ProfileData,
  lostItems: {} as DestinyItem[],
  consumables: {} as DestinyItem[],
  mods: {} as DestinyItem[],
  generalVault: {} as Map<number, DestinyItem[]>,
  guardians: {} as Map<CharacterId, Guardian>,
};
export let StatGroupHelper: StatGroupHelper = new Map<number, Map<number, DisplayInterpolation>>();

export function setItemDefinition(newItemsDefinition: ItemsDefinition) {
  DestinyDefinitions.itemsDefinition = newItemsDefinition;
}

export function setHelpers(newHelpers: HelpersType) {
  Object.assign(helpersStore, newHelpers);
}

export function setRawProfileData(profileData: ProfileData) {
  ProfileDataHelpers.rawProfile = profileData;
}

export function setLostItems(newLostItems: DestinyItem[]) {
  ProfileDataHelpers.lostItems = newLostItems;
}

export function setConsumables(newConsumables: DestinyItem[]) {
  ProfileDataHelpers.consumables = newConsumables;
}

export function setMods(newMods: DestinyItem[]) {
  ProfileDataHelpers.mods = newMods;
}

export function setGeneralVault(newGeneralVault: Map<number, DestinyItem[]>) {
  ProfileDataHelpers.generalVault = newGeneralVault;
}

export function setGuardians(newGuardians: Map<CharacterId, Guardian>) {
  ProfileDataHelpers.guardians = newGuardians;
}

export function setDestinySocketCategoryDefinition(newDestinySocketCategoryDefinition: SocketCategoryDefinition) {
  DestinyDefinitions.socketCategory = newDestinySocketCategoryDefinition;
}

export function setDestinyStatGroupDefinition(newDestinyStatGroupDefinition: StatGroupDefinition) {
  StatGroupHelper = buildStatGroupDefinitionHelper(newDestinyStatGroupDefinition);
}

export function setDestinyStatDefinition(newDestinyStatDefinition: StatDefinition) {
  DestinyDefinitions.stat = newDestinyStatDefinition;
  updateDestinyText();
}

export function setDestinyInventoryBucketDefinition(newDestinyInventoryBucketDefinition: InventoryBucketDefinition) {
  DestinyDefinitions.inventoryBucket = newDestinyInventoryBucketDefinition;
  updateBucketSizes();
}

type DisplayInterpolation = {
  maximumValue: number;
  displayInterpolation: { value: number; weight: number }[];
};

type StatGroupHelper = Map<number, Map<number, DisplayInterpolation>>;

function buildStatGroupDefinitionHelper(definition: StatGroupDefinition): StatGroupHelper {
  const helper = new Map<number, Map<number, DisplayInterpolation>>();
  const statHashes = Object.keys(definition);

  for (const statHash of statHashes) {
    const statGroup = definition?.[statHash]?.scaledStats;
    if (!statGroup) {
      console.error("No statGroupDefinition found");
      continue;
    }
    const statGroupData = new Map<number, DisplayInterpolation>();
    for (const stat of statGroup) {
      const statHash = stat.statHash;
      const maximumValue = stat.maximumValue;
      const table = stat.displayInterpolation;
      const data = {
        maximumValue,
        displayInterpolation: table,
      };
      statGroupData.set(statHash, data);
    }
    const statHashNumber = Number(statHash);
    helper.set(statHashNumber, statGroupData);
  }
  return helper;
}

export const BUCKET_SIZES = {
  [SectionBuckets.Consumables]: 50,
  [SectionBuckets.Mods]: 50,
  [SectionBuckets.LostItem]: 21,
  [SectionBuckets.Vault]: 500,
};

export const DESTINY_TEXT = {
  POWER: "",
};

function updateBucketSizes() {
  BUCKET_SIZES[SectionBuckets.Consumables] =
    DestinyDefinitions.inventoryBucket?.[SectionBuckets.Consumables]?.itemCount ?? 5;
  BUCKET_SIZES[SectionBuckets.Mods] = DestinyDefinitions.inventoryBucket?.[SectionBuckets.Mods]?.itemCount ?? 5;
  BUCKET_SIZES[SectionBuckets.LostItem] = DestinyDefinitions.inventoryBucket?.[SectionBuckets.LostItem]?.itemCount ?? 5;
  BUCKET_SIZES[SectionBuckets.Vault] = DestinyDefinitions.inventoryBucket?.[SectionBuckets.Vault]?.itemCount ?? 5;
}

function updateDestinyText() {
  DESTINY_TEXT.POWER = DestinyDefinitions.stat?.[1935470627]?.displayProperties.name ?? "";
}
