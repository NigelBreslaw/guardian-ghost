import type { DestinyIconData, DestinyItem, DestinyItemSort } from "@/app/inventory/logic/Types.ts";
import type { AccountSliceGetter, AccountSliceSetter } from "@/app/store/AccountSlice.ts";
import {
  consumables,
  generalVault,
  guardians,
  mods,
  rawProfileData,
  setConsumables,
  setMods,
} from "@/app/store/Definitions.ts";
import {
  GLOBAL_CONSUMABLES_CHARACTER_ID,
  GLOBAL_MODS_CHARACTER_ID,
  VAULT_CHARACTER_ID,
} from "@/app/utilities/Constants.ts";
import { itemHashAndQuantitySort, modSort, typeAndPowerSort } from "@/app/utilities/Helpers.ts";
import { create } from "mutative";
import { deepEqual } from "fast-equals";
import {
  UISection,
  armorPageBuckets,
  generalPageBuckets,
  getSectionDetails,
  weaponBuckets,
  weaponsPageBuckets,
  type ArtifactSection,
  type EngramsSection,
  type EquipSection,
  type LostItemsSection,
  type SeparatorSection,
  type UISections,
  type Vault5x5Section,
  type VaultFlexSection,
  type VaultSpacerSection,
} from "@/app/inventory/logic/Helpers.ts";
import { getDamageTypeIconUri } from "@/app/inventory/logic/Constants.ts";
import { GGCharacterType, ItemType, SectionBuckets } from "@/app/bungie/Enums.ts";

// ------------------------------
// UI data creation
// ------------------------------
const SectionBucketsValues = Object.values(SectionBuckets);
const section_buckets = SectionBucketsValues.filter((v) => !Number.isNaN(v));

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
        const bucketItems = characterData.items[bucket];

        const getInfo = (bucket: SectionBuckets): string | undefined => {
          switch (bucket) {
            case SectionBuckets.Consumables:
              return `${consumables.length}/50`;
            case SectionBuckets.Mods:
              return `${mods.length}/50`;
            case SectionBuckets.LostItem:
              return `${bucketItems?.inventory.length}/21`;
            default:
              return undefined;
          }
        };

        const info: string | undefined = getInfo(bucket);
        // create section separators
        const separator: SeparatorSection = {
          id: `${bucket}_separator`,
          type: UISection.Separator,
          label: sectionDetails.label,
          info,
        };
        dataArray.push(separator);

        if (bucket === SectionBuckets.Consumables) {
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
  const totalVaultItems = calcTotalVaultItems();

  for (const bucket of itemBuckets) {
    const bucketItems = generalVault[bucket];
    const sectionDetails = getSectionDetails(bucket);
    if (bucketItems) {
      const separator: SeparatorSection = {
        id: `${bucket}_separator`,
        type: UISection.Separator,
        label: sectionDetails.label,
        info: `${totalVaultItems}/600`,
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
            minimumSpacerHeight: needsMinimumSpacer ? get().getVaultSpacerSize(bucket) : undefined,
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

function calcTotalVaultItems(): number {
  let total = 0;
  for (const bucket of section_buckets) {
    const section = generalVault[bucket as number];
    if (section) {
      total += section.length;
    }
  }
  return total;
}

function returnDestinyIconData(item: DestinyItem): DestinyIconData {
  const damageTypeIconUri = getDamageTypeIconUri(item.instance.damageType);
  const primaryStat = item.instance.primaryStat;
  const borderColor = returnBorderColor(item);
  const masterwork = item.instance.masterwork ?? false;
  const crafted = item.instance.crafted;
  const quantity = item.quantity;
  const stackSizeMaxed = item.quantity === item.def.maxStackSize;
  const engram = item.def.itemType === ItemType.Engram;

  const iconData: DestinyIconData = {
    itemHash: item.itemHash,
    itemInstanceId: item.itemInstanceId,
    characterId: item.characterId,
    icon: item.instance.icon,
    primaryStat,
    calculatedWaterMark: item.instance.calculatedWaterMark,
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
  if (item.instance.deepSightResonance) {
    return "#FF603E";
  }
  if (item.instance.masterwork) {
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

  if (bucketHash === SectionBuckets.Consumables) {
    existingArray = existingArray.sort(itemHashAndQuantitySort);
  }

  if (bucketHash === SectionBuckets.Mods) {
    existingArray = existingArray.sort(modSort);
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

export function removeInventoryItem(destinyItem: DestinyItem, stackableQuantityToMove: number) {
  if (destinyItem.previousCharacterId === "") {
    console.error("ERROR: removeFromGuardian expected previousCharacterId to be set");
    return;
  }

  if (destinyItem.previousCharacterId === VAULT_CHARACTER_ID) {
    const previousInventory = generalVault[destinyItem.bucketHash];
    if (previousInventory) {
      const updatedInventory = removeLogic(previousInventory, destinyItem, stackableQuantityToMove);
      generalVault[destinyItem.bucketHash] = updatedInventory;
    }
  } else if (destinyItem.previousCharacterId === GLOBAL_MODS_CHARACTER_ID) {
    const updatedMods = removeLogic(mods, destinyItem, stackableQuantityToMove);
    setMods(updatedMods);
  } else if (destinyItem.previousCharacterId === GLOBAL_CONSUMABLES_CHARACTER_ID) {
    const updatedConsumables = removeLogic(consumables, destinyItem, stackableQuantityToMove);
    setConsumables(updatedConsumables);
  } else {
    const previousInventory = guardians[destinyItem.previousCharacterId]?.items[destinyItem.bucketHash]?.inventory;
    const updatedInventory = previousInventory?.filter((item) => item.itemInstanceId !== destinyItem.itemInstanceId);
    if (!updatedInventory) {
      console.error("updatedInventory or previousGuardian is undefined");
      return;
    }

    const updatedGuardian = guardians[destinyItem.previousCharacterId];
    if (!updatedGuardian) {
      console.error("updatedGuardian is undefined");
      return;
    }
    const equippedItem = updatedGuardian.items[destinyItem.bucketHash]?.equipped ?? null;
    updatedGuardian.items[destinyItem.bucketHash] = { equipped: equippedItem, inventory: updatedInventory };
  }
}

export function addInventoryItem(destinyItem: DestinyItem, stackableQuantityToMove: number) {
  // Vault or other?
  if (destinyItem.characterId === VAULT_CHARACTER_ID) {
    const previousSection = generalVault[destinyItem.bucketHash];

    if (previousSection) {
      const updatedSection = addLogic(previousSection, destinyItem, stackableQuantityToMove);
      generalVault[destinyItem.bucketHash] = updatedSection;
    }
  } else {
    // Is this a mod, consumable or other?
    switch (destinyItem.bucketHash) {
      case SectionBuckets.Mods: {
        const updatedMods = addLogic(mods, destinyItem, stackableQuantityToMove);
        setMods(updatedMods);
        break;
      }
      case SectionBuckets.Consumables: {
        const updatedConsumables = addLogic(consumables, destinyItem, stackableQuantityToMove);
        setConsumables(updatedConsumables);
        break;
      }
      default: {
        guardians[destinyItem.characterId]?.items[destinyItem.bucketHash]?.inventory.push(destinyItem);
        break;
      }
    }
  }
}

function removeLogic(
  previousItems: DestinyItem[],
  itemToRemove: DestinyItem,
  stackableQuantityToMove: number,
): DestinyItem[] {
  const p1 = performance.now();

  if (itemToRemove.itemInstanceId) {
    const updatedItems = previousItems.filter((item) => item.itemInstanceId !== itemToRemove.itemInstanceId);
    return updatedItems;
  }

  const filteredItems = previousItems.filter((item) => item.itemHash === itemToRemove.itemHash);
  let arrayWithoutItems = previousItems.filter((item) => item.itemHash !== itemToRemove.itemHash);

  const previousTotalQuantity = filteredItems.reduce((total, item) => total + item.quantity, 0);
  const newTotal = previousTotalQuantity - stackableQuantityToMove;
  const newItems = rebuildStackableItems(newTotal, itemToRemove, "REMOVE");

  if (newItems.length > 0) {
    arrayWithoutItems = arrayWithoutItems.concat(newItems);
  }
  const p2 = performance.now();
  console.log("removeLogic", `${(p2 - p1).toFixed(4)} ms`);
  return arrayWithoutItems;
}

function addLogic(
  previousItems: DestinyItem[],
  itemToAdd: DestinyItem,
  stackableQuantityToMove: number,
): DestinyItem[] {
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
  const newTotal = previousTotalQuantity + stackableQuantityToMove;

  const newItems = rebuildStackableItems(newTotal, itemToAdd, "ADD");

  if (newItems.length > 0) {
    arrayWithoutItems = arrayWithoutItems.concat(newItems);
  }
  const p2 = performance.now();
  console.log("addLogic", `${(p2 - p1).toFixed(4)} ms`);

  return arrayWithoutItems;
}

function rebuildStackableItems(total: number, destinyItem: DestinyItem, mode: "ADD" | "REMOVE"): DestinyItem[] {
  const totalPerStack = destinyItem.def.maxStackSize;
  let newTotal = total;
  const newItems: DestinyItem[] = [];

  const characterId = mode === "ADD" ? destinyItem.characterId : destinyItem.previousCharacterId;

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
      characterId,
    };
    newItems.push(newItem);
    newTotal -= totalPerStack;
  }

  return newItems;
}

export function swapEquipAndInventoryItem(destinyItem: DestinyItem) {
  const previousInventorySection = guardians[destinyItem.characterId]?.items[destinyItem.bucketHash];

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

  const updatedGuardian = guardians[destinyItem.characterId];
  if (!updatedGuardian) {
    console.error("updatedGuardian is undefined");
    return;
  }
  updatedGuardian.items[destinyItem.bucketHash] = { equipped: destinyItem, inventory: updatedInventory };
}

export function transformSuccessfulPullFromPostmasterItem(destinyItem: DestinyItem): DestinyItem {
  let characterId: string;
  console.log(
    "transformSuccessfulPullFromPostmasterItem",
    destinyItem.characterId,
    SectionBuckets[destinyItem.def.recoveryBucketHash],
  );
  switch (destinyItem.def.recoveryBucketHash) {
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
  const bucketHash = destinyItem.def.recoveryBucketHash;
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
