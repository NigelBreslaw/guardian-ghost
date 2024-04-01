import type { DestinyItem } from "@/app/bungie/Types.ts";
import { bucketTypeHashArray, itemsDefinition } from "@/app/store/Definitions.ts";
import { useGGStore } from "@/app/store/GGStore.ts";

export type TransferItem = {
  itemInstanceId: string | undefined;
  itemHash: number;
  finalTargetId: string;
  quantity: number;
  equipOnTarget: boolean;
};

export function findDestinyItem(itemInstanceId: string | undefined, itemHash: number): DestinyItem {
  const itemDefinition = itemsDefinition[itemHash];
  if (!itemDefinition) {
    throw new Error("No itemDefinition found");
  }
  // has itemInstanceId ?
  if (itemInstanceId && itemDefinition.b !== undefined) {
    const defaultBucket = bucketTypeHashArray[itemDefinition.b];
    if (defaultBucket) {
      // First check the guardians
      const guardians = useGGStore.getState().guardians;
      for (const guardian in guardians) {
        const section = guardians[guardian]?.items[defaultBucket];

        if (section) {
          if (section.equipped?.itemInstanceId === itemInstanceId) {
            return section.equipped;
          }

          for (const item of section.inventory) {
            if (item.itemInstanceId === itemInstanceId) {
              return item;
            }
          }
        }

        // Check the lost items
        const lostItems = guardians[guardian]?.items[215593132]?.inventory;
        if (lostItems) {
          for (const item of lostItems) {
            if (item.itemInstanceId === itemInstanceId) {
              return item;
            }
          }
        }
      }

      // Then check the vault
      const vault = useGGStore.getState().vault;
      // TODO:
      const vaultSectionInventory = vault.items[138197802]?.items[defaultBucket]?.inventory;
      if (vaultSectionInventory) {
        for (const item of vaultSectionInventory) {
          if (item.itemInstanceId === itemInstanceId) {
            return item;
          }
        }
      }
    } else {
      console.error("No default bucket");
    }
  }

  throw new Error("No DestinyItem found");
}
