import type { DestinyItem, DestinyItemSort, GuardianGear, VaultData } from "@/app/bungie/Types.ts";
import {
  UISection,
  armorPageBuckets,
  generalPageBuckets,
  getDamageTypeIconUri,
  weaponsPageBuckets,
  type DestinyIconData,
  type EngramsSection,
  type EquipSection,
  type SeparatorSection,
  type UISections,
  type Vault5x5Section,
  type VaultFlexSection,
} from "@/app/inventory/Common.ts";
import type { AccountSliceGetter, AccountSliceSetter } from "@/app/store/AccountSlice.ts";
import { itemsDefinition, rawProfileData } from "@/app/store/Definitions.ts";
import { typeAndPowerSort } from "@/app/utilities/Helpers.ts";
import { create } from "mutative";

// ------------------------------
// UI data creation
// ------------------------------

export function updateAllPages(get: AccountSliceGetter, set: AccountSliceSetter) {
  const p1 = performance.now();
  const weaponsPageData = buildUIData(get, weaponsPageBuckets);
  const armorPageData = buildUIData(get, armorPageBuckets);
  const generalPageData = buildUIData(get, generalPageBuckets);
  const p2 = performance.now();
  console.log("built UI data for all pages", `${(p2 - p1).toFixed(4)} ms`);
  set({ weaponsPageData, armorPageData, generalPageData });
  const p3 = performance.now();
  console.log("Rebuild UI took:", `${(p3 - p2).toFixed(4)} ms`);
}

export function buildUIData(get: AccountSliceGetter, itemBuckets: number[]): UISections[][] {
  const characterDataArray: UISections[][] = [];
  const guardians = get().guardians;
  const vaultData = get().generalVault;

  if (!rawProfileData || !guardians || !vaultData) {
    console.error("No profile, guardians or generalVault");
    return characterDataArray;
  }

  for (const character in guardians) {
    const characterData = guardians[character];
    if (characterData) {
      const dataArray: UISections[] = [];

      for (const bucket of itemBuckets) {
        // create section separators
        const separator: SeparatorSection = {
          id: `${bucket}_separator`,
          type: UISection.Separator,
        };
        dataArray.push(separator);

        const bucketItems = characterData.items[bucket];

        // TODO: If artifact (1506418338) create an artifact section
        if (bucket === 1506418338) {
          continue;
        }

        // Handle engrams
        if (bucket === 375726501) {
          const engramsSection: EngramsSection = {
            id: `${bucket}_engrams_section`,
            type: UISection.Engrams,
            inventory: [],
          };
          if (bucketItems) {
            engramsSection.inventory = returnInventoryArray(bucketItems, bucket);
          }
          dataArray.push(engramsSection);
          continue;
        }

        const equipSectionCell: EquipSection = {
          id: `${bucket}_equip_section`,
          type: UISection.CharacterEquipment,
          equipped: null,
          inventory: [],
        };
        if (bucketItems) {
          const equipped = bucketItems.equipped;

          if (equipped) {
            equipSectionCell.equipped = returnDestinyIconData(equipped);
          }
          equipSectionCell.inventory = returnInventoryArray(bucketItems, bucket);

          dataArray.push(equipSectionCell);
        }
      }
      characterDataArray.push(dataArray);
    }
  }
  // Now build the vault data
  const vaultUiData = returnVaultUiData(itemBuckets, vaultData);
  characterDataArray.push(vaultUiData);

  return characterDataArray;
}

function returnVaultUiData(itemBuckets: number[], vaultData: VaultData): UISections[] {
  const dataArray: UISections[] = [];

  for (const bucket of itemBuckets) {
    const bucketItems = vaultData.items[bucket];
    if (bucketItems) {
      const separator: SeparatorSection = {
        id: `${bucket}_separator`,
        type: UISection.Separator,
      };
      dataArray.push(separator);

      // get an array of all the items
      const totalItemsArray = returnInventoryArray(bucketItems, bucket);

      let itemsLeft = totalItemsArray.length;
      let count = 0;
      while (itemsLeft > 0) {
        // is there 21 or more items left?
        if (itemsLeft > 20) {
          const vault5x5Cell: Vault5x5Section = {
            id: `${bucket}_5x5_section${count}`,
            type: UISection.Vault5x5,
            inventory: [],
          };

          const startingPoint = Math.max(0, totalItemsArray.length - itemsLeft);

          const itemsToAdd: DestinyIconData[] = [];
          for (let i = startingPoint; i < startingPoint + 25; i++) {
            const item = totalItemsArray[i];
            if (item) {
              itemsToAdd.push(item);
            } else {
              break;
            }
          }
          vault5x5Cell.inventory = itemsToAdd;
          dataArray.push(vault5x5Cell);
          itemsLeft -= 25;
          count++;
        } else {
          const vaultFlexCell: VaultFlexSection = {
            id: `${bucket}_flex_section`,
            type: UISection.VaultFlex,
            inventory: [],
          };

          const startingPoint = Math.max(0, totalItemsArray.length - itemsLeft);

          const itemsToAdd: DestinyIconData[] = [];
          for (let i = startingPoint; i < startingPoint + itemsLeft; i++) {
            const item = totalItemsArray[i];
            if (item) {
              itemsToAdd.push(item);
            }
          }
          vaultFlexCell.inventory = itemsToAdd;
          dataArray.push(vaultFlexCell);
          itemsLeft = 0;
        }
      }
    }
  }
  return dataArray;
}

function returnDestinyIconData(item: DestinyItem): DestinyIconData {
  const damageTypeIconUri = getDamageTypeIconUri(item.damageType);
  const primaryStat = item.primaryStat > 0 ? item.primaryStat.toString() : "";
  const borderColor = returnBorderColor(item);
  const masterwork = item.masterwork ?? false;
  const crafted = item.crafted;

  const iconData: DestinyIconData = {
    itemHash: item.itemHash,
    itemInstanceId: item.itemInstanceId,
    characterId: item.characterId,
    icon: item.icon,
    primaryStat,
    calculatedWaterMark: item.calculatedWaterMark,
    damageTypeIconUri,
    masterwork,
    borderColor,
    crafted,
  };
  return iconData;
}

function returnBorderColor(item: DestinyItem): string {
  if (item.deepSightResonance) {
    return "#FF603E";
  }
  if (item.masterwork) {
    return "#CEAE32";
  }
  return "#555555";
}

const weaponBuckets = [1498876634, 2465295065, 953998645];

function returnInventoryArray(characterGear: GuardianGear, bucketHash: number): DestinyIconData[] {
  const inventoryArray: DestinyIconData[] = [];

  let existingArray = characterGear.inventory as DestinyItemSort[];
  if (weaponBuckets.includes(bucketHash)) {
    existingArray = existingArray.sort(typeAndPowerSort);
  }

  for (const item of existingArray) {
    const iconData = returnDestinyIconData(item);
    inventoryArray.push(iconData);
  }

  return inventoryArray;
}

// ------------------------------
// Update UI logic
// ------------------------------

export function removeFromVault(get: AccountSliceGetter, set: AccountSliceSetter, destinyItem: DestinyItem) {
  const previousGeneralVault = get().generalVault;
  const previousInventory = previousGeneralVault.items[destinyItem.bucketHash]?.inventory;
  const updatedInventory = previousInventory?.filter((item) => item.itemInstanceId !== destinyItem.itemInstanceId);
  if (!updatedInventory) {
    console.error("updatedInventory is undefined");
    return;
  }

  const updatedGeneralVault = create(previousGeneralVault, (draft) => {
    draft.items[destinyItem.bucketHash] = { equipped: null, inventory: updatedInventory };
  });

  set({ generalVault: updatedGeneralVault });
}

export function addToVault(get: AccountSliceGetter, set: AccountSliceSetter, destinyItem: DestinyItem) {
  const previousGeneralVault = get().generalVault;

  const updatedGeneralVault = create(previousGeneralVault, (draft) => {
    draft.items[destinyItem.bucketHash]?.inventory.push(destinyItem);
  });

  set({ generalVault: updatedGeneralVault });
}

export function removeFromGuardian(get: AccountSliceGetter, set: AccountSliceSetter, destinyItem: DestinyItem) {
  const previousGuardians = get().guardians;

  const previousInventory =
    previousGuardians[destinyItem.previousCharacterId]?.items[destinyItem.bucketHash]?.inventory;
  const updatedInventory = previousInventory?.filter((item) => item.itemInstanceId !== destinyItem.itemInstanceId);
  if (!updatedInventory) {
    console.error("updatedInventory or previousGuardian is undefined");
    return;
  }

  const updatedGuardians = create(previousGuardians, (draft) => {
    const updatedGuardian = draft[destinyItem.previousCharacterId];
    if (!updatedGuardian) {
      console.error("updatedGuardian is undefined");
      return;
    }
    const equippedItem = updatedGuardian.items[destinyItem.bucketHash]?.equipped ?? null;
    updatedGuardian.items[destinyItem.bucketHash] = { equipped: equippedItem, inventory: updatedInventory };
  });
  set({ guardians: updatedGuardians });
}

export function addToGuardian(get: AccountSliceGetter, set: AccountSliceSetter, destinyItem: DestinyItem) {
  const previousGuardians = get().guardians;

  const updatedGuardians = create(previousGuardians, (draft) => {
    draft[destinyItem.characterId]?.items[destinyItem.bucketHash]?.inventory.push(destinyItem);
  });
  set({ guardians: updatedGuardians });
}

export function swapEquipAndInventoryItem(get: AccountSliceGetter, set: AccountSliceSetter, destinyItem: DestinyItem) {
  const previousGuardians = get().guardians;

  const previousInventorySection = previousGuardians[destinyItem.characterId]?.items[destinyItem.bucketHash];

  const updatedInventory = previousInventorySection?.inventory?.filter(
    (item) => item.itemInstanceId !== destinyItem.itemInstanceId,
  );
  if (!updatedInventory) {
    console.error("swapEquipAndInventoryItem(), updatedInventory or previousGuardian is undefined");
    return;
  }
  const previousEquippedItem = previousInventorySection?.equipped;
  if (previousEquippedItem) {
    const setNotEquipped = { ...previousEquippedItem, equipped: false };
    updatedInventory.push(setNotEquipped);
  }

  const updatedGuardians = create(previousGuardians, (draft) => {
    const updatedGuardian = draft[destinyItem.characterId];
    if (!updatedGuardian) {
      console.error("updatedGuardian is undefined");
      return;
    }
    updatedGuardian.items[destinyItem.bucketHash] = { equipped: destinyItem, inventory: updatedInventory };
  });
  set({ guardians: updatedGuardians });
}

const deepSightItemHash: number[] = [101423981, 213377779, 1948344346, 2373253941, 2400712188, 3394691176, 3632593563];

export function hasSocketedResonance(itemInstanceId: string): boolean {
  const liveSocketJson = rawProfileData?.Response.itemComponents.sockets.data[itemInstanceId];
  if (!liveSocketJson) {
    return false;
  }
  const ph = liveSocketJson.sockets[12]?.plugHash;
  if (!ph) {
    return false;
  }

  return deepSightItemHash.includes(ph);
}

// This function takes a lot of assumptions to work out if a crafted item has 2 enhanced perks
export function checkForCraftedMasterwork(itemInstanceId: string): boolean {
  // The enhanced plugs will be in the items reusable plugs
  const reusablePlugs = rawProfileData?.Response.itemComponents.reusablePlugs.data[itemInstanceId]?.plugs;
  if (!reusablePlugs) {
    return false;
  }
  // In the dictionary items "3" and "4" are currently the only slots for enhanced plugs.
  // Even though there can be an array, presume position 0 is the only valid one.
  // Get the plugItemHash
  const third = reusablePlugs["3"]?.[0]?.plugItemHash;
  const fourth = reusablePlugs["4"]?.[0]?.plugItemHash;

  if (!third || !fourth) {
    return false;
  }

  // If the tierType is equal to 3 it is enhanced
  const thirdSocketIsEnhanced = itemsDefinition[third]?.t === 3;
  const fourthSocketIsEnhanced = itemsDefinition[fourth]?.t === 3;

  return thirdSocketIsEnhanced && fourthSocketIsEnhanced;
}
