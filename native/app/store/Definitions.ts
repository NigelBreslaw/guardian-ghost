import type { DestinyItem, Guardian, ProfileData } from "@/app/bungie/Types.ts";
import type { SingleItemDefinition } from "@/app/store/Types.ts";

export type ItemsDefinition = Record<string, SingleItemDefinition>;

export let itemsDefinition: ItemsDefinition = {};
export let bucketTypeHashArray: number[];
export let iconWaterMarks: string[];
export let itemTypeDisplayName: string[];
export let stackUniqueLabel: string[];
export let PlugCategoryIdentifier: string[];

export let rawProfileData: ProfileData | null;
export let lostItems: DestinyItem[] = [];
export let consumables: DestinyItem[] = [];
export let mods: DestinyItem[] = [];
export let generalVault: Record<number, DestinyItem[]> = {};
export let guardians: Record<string, Guardian> = {};

export function setItemDefinition(newItemsDefinition: ItemsDefinition) {
  itemsDefinition = newItemsDefinition;
}

export function setBucketTypeHashArray(bucketTypeHashDefinition: number[]) {
  bucketTypeHashArray = bucketTypeHashDefinition;
}

export function setIconWaterMarks(iconWaterMarksDefinition: string[]) {
  iconWaterMarks = iconWaterMarksDefinition;
}

export function setItemTypeDisplayName(itemTypeDisplayNameDefinition: string[]) {
  itemTypeDisplayName = itemTypeDisplayNameDefinition;
}

export function setStackUniqueLabel(stackUniqueLabelDefinition: string[]) {
  stackUniqueLabel = stackUniqueLabelDefinition;
}

export function setRawProfileData(profileData: ProfileData) {
  rawProfileData = profileData;
}

export function setPlugCategoryIdentifier(plugCategoryIdentifier: string[]) {
  PlugCategoryIdentifier = plugCategoryIdentifier;
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
