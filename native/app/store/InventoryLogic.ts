import { create } from "mutative";
import { deepEqual } from "fast-equals";

import type { DestinyItem, DestinyItemDefinition, DestinyItemSort, ItemInstance } from "@/app/inventory/logic/Types.ts";
import type { AccountSliceGetter, AccountSliceSetter } from "@/app/store/Account/AccountSlice";
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
  classIcons,
  getItemSubTypeIcon,
  GLOBAL_CONSUMABLES_CHARACTER_ID,
  GLOBAL_MODS_CHARACTER_ID,
  VAULT_CHARACTER_ID,
} from "@/app/utilities/Constants.ts";
import {
  armorPowerSort,
  armorTypeSort,
  itemHashAndQuantitySort,
  modSort,
  weaponPowerSort,
  weaponTypeAndPowerSort,
  weaponTypeSort,
} from "@/app/utilities/Helpers.ts";
import {
  InventoryPageEnums,
  UISection,
  armorBuckets,
  armorPageBuckets,
  generalPageBuckets,
  getSectionDetails,
  vaultItemBuckets,
  weaponBuckets,
  weaponsPageBuckets,
  type GuardianDetailsSection,
  type LootSection,
  type UISections,
  type VaultSpacerSection,
} from "@/app/inventory/logic/Helpers.ts";
import { DestinyClass, GGCharacterType, ItemSubType, SectionBuckets } from "@/app/bungie/Enums.ts";
import type { BucketHash, CharacterId, ItemHash, ItemInstanceId } from "@/app/core/GetProfile.ts";
import { ArmorSort, WeaponsSort } from "@/app/store/Types.ts";

// ------------------------------
// UI data creation
// ------------------------------

export function updateAllPages(get: AccountSliceGetter, set: AccountSliceSetter, onlyPage?: InventoryPageEnums) {
  const p1 = performance.now();
  createUIData(get);
  const totalVaultItems = calcTotalVaultItems();
  const vaultCount = get().ggVaultCount;
  if (totalVaultItems !== vaultCount) {
    set({ ggVaultCount: totalVaultItems });
  }

  const totalLostItems = calcTotalLostItems();
  if (!deepEqual(get().ggLostItemCount, totalLostItems)) {
    set({ ggLostItemCount: totalLostItems });
  }

  if (get().ggModsCount !== mods.length) {
    set({ ggModsCount: mods.length });
  }
  if (get().ggConsumablesCount !== consumables.length) {
    set({ ggConsumablesCount: consumables.length });
  }

  // For each page use a deepEqual compare to see if the data has changed.
  // If it has changed then update just that page.
  if (onlyPage === undefined || onlyPage === InventoryPageEnums.Weapons) {
    const ggWeapons = get().ggWeapons;
    const newWeaponsPageData = buildUIData(get, InventoryPageEnums.Weapons);
    const updatedWeapons = getUpdatedItems(ggWeapons, newWeaponsPageData);
    if (updatedWeapons) {
      set({ ggWeapons: updatedWeapons });
    }
  }

  if (onlyPage === undefined || onlyPage === InventoryPageEnums.Armor) {
    const ggArmor = get().ggArmor;
    const newArmorPageData = buildUIData(get, InventoryPageEnums.Armor);
    const updatedArmor = getUpdatedItems(ggArmor, newArmorPageData);
    if (updatedArmor) {
      set({ ggArmor: updatedArmor });
    }
  }

  if (onlyPage === undefined || onlyPage === InventoryPageEnums.General) {
    const ggGeneral = get().ggGeneral;
    const newGeneralPageData = buildUIData(get, InventoryPageEnums.General);
    const updatedGeneral = getUpdatedItems(ggGeneral, newGeneralPageData);
    if (updatedGeneral) {
      set({ ggGeneral: updatedGeneral });
    }
  }
  const p2 = performance.now();
  console.log("updateAllPages", `${(p2 - p1).toFixed(4)} ms`);
}

function getUpdatedItems(previousPages: UISections[][], newPageData: UISections[][]): UISections[][] | null {
  const newPages: UISections[][] = newPageData.map((page, index) => {
    if (!deepEqual(previousPages[index], page)) {
      return page;
    }
    return [];
  });

  const foundNewItems = newPages.some((page) => page.length > 0);

  if (foundNewItems) {
    const updatedPages = create(previousPages, (draft) => {
      newPages.forEach((page, index) => {
        if (page.length > 0) {
          draft[index] = page;
        }
      });
    });
    return updatedPages;
  }

  return null;
}

function createUIData(get: AccountSliceGetter) {
  const ggCharacters = get().ggCharacters;
  let maxLostItemsRows = 0;
  for (const ggCharacter of ggCharacters) {
    if (ggCharacter.ggCharacterType !== GGCharacterType.Vault) {
      const totalLostItems = guardians.get(ggCharacter.characterId)?.items.get(SectionBuckets.LostItem)
        ?.inventory.length;
      if (totalLostItems) {
        const totalRows = Math.ceil(totalLostItems / 5);
        if (totalRows > maxLostItemsRows) {
          maxLostItemsRows = totalRows;
        }
      }
    }
  }
  get().setLostItemsRows(maxLostItemsRows);
}

function getSectionBuckets(inventoryPage: InventoryPageEnums): SectionBuckets[] {
  switch (inventoryPage) {
    case InventoryPageEnums.Armor:
      return armorPageBuckets;
    case InventoryPageEnums.General:
      return generalPageBuckets;
    case InventoryPageEnums.Weapons:
      return weaponsPageBuckets;
  }
  return [];
}

function buildUIData(get: AccountSliceGetter, inventoryPage: InventoryPageEnums): UISections[][] {
  const characterDataArray: UISections[][] = [];
  const sectionBuckets = getSectionBuckets(inventoryPage);

  if (!rawProfileData || !guardians || !generalVault) {
    console.error("No profile, guardians, or generalVault");
    return characterDataArray;
  }

  for (const [characterId, characterData] of guardians) {
    const dataArray: UISections[] = [];

    dataArray.push(getGuardianDetails(get, characterId));

    for (const bucket of sectionBuckets as BucketHash[]) {
      const bucketItems = characterData.items.get(bucket);
      const equippedItem = bucketItems?.equipped;
      const inventoryItems = bucketItems?.inventory ?? [];

      dataArray.push(getSeparator(bucket, characterId));

      switch (bucket) {
        case SectionBuckets.Consumables:
          if (consumables) {
            sortInventoryArray(get, consumables, bucket);
            dataArray.push(...getLootSections(consumables, "global_consumables_section"));
          }
          break;

        case SectionBuckets.Mods:
          if (mods) {
            dataArray.push(...getLootSections(mods, "global_mods_section"));
          }
          break;

        case SectionBuckets.Engram:
          dataArray.push({
            id: `${bucket}_engrams_section`,
            type: UISection.Engrams,
            inventory: inventoryItems,
          });
          break;

        case SectionBuckets.LostItem:
          dataArray.push({
            id: `${bucket}_lost_items_section`,
            type: UISection.LostItems,
            inventory: inventoryItems,
          });
          break;

        case SectionBuckets.Artifact:
          dataArray.push({
            id: `${bucket}_artifact_section`,
            type: UISection.Artifact,
            equipped: equippedItem,
          });
          break;

        default:
          if (bucketItems) {
            dataArray.push({
              id: `${bucket}_equip_section`,
              type: UISection.CharacterEquipment,
              equipped: equippedItem,
              inventory: sortInventoryArray(get, inventoryItems, bucket),
            });
          }
          break;
      }
    }
    characterDataArray.push(dataArray);
  }

  // Add vault data
  characterDataArray.push(returnVaultUiData(get, inventoryPage, generalVault));

  return characterDataArray;
}

function getGuardianDetails(get: AccountSliceGetter, characterId: CharacterId): UISections {
  return {
    id: "guardian_details",
    type: UISection.GuardianDetails,
    characterIndex: get().getCharacterIndex(characterId),
  };
}

function getSeparator(bucketHash: BucketHash, characterId: CharacterId): UISections {
  const sectionDetails = getSectionDetails(bucketHash);

  return {
    id: `${bucketHash}_separator`,
    type: UISection.Separator,
    label: sectionDetails.label,
    bucketHash,
    characterId,
  };
}

function returnVaultUiData(
  get: AccountSliceGetter,
  inventoryPage: InventoryPageEnums,
  generalVault: Map<number, DestinyItem[]>,
): UISections[] {
  const sectionBuckets = getSectionBuckets(inventoryPage);
  const dataArray: UISections[] = [];

  const guardianDetails: GuardianDetailsSection = {
    id: "guardian_details",
    type: UISection.GuardianDetails,
    characterIndex: get().getCharacterIndex(VAULT_CHARACTER_ID),
  };
  dataArray.push(guardianDetails);

  for (const bucket of sectionBuckets as BucketHash[]) {
    const bucketItems = generalVault.get(bucket);
    if (bucketItems) {
      dataArray.push(getSeparator(bucket, VAULT_CHARACTER_ID));

      // get an array of all the items
      if (bucketItems.length === 0) {
        const vaultSpacerSize = get().getVaultSpacerSize(bucket);
        const vaultSpacer: VaultSpacerSection = {
          id: `${bucket}_vault_spacer`,
          type: UISection.VaultSpacer,
          size: vaultSpacerSize,
        };
        dataArray.push(vaultSpacer);
        continue;
      }

      // sort the items
      let sortedItems = sortInventoryArray(get, bucketItems, bucket);

      if (weaponBuckets.includes(bucket) && get().weaponsSort !== WeaponsSort.Power) {
        sortedItems = insertWeaponSubtypeSeparator(sortedItems);
      }

      if (armorBuckets.includes(bucket)) {
        sortedItems = insertClassTypeSeparator(sortedItems);
      }

      const lootIconSections = getLootSections(sortedItems, bucket.toString());
      dataArray.push(...lootIconSections);
    }
  }

  return dataArray;
}

function returnBlankDestinyItem(): DestinyItem {
  const blankItemDefinition: DestinyItemDefinition = {
    description: "",
    destinyClass: 0,
    doesPostmasterPullHaveSideEffects: false,
    equippable: false,
    flavorText: "false",
    icon: "",
    investmentStats: [],
    isFeatured: false,
    itemSubType: 0,
    itemType: 0,
    itemTypeDisplayName: "",
    maxStackSize: 0,
    name: "",
    nonTransferrable: false,
    plugCategoryIdentifier: "",
    recoveryBucketHash: 0 as BucketHash,
    search: "",
    secondaryIcon: "",
    screenshot: "",
    statGroupHash: 0,
    stats: [],
    tierType: 0,
    traitIds: [],
    watermark: "",
  };

  const blankInstance: ItemInstance = {
    icon: "",
    screenshot: "",
    primaryStat: 0,
    search: "",
  };

  const blankDestinyItem: DestinyItem = {
    bindStatus: 0,
    bucketHash: 0 as BucketHash,
    characterId: "" as CharacterId,
    dismantlePermission: 0,
    equipped: false,
    isWrapper: false,
    itemHash: 0 as ItemHash,
    previousCharacterId: "" as CharacterId,
    quantity: 0,
    state: 0,
    location: 0,
    lockable: false,
    transferStatus: 0,
    def: blankItemDefinition,
    instance: blankInstance,
  };

  return blankDestinyItem;
}

function insertWeaponSubtypeSeparator(items: DestinyItem[]): DestinyItem[] {
  let currentSubType = ItemSubType.None;
  const updatedItemsArray: DestinyItem[] = [];

  for (const item of items) {
    if (item.def.itemSubType !== currentSubType) {
      currentSubType = item.def.itemSubType;
      const blankItem = returnBlankDestinyItem();
      blankItem.def.itemSubType = currentSubType;
      blankItem.separatorIcon = getItemSubTypeIcon(item);
      updatedItemsArray.push(blankItem);
    }
    updatedItemsArray.push(item);
  }
  return updatedItemsArray;
}

function insertClassTypeSeparator(items: DestinyItem[]): DestinyItem[] {
  let currentDestinyClass = DestinyClass.Unknown;
  const updatedItemsArray: DestinyItem[] = [];

  for (const item of items) {
    if (item.def.destinyClass !== currentDestinyClass) {
      currentDestinyClass = item.def.destinyClass;
      const blankItem = returnBlankDestinyItem();
      blankItem.def.destinyClass = currentDestinyClass;
      blankItem.separatorIcon = classIcons[currentDestinyClass];
      updatedItemsArray.push(blankItem);
    }
    updatedItemsArray.push(item);
  }

  return updatedItemsArray;
}

function getLootSections(items: DestinyItem[], id: string): LootSection[] {
  const itemsPerSection = 5;

  const LootSections: LootSection[] = Array.from(
    { length: Math.ceil(items.length / itemsPerSection) },
    (_, sectionId) => {
      const startIndex = sectionId * itemsPerSection;
      const inventory = items.slice(startIndex, startIndex + itemsPerSection);
      return {
        id: `${id}_${sectionId}`,
        type: UISection.LootRow,
        inventory,
      };
    },
  );

  return LootSections;
}

export function calcTotalVaultItems(): number {
  let total = 0;
  for (const bucket of vaultItemBuckets) {
    const section = generalVault.get(bucket);
    if (section) {
      total += section.length;
    }
  }
  return total;
}

export function calcTotalLostItems(): number[] {
  const totals: number[] = [];
  for (const [_characterId, characterData] of guardians) {
    const lostItems = characterData.items.get(SectionBuckets.LostItem);
    totals.push(lostItems?.inventory.length ?? 0);
  }
  return totals;
}

export function returnBorderColor(item: DestinyItem): string {
  if (item.instance.deepSightResonance) {
    return "#FF603E";
  }
  if (item.instance.masterwork) {
    return "#CEAE32";
  }
  return "#555555";
}

function sortInventoryArray(get: AccountSliceGetter, dataArray: DestinyItem[], bucketHash: BucketHash): DestinyItem[] {
  let existingArray = dataArray.slice(0) as DestinyItemSort[];
  if (weaponBuckets.includes(bucketHash)) {
    const weaponsSort = get().weaponsSort;
    switch (weaponsSort) {
      case WeaponsSort.TypeAndPower: {
        existingArray = existingArray.sort(weaponTypeAndPowerSort);
        break;
      }
      case WeaponsSort.Power: {
        existingArray = existingArray.sort(weaponPowerSort);
        break;
      }
      case WeaponsSort.Type: {
        existingArray = existingArray.sort(weaponTypeSort);
        break;
      }
      default: {
        console.error("Unknown weaponsSort", weaponsSort);
        break;
      }
    }
  }

  if (armorBuckets.includes(bucketHash)) {
    const armorSort = get().armorSort;
    if (armorSort === ArmorSort.Power) {
      existingArray = existingArray.sort(armorPowerSort);
    } else if (armorSort === ArmorSort.Type) {
      existingArray = existingArray.sort(armorTypeSort);
    }
  }

  if (bucketHash === SectionBuckets.Consumables) {
    existingArray = existingArray.sort(itemHashAndQuantitySort);
  }

  if (bucketHash === SectionBuckets.Mods) {
    existingArray = existingArray.sort(modSort);
  }

  return existingArray;
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
    const previousInventory = generalVault.get(destinyItem.bucketHash);
    if (previousInventory) {
      const updatedInventory = removeLogic(previousInventory, destinyItem, stackableQuantityToMove);
      generalVault.set(destinyItem.bucketHash, updatedInventory);
    }
  } else if (destinyItem.previousCharacterId === GLOBAL_MODS_CHARACTER_ID) {
    const updatedMods = removeLogic(mods, destinyItem, stackableQuantityToMove);
    setMods(updatedMods);
  } else if (destinyItem.previousCharacterId === GLOBAL_CONSUMABLES_CHARACTER_ID) {
    const updatedConsumables = removeLogic(consumables, destinyItem, stackableQuantityToMove);
    setConsumables(updatedConsumables);
  } else {
    const previousInventory = guardians
      .get(destinyItem.previousCharacterId)
      ?.items.get(destinyItem.bucketHash)?.inventory;
    const updatedInventory = previousInventory?.filter((item) => item.itemInstanceId !== destinyItem.itemInstanceId);
    if (!updatedInventory) {
      console.error("updatedInventory or previousGuardian is undefined");
      return;
    }

    const updatedGuardian = guardians.get(destinyItem.previousCharacterId);
    if (!updatedGuardian) {
      console.error("updatedGuardian is undefined");
      return;
    }
    const equippedItem = updatedGuardian.items.get(destinyItem.bucketHash)?.equipped ?? undefined;
    updatedGuardian.items.set(destinyItem.bucketHash, { equipped: equippedItem, inventory: updatedInventory });
  }
}

export function addInventoryItem(destinyItem: DestinyItem, stackableQuantityToMove: number) {
  // Vault or other?
  if (destinyItem.characterId === VAULT_CHARACTER_ID) {
    const previousSection = generalVault.get(destinyItem.bucketHash);

    if (previousSection) {
      const updatedSection = addLogic(previousSection, destinyItem, stackableQuantityToMove);
      generalVault.set(destinyItem.bucketHash, updatedSection);
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
        const currentInventory = guardians
          .get(destinyItem.characterId)
          ?.items.get(destinyItem.bucketHash)
          ?.inventory.slice(0);
        if (currentInventory) {
          currentInventory.push(destinyItem);
          const section = guardians.get(destinyItem.characterId)?.items.get(destinyItem.bucketHash);
          if (section) {
            section.inventory = currentInventory;
          }
        }
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
  const previousInventorySection = guardians.get(destinyItem.characterId)?.items.get(destinyItem.bucketHash);

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

  const updatedGuardian = guardians.get(destinyItem.characterId);
  if (!updatedGuardian) {
    console.error("updatedGuardian is undefined");
    return;
  }
  updatedGuardian.items.set(destinyItem.bucketHash, { equipped: destinyItem, inventory: updatedInventory });
}

export function transformSuccessfulPullFromPostmasterItem(destinyItem: DestinyItem): DestinyItem {
  let characterId: CharacterId;
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
  const bucketHash = destinyItem.def.recoveryBucketHash as BucketHash;
  const newDestinyItem: DestinyItem = {
    ...destinyItem,
    characterId,
    bucketHash,
  };

  return newDestinyItem;
}

const deepSightItemHash: number[] = [101423981, 213377779, 1948344346, 2373253941, 2400712188, 3394691176, 3632593563];

export function hasSocketedResonance(itemInstanceId: ItemInstanceId): boolean {
  const liveSocketJson = rawProfileData?.Response.itemComponents?.sockets.data[itemInstanceId];
  if (!liveSocketJson) {
    return false;
  }
  const ph = liveSocketJson.sockets[12]?.plugHash;
  if (!ph) {
    return false;
  }

  return deepSightItemHash.includes(ph);
}
