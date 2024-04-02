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

// These are the fewest arguments possible. itemInstanceId would be enough for all instanced items. But for non
// instanced the characterId and itemHash are needed. Because you could have a non instanced item such as upgrade
// materials in the lost items of two different characters. So the characterId is needed to find the correct item.
// TODO: This function does not check the global items, mods or consumables.
export function findDestinyItem(
  itemInstanceId: string | undefined,
  itemHash: number,
  characterId: string,
): DestinyItem {
  const itemDefinition = itemsDefinition[itemHash];
  if (!itemDefinition) {
    throw new Error("No itemDefinition found");
  }

  if (itemDefinition.b !== undefined) {
    const defaultBucket = bucketTypeHashArray[itemDefinition.b];

    const instancedItem = itemInstanceId !== undefined;
    if (defaultBucket) {
      if (characterId === "VAULT") {
        const vault = useGGStore.getState().vault;
        const vaultSectionInventory = vault.items[138197802]?.items[defaultBucket]?.inventory;
        if (vaultSectionInventory) {
          for (const item of vaultSectionInventory) {
            if (instancedItem) {
              if (item.itemInstanceId === itemInstanceId) {
                return item;
              }
            } else {
              if (item.itemHash === itemHash) {
                return item;
              }
            }
          }
        }
      } else {
        const guardians = useGGStore.getState().guardians;
        const section = guardians[characterId]?.items[defaultBucket];

        if (section) {
          if (section.equipped && section.equipped?.itemInstanceId === itemInstanceId) {
            return section.equipped;
          }

          for (const item of section.inventory) {
            if (item.itemInstanceId === itemInstanceId) {
              return item;
            }
          }
        }

        // Check the lost items
        const lostItems = guardians[characterId]?.items[215593132]?.inventory;
        if (lostItems) {
          for (const item of lostItems) {
            if (instancedItem) {
              if (item.itemInstanceId === itemInstanceId) {
                return item;
              }
            } else {
              if (item.itemHash === itemHash) {
                return item;
              }
            }
          }
        }
      }
    } else {
      console.error("No default bucket");
    }
  }
  throw new Error("No DestinyItem found");
}
