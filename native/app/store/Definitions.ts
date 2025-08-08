import type { DestinyItem, Guardian } from "@/app/inventory/logic/Types.ts";
import type {
  MiniSocketCategoryItems,
  MiniSocketEntryItems,
  MiniSingleItemDefinition,
  SocketCategoryDefinition,
  StatGroupDefinition,
  StatDefinition,
  InventoryBucketDefinition,
} from "@/app/core/BungieDefinitions";
import type { BucketHash, CharacterId, ItemHash, ProfileData } from "@/app/core/GetProfile.ts";
import { SectionBuckets } from "@/app/bungie/Enums.ts";

export type ItemsDefinition = Record<string, MiniSingleItemDefinition>;

export let itemsDefinition: ItemsDefinition = {};
export let BucketTypeHashArray: BucketHash[];
export let DamageTypeHashes: number[];
export let Descriptions: string[];
export let DisplaySources: string[];
export let ExpirationTooltip: string[];
export let ExpiredInActivityMessage: string[];
export let IconWaterMarks: string[];
export let IconWaterMarksFeatured: string[];
export let ItemTypeDisplayName: string[];
export let ItemValue: number[];
export let InsertionMaterialRequirementHash: number[];
export let PlugCategoryHash: number[];
export let PlugCategoryIdentifier: string[];
export let ReusablePlugSetHash: number[];
export let RandomizedPlugSetHash: number[];
export let SingleInitialItemHash: ItemHash[];
export let SocketCategories: MiniSocketCategoryItems; // These strings are JSON objects
export let SocketCategoryHash: number[];
export let SocketEntries: MiniSocketEntryItems;
export let SocketIndexes: number[][];
export let SocketTypeHash: number[];
export let StackUniqueLabel: string[];
export let StatGroupHash: number[];
export let StatHash: number[];
export let TalentGridHash: number[];
export let TooltipNotifications: string[];
export let TraitIds: string[];
export let UiItemDisplayStyle: string[];
export let UiPlugLabel: string[];
export let Icons: string[];

export let rawProfileData: ProfileData | null;
export let lostItems: DestinyItem[] = [];
export let consumables: DestinyItem[] = [];
export let mods: DestinyItem[] = [];
export let generalVault: Map<number, DestinyItem[]> = new Map<number, DestinyItem[]>();
export let guardians: Map<CharacterId, Guardian> = new Map<CharacterId, Guardian>();

export let DestinySocketCategoryDefinition: SocketCategoryDefinition;
export let DestinyStatDefinition: StatDefinition;
export let StatGroupHelper: StatGroupHelper = new Map<number, Map<number, DisplayInterpolation>>();
export let DestinyInventoryBucketDefinition: InventoryBucketDefinition;

export function setItemDefinition(newItemsDefinition: ItemsDefinition) {
  itemsDefinition = newItemsDefinition;
}

export function setBucketTypeHashArray(bucketTypeHashDefinition: number[]) {
  BucketTypeHashArray = bucketTypeHashDefinition as BucketHash[];
}

export function setDamageTypeHashes(damageTypeHashesDefinition: number[]) {
  DamageTypeHashes = damageTypeHashesDefinition;
}

export function setDescriptions(descriptionsDefinition: string[]) {
  Descriptions = descriptionsDefinition;
}

export function setDisplaySources(displaySourcesDefinition: string[]) {
  DisplaySources = displaySourcesDefinition;
}

export function setExpirationTooltip(expirationTooltipDefinition: string[]) {
  ExpirationTooltip = expirationTooltipDefinition;
}

export function setExpiredInActivityMessage(expiredInActivityMessageDefinition: string[]) {
  ExpiredInActivityMessage = expiredInActivityMessageDefinition;
}

export function setIconWaterMarks(iconWaterMarksDefinition: string[]) {
  IconWaterMarks = iconWaterMarksDefinition;
}

export function setIconWaterMarksFeatured(iconWaterMarksFeaturedDefinition: string[]) {
  IconWaterMarksFeatured = iconWaterMarksFeaturedDefinition;
}

export function setItemTypeDisplayName(itemTypeDisplayNameDefinition: string[]) {
  ItemTypeDisplayName = itemTypeDisplayNameDefinition;
}

export function setItemValue(itemValueDefinition: number[]) {
  ItemValue = itemValueDefinition;
}

export function setInsertionMaterialRequirementHash(insertionMaterialRequirementHashDefinition: number[]) {
  InsertionMaterialRequirementHash = insertionMaterialRequirementHashDefinition;
}

export function setPlugCategoryHash(plugCategoryHashDefinition: number[]) {
  PlugCategoryHash = plugCategoryHashDefinition;
}

export function setPlugCategoryIdentifier(plugCategoryIdentifier: string[]) {
  PlugCategoryIdentifier = plugCategoryIdentifier;
}

export function setRandomizedPlugSetHash(randomizedPlugSetHashDefinition: number[]) {
  RandomizedPlugSetHash = randomizedPlugSetHashDefinition;
}

export function setReusablePlugSetHash(reusablePlugSetHashDefinition: number[]) {
  ReusablePlugSetHash = reusablePlugSetHashDefinition;
}

export function setSingleInitialItemHash(singleInitialItemHashDefinition: ItemHash[]) {
  SingleInitialItemHash = singleInitialItemHashDefinition;
}

export function setSocketCategories(socketCategoriesDefinition: unknown) {
  SocketCategories = socketCategoriesDefinition as MiniSocketCategoryItems;
}

export function setSocketCategoryHash(socketCategoryHashDefinition: number[]) {
  SocketCategoryHash = socketCategoryHashDefinition;
}

export function setSocketEntries(socketEntriesDefinition: unknown) {
  SocketEntries = socketEntriesDefinition as MiniSocketEntryItems;
}

export function setSocketIndexes(socketIndexesDefinition: unknown) {
  SocketIndexes = socketIndexesDefinition as number[][];
}

export function setSocketTypeHash(socketTypeHashDefinition: number[]) {
  SocketTypeHash = socketTypeHashDefinition;
}

export function setStackUniqueLabel(stackUniqueLabelDefinition: string[]) {
  StackUniqueLabel = stackUniqueLabelDefinition;
}

export function setStatGroupHash(statGroupHashDefinition: number[]) {
  StatGroupHash = statGroupHashDefinition;
}

export function setStatHash(statHashDefinition: number[]) {
  StatHash = statHashDefinition;
}

export function setTalentGridHash(talentGridHashDefinition: number[]) {
  TalentGridHash = talentGridHashDefinition;
}

export function setTooltipNotifications(tooltipNotificationsDefinition: string[]) {
  TooltipNotifications = tooltipNotificationsDefinition;
}

export function setTraitIds(traitIdsDefinition: string[]) {
  TraitIds = traitIdsDefinition;
}

export function setUiItemDisplayStyle(uiItemDisplayStyleDefinition: string[]) {
  UiItemDisplayStyle = uiItemDisplayStyleDefinition;
}

export function setUiPlugLabel(uiPlugLabelDefinition: string[]) {
  UiPlugLabel = uiPlugLabelDefinition;
}

export function setIcons(iconsDefinition: string[]) {
  Icons = iconsDefinition;
}

export function setRawProfileData(profileData: ProfileData) {
  rawProfileData = profileData;
}

export function setLostItems(newLostItems: DestinyItem[]) {
  lostItems = newLostItems;
}

export function setConsumables(newConsumables: DestinyItem[]) {
  consumables = newConsumables;
}

export function setMods(newMods: DestinyItem[]) {
  mods = newMods;
}

export function setGeneralVault(newGeneralVault: Map<number, DestinyItem[]>) {
  generalVault = newGeneralVault;
}

export function setGuardians(newGuardians: Map<CharacterId, Guardian>) {
  guardians = newGuardians;
}

export function setDestinySocketCategoryDefinition(newDestinySocketCategoryDefinition: SocketCategoryDefinition) {
  DestinySocketCategoryDefinition = newDestinySocketCategoryDefinition;
}

export function setDestinyStatGroupDefinition(newDestinyStatGroupDefinition: StatGroupDefinition) {
  StatGroupHelper = buildStatGroupDefinitionHelper(newDestinyStatGroupDefinition);
}

export function setDestinyStatDefinition(newDestinyStatDefinition: StatDefinition) {
  DestinyStatDefinition = newDestinyStatDefinition;
  updateDestinyText();
}

export function setDestinyInventoryBucketDefinition(newDestinyInventoryBucketDefinition: InventoryBucketDefinition) {
  DestinyInventoryBucketDefinition = newDestinyInventoryBucketDefinition;
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
    DestinyInventoryBucketDefinition?.[SectionBuckets.Consumables]?.itemCount ?? 5;
  BUCKET_SIZES[SectionBuckets.Mods] = DestinyInventoryBucketDefinition?.[SectionBuckets.Mods]?.itemCount ?? 5;
  BUCKET_SIZES[SectionBuckets.LostItem] = DestinyInventoryBucketDefinition?.[SectionBuckets.LostItem]?.itemCount ?? 5;
  BUCKET_SIZES[SectionBuckets.Vault] = DestinyInventoryBucketDefinition?.[SectionBuckets.Vault]?.itemCount ?? 5;
}

function updateDestinyText() {
  DESTINY_TEXT.POWER = DestinyStatDefinition?.[1935470627]?.displayProperties.name ?? "";
}
