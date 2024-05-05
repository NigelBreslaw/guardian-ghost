import type { DestinyItem, Guardian } from "@/app/bungie/Types.ts";
import type {
  MiniSocketCategoryItems,
  MiniSocketEntryItems,
  MiniSingleItemDefinition,
  SocketCategoryDefinition,
  StatGroupDefinition,
} from "@/app/core/BungieDefinitions";
import type { ProfileData } from "@/app/core/GetProfile.ts";

export type ItemsDefinition = Record<string, MiniSingleItemDefinition>;

export let itemsDefinition: ItemsDefinition = {};
export let BucketTypeHashArray: number[];
export let DamageTypeHashes: number[];
export let Descriptions: string[];
export let DisplaySources: string[];
export let ExpirationTooltip: string[];
export let ExpiredInActivityMessage: string[];
export let IconWaterMarks: string[];
export let ItemTypeDisplayName: string[];
export let ItemValue: number[];
export let InsertionMaterialRequirementHash: number[];
export let PlugCategoryHash: number[];
export let PlugCategoryIdentifier: string[];
export let ReusablePlugSetHash: number[];
export let SingleInitialItemHash: number[];
export let SocketCategories: MiniSocketCategoryItems; // These strings are JSON objects
export let SocketCategoryHash: number[];
export let SocketEntries: MiniSocketEntryItems;
export let SocketIndexes: number[][];
export let SocketTypeHash: number[];
export let StackUniqueLabel: string[];
export let StatGroupHash: number[];
export let StatHash: string[];
export let TalentGridHash: number[];
export let TooltipNotifications: string[];
export let TraitIds: string[];
export let UiItemDisplayStyle: string[];
export let UiPlugLabel: string[];

export let rawProfileData: ProfileData | null;
export let lostItems: DestinyItem[] = [];
export let consumables: DestinyItem[] = [];
export let mods: DestinyItem[] = [];
export let generalVault: Record<number, DestinyItem[]> = {};
export let guardians: Record<string, Guardian> = {};

export let DestinySocketCategoryDefinition: SocketCategoryDefinition;
export let DestinyStatGroupDefinition: StatGroupDefinition;

export function setItemDefinition(newItemsDefinition: ItemsDefinition) {
  itemsDefinition = newItemsDefinition;
}

export function setBucketTypeHashArray(bucketTypeHashDefinition: number[]) {
  BucketTypeHashArray = bucketTypeHashDefinition;
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

export function setReusablePlugSetHash(reusablePlugSetHashDefinition: number[]) {
  ReusablePlugSetHash = reusablePlugSetHashDefinition;
}

export function setSingleInitialItemHash(singleInitialItemHashDefinition: number[]) {
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

export function setStatHash(statHashDefinition: string[]) {
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

export function setGeneralVault(newGeneralVault: Record<number, DestinyItem[]>) {
  generalVault = newGeneralVault;
}

export function setGuardians(newGuardians: Record<string, Guardian>) {
  guardians = newGuardians;
}

export function setDestinySocketCategoryDefinition(newDestinySocketCategoryDefinition: SocketCategoryDefinition) {
  DestinySocketCategoryDefinition = newDestinySocketCategoryDefinition;
}

export function setDestinyStatGroupDefinition(newDestinyStatGroupDefinition: StatGroupDefinition) {
  DestinyStatGroupDefinition = newDestinyStatGroupDefinition;
}
