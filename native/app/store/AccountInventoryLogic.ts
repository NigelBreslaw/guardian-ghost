import { GGCharacterType, type DestinyItem, type DestinyItemSort } from "@/app/bungie/Types.ts";
import {
  SectionBuckets,
  UISection,
  armorPageBuckets,
  generalPageBuckets,
  getDamageTypeIconUri,
  getSectionDetails,
  ItemType,
  weaponBuckets,
  weaponsPageBuckets,
  type ArtifactSection,
  type DestinyIconData,
  type EngramsSection,
  type EquipSection,
  type LostItemsSection,
  type SeparatorSection,
  type UISections,
  type Vault5x5Section,
  type VaultFlexSection,
  type VaultSpacerSection,
} from "@/app/bungie/Common";
import type { AccountSliceGetter, AccountSliceSetter } from "@/app/store/AccountSlice.ts";
import { itemsDefinition, rawProfileData } from "@/app/store/Definitions.ts";
import {
  GLOBAL_CONSUMABLES_CHARACTER_ID,
  GLOBAL_MODS_CHARACTER_ID,
  VAULT_CHARACTER_ID,
} from "@/app/utilities/Constants.ts";
import { typeAndPowerSort } from "@/app/utilities/Helpers.ts";
import { create } from "mutative";
import { deepEqual } from "fast-equals";

// ------------------------------
// UI data creation
// ------------------------------

export function updateAllPages(get: AccountSliceGetter, set: AccountSliceSetter) {
  createUIData(get);
  const p1 = performance.now();

  // For each page use a deepEqual compare to see if the data has changed.
  // If it has changed then update just that page.
  const ggWeapons = get().ggWeapons;
  const newWeaponsPageData = buildUIData(get, weaponsPageBuckets);
  const updatedWeapons = getUpdatedItems(ggWeapons, newWeaponsPageData);
  if (updatedWeapons) {
    set({ ggWeapons: updatedWeapons });
  }

  const ggArmor = get().ggArmor;
  const newArmorPageData = buildUIData(get, armorPageBuckets);
  const updatedArmor = getUpdatedItems(ggArmor, newArmorPageData);
  if (updatedArmor) {
    set({ ggArmor: updatedArmor });
  }

  const ggGeneral = get().ggGeneral;
  const newGeneralPageData = buildUIData(get, generalPageBuckets);
  const updatedGeneral = getUpdatedItems(ggGeneral, newGeneralPageData);
  if (updatedGeneral) {
    set({ ggGeneral: updatedGeneral });
  }
  const p2 = performance.now();
  console.log("updateAllPages", `${(p2 - p1).toFixed(4)} ms`);
}

function getUpdatedItems(previousPages: UISections[][], newPageData: UISections[][]): UISections[][] | null {
  const newPages: UISections[][] = [];
  let foundNewItems = false;
  let index = 0;

  for (const page of newPageData) {
    if (!deepEqual(previousPages[index], page)) {
      newPages.push(page);
      foundNewItems = true;
    } else {
      const emptySection: UISections[] = [];
      newPages.push(emptySection);
    }
    index++;
  }

  if (foundNewItems) {
    const updatedPages = create(previousPages, (draft) => {
      let indexPages = 0;
      for (const page of newPages) {
        if (page.length > 0) {
          draft[indexPages] = page;
        }
        indexPages++;
      }
    });
    return updatedPages;
  }

  return null;
}

function createUIData(get: AccountSliceGetter) {
  const guardians = get().guardians;
  const ggCharacters = get().ggCharacters;
  let maxLostItemsColumns = 0;
  for (const ggCharacter of ggCharacters) {
    if (ggCharacter.ggCharacterType !== GGCharacterType.Vault) {
      const totalLostItems = guardians[ggCharacter.characterId]?.items[SectionBuckets.LostItem]?.inventory.length;
      if (totalLostItems) {
        const totalRows = Math.ceil(totalLostItems / 5);
        if (totalRows > maxLostItemsColumns) {
          maxLostItemsColumns = totalRows;
        }
      }
    }
  }
  get().setLostItemsColumns(maxLostItemsColumns);
}

function buildUIData(get: AccountSliceGetter, itemBuckets: number[]): UISections[][] {
  const characterDataArray: UISections[][] = [];
  const guardians = get().guardians;
  const generalVault = get().generalVault;

  if (!rawProfileData || !guardians || !generalVault) {
    console.error("No profile, guardians or generalVault");
    return characterDataArray;
  }

  for (const character in guardians) {
    const characterData = guardians[character];
    if (characterData) {
      const dataArray: UISections[] = [];
      for (const bucket of itemBuckets) {
        const sectionDetails = getSectionDetails(bucket);

        // create section separators
        const separator: SeparatorSection = {
          id: `${bucket}_separator`,
          type: UISection.Separator,
          label: sectionDetails.label,
        };
        dataArray.push(separator);

        const bucketItems = characterData.items[bucket];

        if (bucket === SectionBuckets.Consumables) {
          const consumables = get().consumables;
          const globalConsumables: VaultFlexSection = {
            id: `${bucket}_global_consumables_section`,
            type: UISection.VaultFlex,
            inventory: [],
          };
          if (consumables) {
            globalConsumables.inventory = returnInventoryArray(consumables, bucket);
          }
          dataArray.push(globalConsumables);
          continue;
        }

        if (bucket === SectionBuckets.Mods) {
          const mods = get().mods;
          const globalMods: VaultFlexSection = {
            id: `${bucket}_global_mods_section`,
            type: UISection.VaultFlex,
            inventory: [],
          };
          if (mods) {
            globalMods.inventory = returnInventoryArray(mods, bucket);
          }
          dataArray.push(globalMods);
          continue;
        }

        if (bucket === SectionBuckets.Engram) {
          const engramsSection: EngramsSection = {
            id: `${bucket}_engrams_section`,
            type: UISection.Engrams,
            inventory: [],
          };
          if (bucketItems) {
            engramsSection.inventory = returnInventoryArray(bucketItems.inventory, bucket);
          }
          dataArray.push(engramsSection);
          continue;
        }

        if (bucket === SectionBuckets.LostItem) {
          const lostItemsSection: LostItemsSection = {
            id: `${bucket}_lost_items_section`,
            type: UISection.LostItems,
            inventory: [],
          };
          if (bucketItems) {
            lostItemsSection.inventory = returnInventoryArray(bucketItems.inventory, bucket);
          }
          dataArray.push(lostItemsSection);
          continue;
        }

        if (bucket === SectionBuckets.Artifact) {
          const artifactSection: ArtifactSection = {
            id: `${bucket}_artifact_section`,
            type: UISection.Artifact,
            equipped: null,
          };
          if (bucketItems?.equipped) {
            artifactSection.equipped = returnDestinyIconData(bucketItems.equipped);
          }
          dataArray.push(artifactSection);
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
          equipSectionCell.inventory = returnInventoryArray(bucketItems.inventory, bucket);

          dataArray.push(equipSectionCell);
        }
      }
      characterDataArray.push(dataArray);
    }
  }
  // Now build the vault data
  const vaultUiData = returnVaultUiData(get, itemBuckets, generalVault);
  characterDataArray.push(vaultUiData);

  return characterDataArray;
}

function returnVaultUiData(
  get: AccountSliceGetter,
  itemBuckets: number[],
  generalVault: Record<number, DestinyItem[]>,
): UISections[] {
  const dataArray: UISections[] = [];

  for (const bucket of itemBuckets) {
    const bucketItems = generalVault[bucket];
    const sectionDetails = getSectionDetails(bucket);
    if (bucketItems) {
      const separator: SeparatorSection = {
        id: `${bucket}_separator`,
        type: UISection.Separator,
        label: sectionDetails.label,
      };
      dataArray.push(separator);

      // get an array of all the items
      const totalItemsArray = returnInventoryArray(bucketItems, bucket);
      if (totalItemsArray.length === 0) {
        const vaultSpacerSize = get().getVaultSpacerSize(bucket);
        const vaultSpacer: VaultSpacerSection = {
          id: `${bucket}_vault_spacer`,
          type: UISection.VaultSpacer,
          size: vaultSpacerSize,
        };
        dataArray.push(vaultSpacer);
        continue;
      }

      let itemsLeft = totalItemsArray.length;
      let count = 0;
      const needsMinimumSpacer = totalItemsArray.length < 20;
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
            minimumSpacerSize: needsMinimumSpacer ? get().getVaultSpacerSize(bucket) : undefined,
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
  const primaryStat = item.primaryStat;
  const borderColor = returnBorderColor(item);
  const masterwork = item.masterwork ?? false;
  const crafted = item.crafted;
  const quantity = item.quantity;
  const stackSizeMaxed = item.quantity === item.maxStackSize;
  const engram = item.itemType === ItemType.Engram;

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
    quantity,
    stackSizeMaxed,
    engram,
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

function returnInventoryArray(dataArray: DestinyItem[], bucketHash: number): DestinyIconData[] {
  const inventoryArray: DestinyIconData[] = [];

  let existingArray = dataArray as DestinyItemSort[];
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

export function removeInventoryItem(get: AccountSliceGetter, set: AccountSliceSetter, destinyItem: DestinyItem) {
  if (destinyItem.previousCharacterId === "") {
    console.error("ERROR: removeFromGuardian expected previousCharacterId to be set");
    return;
  }

  if (destinyItem.previousCharacterId === VAULT_CHARACTER_ID) {
    const previousGeneralVault = get().generalVault;
    const previousInventory = previousGeneralVault[destinyItem.bucketHash];

    if (previousInventory) {
      const updatedInventory = removeLogic(previousInventory, destinyItem);
      const updatedGeneralVault = create(previousGeneralVault, (draft) => {
        draft[destinyItem.bucketHash] = updatedInventory;
      });
      set({ generalVault: updatedGeneralVault });
    }
  } else if (destinyItem.previousCharacterId === GLOBAL_MODS_CHARACTER_ID) {
    const previousMods = get().mods;
    const updatedMods = removeLogic(previousMods, destinyItem);
    set({ mods: updatedMods });
  } else if (destinyItem.previousCharacterId === GLOBAL_CONSUMABLES_CHARACTER_ID) {
    const previousConsumables = get().consumables;
    const updatedConsumables = removeLogic(previousConsumables, destinyItem);
    set({ consumables: updatedConsumables });
  } else {
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
}

export function addInventoryItem(get: AccountSliceGetter, set: AccountSliceSetter, destinyItem: DestinyItem) {
  // Vault or other?
  if (destinyItem.characterId === VAULT_CHARACTER_ID) {
    // TODO: Cope with stackable items
    const previousGeneralVault = get().generalVault;
    const previousSection = previousGeneralVault[destinyItem.bucketHash];

    if (previousSection) {
      const updatedSection = addLogic(previousSection, destinyItem);

      const updatedGeneralVault = create(previousGeneralVault, (draft) => {
        draft[destinyItem.bucketHash] = updatedSection;
      });
      set({ generalVault: updatedGeneralVault });
    }
  } else {
    // Is this a mod, consumable or other?
    switch (destinyItem.bucketHash) {
      case SectionBuckets.Mods: {
        // TODO: This is too simplistic. Mods can be stacked so it should be checked to see if this action adds
        // to an existing stack and/or creates a new stack.
        const previousMods = get().mods;
        const updatedMods = create(previousMods, (draft) => {
          draft.push(destinyItem);
        });
        set({ mods: updatedMods });
        break;
      }
      case SectionBuckets.Consumables: {
        // TODO: This is too simplistic. Consumables can be stacked so it should be checked to see if this action adds
        // to an existing stack and/or creates a new stack.
        const previousConsumables = get().consumables;
        const updatedConsumables = create(previousConsumables, (draft) => {
          draft.push(destinyItem);
        });
        set({ consumables: updatedConsumables });
        break;
      }
      default: {
        const previousGuardians = get().guardians;
        const updatedGuardians = create(previousGuardians, (draft) => {
          draft[destinyItem.characterId]?.items[destinyItem.bucketHash]?.inventory.push(destinyItem);
        });
        set({ guardians: updatedGuardians });
        break;
      }
    }
  }
}

function removeLogic(previousItems: DestinyItem[], itemToRemove: DestinyItem): DestinyItem[] {
  const p1 = performance.now();

  if (itemToRemove.itemInstanceId) {
    const updatedItems = previousItems.filter((item) => item.itemInstanceId !== itemToRemove.itemInstanceId);
    return updatedItems;
  }

  const filteredItems = previousItems.filter((item) => item.itemHash === itemToRemove.itemHash);
  let arrayWithoutItems = previousItems.filter((item) => item.itemHash !== itemToRemove.itemHash);

  const previousTotalQuantity = filteredItems.reduce((total, item) => total + item.quantity, 0);
  const totalToRemove = itemToRemove.quantity;
  const newTotal = previousTotalQuantity - totalToRemove;
  const newItems = rebuildStackableItems(newTotal, itemToRemove);

  if (newItems.length > 0) {
    arrayWithoutItems = arrayWithoutItems.concat(newItems);
  }
  const p2 = performance.now();
  console.log("removeLogic", `${(p2 - p1).toFixed(4)} ms`);
  return arrayWithoutItems;
}

function addLogic(previousItems: DestinyItem[], itemToAdd: DestinyItem): DestinyItem[] {
  const p1 = performance.now();

  if (itemToAdd.itemInstanceId) {
    const updatedItems = create(previousItems, (draft) => {
      draft.push(itemToAdd);
    });
    return updatedItems;
  }

  const filteredItems = previousItems.filter((item) => item.itemHash === itemToAdd.itemHash);
  let arrayWithoutItems = previousItems.filter((item) => item.itemHash !== itemToAdd.itemHash);

  const previousTotalQuantity = filteredItems.reduce((total, item) => total + item.quantity, 0);
  const totalToAdd = itemToAdd.quantity;
  const newTotal = previousTotalQuantity + totalToAdd;

  const newItems = rebuildStackableItems(newTotal, itemToAdd);

  if (newItems.length > 0) {
    arrayWithoutItems = arrayWithoutItems.concat(newItems);
  }
  const p2 = performance.now();
  console.log("addLogic", `${(p2 - p1).toFixed(4)} ms`);

  return arrayWithoutItems;
}

function rebuildStackableItems(total: number, destinyItem: DestinyItem): DestinyItem[] {
  const totalPerStack = destinyItem.maxStackSize;
  let newTotal = total;
  const newItems: DestinyItem[] = [];

  while (newTotal > 0) {
    let itemsToAdd = 0;
    if (newTotal > totalPerStack) {
      itemsToAdd = totalPerStack;
    } else {
      itemsToAdd = newTotal;
    }
    const newItem: DestinyItem = {
      ...destinyItem,
      quantity: itemsToAdd,
    };
    newItems.push(newItem);
    newTotal -= totalPerStack;
  }

  return newItems;
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
    previousEquippedItem.equipped = false;
    updatedInventory.push(previousEquippedItem);
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

export function transformSuccessfulPullFromPostmasterItem(destinyItem: DestinyItem): DestinyItem {
  let characterId: string;
  console.log(
    "transformSuccessfulPullFromPostmasterItem",
    destinyItem.characterId,
    SectionBuckets[destinyItem.recoveryBucketHash],
  );
  switch (destinyItem.recoveryBucketHash) {
    case SectionBuckets.Mods: {
      characterId = GLOBAL_MODS_CHARACTER_ID;
      break;
    }
    case SectionBuckets.Consumables: {
      characterId = GLOBAL_CONSUMABLES_CHARACTER_ID;
      break;
    }
    default: {
      characterId = destinyItem.characterId;
    }
  }
  const bucketHash = destinyItem.recoveryBucketHash;
  const newDestinyItem: DestinyItem = {
    ...destinyItem,
    characterId,
    bucketHash,
  };

  return newDestinyItem;
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
