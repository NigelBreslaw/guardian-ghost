import type { DestinyItem, GuardianGear, ProfileData, VaultData } from "@/app/bungie/Types.ts";
import {
  UiCellType,
  armorPageBuckets,
  generalPageBuckets,
  getDamageTypeIconUri,
  weaponsPageBuckets,
  // type BlankCell,
  // type DestinyCell,
  type DestinyIconData,
  // type EmptyCell,
  type EquipSectionCell,
  type SeparatorRow,
  type UiCell,
  type Vault5x5Cell,
  type VaultFlexCell,
} from "@/app/inventory/Common.ts";
import type { AccountSliceGetter, AccountSliceSetter } from "@/app/store/AccountSlice.ts";
import { iconWaterMarks, itemsDefinition } from "@/app/store/Definitions.ts";
import { bitmaskContains } from "@/app/utilities/Helpers.ts";
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

export function buildUIData(get: AccountSliceGetter, itemBuckets: number[]): UiCell[][] {
  const characterDataArray: UiCell[][] = [];
  const guardians = get().guardians;
  const vaultData = get().generalVault;
  const profile = get().rawProfileData;

  if (!profile || !guardians || !vaultData) {
    console.error("No profile, guardians or generalVault");
    return characterDataArray;
  }

  for (const character in guardians) {
    const characterData = guardians[character];
    if (characterData) {
      const dataArray: UiCell[] = [];

      for (const bucket of itemBuckets) {
        // create section separators
        const separator: SeparatorRow = {
          id: `${bucket}_separator`,
          type: UiCellType.Separator,
        };
        dataArray.push(separator);

        const bucketItems = characterData.items[bucket];

        // TODO: If artifact (1506418338) create an artifact section
        if (bucket === 1506418338) {
          continue;
        }

        if (bucketItems) {
          const equipSectionCell: EquipSectionCell = {
            id: `${bucket}_equip_section`,
            type: UiCellType.EquipSectionCell,
            equipped: null,
            inventory: [],
          };
          const equipped = bucketItems.equipped;

          if (equipped) {
            equipSectionCell.equipped = returnDestinyIconData(profile, equipped);
          }
          equipSectionCell.inventory = returnInventoryArray(profile, bucketItems);

          dataArray.push(equipSectionCell);
        }
      }
      characterDataArray.push(dataArray);
    }
  }
  // Now build the vault data
  const vaultUiData = returnVaultUiData(profile, itemBuckets, vaultData);
  characterDataArray.push(vaultUiData);

  return characterDataArray;
}

function returnVaultUiData(profile: ProfileData, itemBuckets: number[], vaultData: VaultData): UiCell[] {
  const dataArray: UiCell[] = [];

  for (const bucket of itemBuckets) {
    const bucketItems = vaultData.items[bucket];
    if (bucketItems) {
      const separator: SeparatorRow = {
        id: `${bucket}_separator`,
        type: UiCellType.Separator,
      };
      dataArray.push(separator);

      // get an array of all the items
      const totalItemsArray = returnInventoryArray(profile, bucketItems);

      let itemsLeft = totalItemsArray.length;
      let count = 0;
      while (itemsLeft > 0) {
        // is there 21 or more items left?
        if (itemsLeft > 20) {
          const vault5x5Cell: Vault5x5Cell = {
            id: `${bucket}_5x5_section${count}`,
            type: UiCellType.Vault5x5Cell,
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
          const vaultFlexCell: VaultFlexCell = {
            id: `${bucket}_flex_section`,
            type: UiCellType.VaultFlexCell,
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
  console.log("dataArray.length", dataArray.length);
  return dataArray;
}

function returnDestinyIconData(profile: ProfileData, item: DestinyItem): DestinyIconData {
  const definition = itemsDefinition[item.itemHash];
  const itemInstanceId = item?.itemInstanceId;

  if (itemInstanceId) {
    const itemComponent = profile.Response.itemComponents.instances.data[itemInstanceId];
    if (itemComponent && definition) {
      // if it has a version number get the watermark from the array. If it does not then see if the definition has an 'iconWatermark'
      const versionNumber = item.versionNumber;

      let watermark: string | undefined = undefined;
      if (versionNumber !== undefined) {
        const dvwi = definition.dvwi;

        if (dvwi) {
          const index = dvwi[versionNumber];
          if (index !== undefined) {
            watermark = iconWaterMarks[index];
          }
        }
      } else {
        const iconWatermark = definition.iw;
        if (iconWatermark) {
          watermark = iconWaterMarks[iconWatermark];
        }
      }

      if (watermark) {
        watermark = `https://www.bungie.net/common/destiny2_content/icons/${watermark}`;
      }
      const masterwork = bitmaskContains(item.state, 4);
      const crafted = bitmaskContains(item.state, 8);
      const damageTypeIconUri = getDamageTypeIconUri(itemComponent.damageType);
      const icon = `https://www.bungie.net/common/destiny2_content/icons/${definition.i}`;
      const primaryStat = itemComponent.primaryStat?.value.toString() || "";

      const iconData: DestinyIconData = {
        itemHash: item.itemHash,
        itemInstanceId,
        characterId: item.characterId,
        icon,
        primaryStat,
        calculatedWaterMark: watermark,
        damageTypeIconUri,
        masterwork,
        crafted,
      };
      return iconData;
    }

    console.error("No itemComponent found for item", item);
  }

  if (definition) {
    const nonInstancedItem: DestinyIconData = {
      itemHash: item.itemHash,
      itemInstanceId: undefined,
      characterId: item.characterId,
      icon: `https://www.bungie.net/common/destiny2_content/icons/${definition.i}`,
      primaryStat: "",
      calculatedWaterMark: "",
      damageTypeIconUri: null,
      masterwork: false,
      crafted: false,
    };

    return nonInstancedItem;
  }

  const emptyData: DestinyIconData = {
    itemHash: item.itemHash,
    itemInstanceId: undefined,
    characterId: "",
    icon: "",
    primaryStat: "",
    calculatedWaterMark: "",
    damageTypeIconUri: null,
    masterwork: false,
    crafted: false,
  };

  console.error("returnDestinyIconData() error", item);
  return emptyData;
}

function returnInventoryArray(profile: ProfileData, characterGear: GuardianGear): DestinyIconData[] {
  const inventoryArray: DestinyIconData[] = [];

  for (const item of characterGear.inventory) {
    const iconData = returnDestinyIconData(profile, item);
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

export function hasSocketedResonance(get: AccountSliceGetter, destinyItem: DestinyItem): boolean {
  const itemInstanceId = destinyItem.itemInstanceId;
  if (!itemInstanceId) {
    return false;
  }
  const liveSocketJson = get().rawProfileData?.Response.itemComponents.sockets.data[itemInstanceId];
  if (!liveSocketJson) {
    return false;
  }
  const ph = liveSocketJson.sockets[12]?.plugHash;
  if (!ph) {
    return false;
  }

  return deepSightItemHash.includes(ph);
}
