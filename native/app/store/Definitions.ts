import type { ProfileData } from "@/app/bungie/Types.ts";
import type { SingleItemDefinition } from "@/app/store/Types.ts";

export type ItemsDefinition = Record<string, SingleItemDefinition>;

export let itemsDefinition: ItemsDefinition = {};
export let bucketTypeHashArray: number[];
export let iconWaterMarks: string[];
export let itemTypeDisplayName: string[];
export let stackUniqueLabel: string[];

export let rawProfileData: ProfileData | null;

export function setItemDefinition(itemDefinition: ItemsDefinition) {
  itemsDefinition = itemDefinition;
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
