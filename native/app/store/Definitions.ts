import type { SingleItemDefinition } from "@/app/store/Types.ts";

export type ItemsDefinition = Record<string, SingleItemDefinition>;

export let itemsDefinition: ItemsDefinition = {};
export let bucketTypeHashArray: Array<number>;
export let iconWaterMarks: Array<string>;
export let itemTypeDisplayName: Array<string>;

export function setItemDefinition(itemDefinition: ItemsDefinition) {
  itemsDefinition = itemDefinition;
}

export function setBucketTypeHashArray(bucketTypeHashDefinition: Array<number>) {
  bucketTypeHashArray = bucketTypeHashDefinition;
}

export function setIconWaterMarks(iconWaterMarksDefinition: Array<string>) {
  iconWaterMarks = iconWaterMarksDefinition;
}

export function setItemTypeDisplayName(itemTypeDisplayNameDefinition: Array<string>) {
  itemTypeDisplayName = itemTypeDisplayNameDefinition;
}
