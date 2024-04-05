import type { DestinyItem, GuardianGear, ProfileData, VaultData } from "@/app/bungie/Types.ts";
import {
  UiCellType,
  armorPageBuckets,
  generalPageBuckets,
  getDamageTypeIconUri,
  weaponsPageBuckets,
  type BlankCell,
  type DestinyCell,
  type DestinyIconData,
  type EmptyCell,
  type SeparatorCell,
  type UiCell,
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
  console.log("built UI date for all pages", `${(p2 - p1).toFixed(4)} ms`);
  set({ weaponsPageData, armorPageData, generalPageData });
}

export function buildUIData(get: AccountSliceGetter, itemBuckets: number[]): UiCell[][] {
  const characterDataArray: UiCell[][] = [];
  const columns = 4;
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
        for (let i = 0; i < columns; i++) {
          const separator: SeparatorCell = {
            id: `${bucket}_separator_${i}`,
            type: UiCellType.Separator,
          };
          dataArray.push(separator);
        }

        const bucketItems = characterData.items[bucket];
        if (bucketItems) {
          const equipped = bucketItems.equipped;
          let equipItem: DestinyIconData | null = null;

          if (equipped) {
            equipItem = returnDestinyIconData(profile, equipped);
            const equippedCell: DestinyCell = {
              ...equipItem,
              id: `${bucket}_equipped`,
              type: UiCellType.DestinyCell,
            };
            dataArray.push(equippedCell);
          } else {
            const emptyCell: EmptyCell = {
              id: `${bucket}_equipped`,
              type: UiCellType.EmptyCell,
            };
            dataArray.push(emptyCell);
          }

          // If artifact (1506418338) don't add any more items.
          if (bucket === 1506418338) {
            continue;
          }

          const inventoryRowData0 = returnInventoryRow(profile, bucketItems, 0);

          for (let i = 0; i < columns - 1; i++) {
            const item = inventoryRowData0[i];
            if (item) {
              const destinyCell: DestinyCell = {
                ...item,
                id: `${bucket}_row0_${i}`,
                type: UiCellType.DestinyCell,
              };
              dataArray.push(destinyCell);
            } else {
              const emptyCell: EmptyCell = {
                id: `${bucket}_row0_${i}`,
                type: UiCellType.EmptyCell,
              };
              dataArray.push(emptyCell);
            }
          }

          const inventoryRowData1 = returnInventoryRow(profile, bucketItems, 1);

          const blankCell1: BlankCell = {
            id: `${bucket}_row1_blank`,
            type: UiCellType.BlankCell,
          };
          dataArray.push(blankCell1);

          for (let i = 0; i < columns - 1; i++) {
            const item = inventoryRowData1[i];
            if (item) {
              const destinyCell: DestinyCell = {
                ...item,
                id: `${bucket}_row1_${i}`,
                type: UiCellType.DestinyCell,
              };
              dataArray.push(destinyCell);
            } else {
              const emptyCell: EmptyCell = {
                id: `${bucket}_row1_${i}`,
                type: UiCellType.EmptyCell,
              };
              dataArray.push(emptyCell);
            }
          }

          const inventoryRowData2 = returnInventoryRow(profile, bucketItems, 2);

          const blankCell2: BlankCell = {
            id: `${bucket}_row2_blank`,
            type: UiCellType.BlankCell,
          };
          dataArray.push(blankCell2);

          for (let i = 0; i < columns - 1; i++) {
            const item = inventoryRowData2[i];
            if (item) {
              const destinyCell: DestinyCell = {
                ...item,
                id: `${bucket}_row2_${i}`,
                type: UiCellType.DestinyCell,
              };
              dataArray.push(destinyCell);
            } else {
              const emptyCell: EmptyCell = {
                id: `${bucket}_row2_${i}`,
                type: UiCellType.EmptyCell,
              };
              dataArray.push(emptyCell);
            }
          }
        } else {
          const emptyCell: EmptyCell = {
            id: `${bucket}_equipped`,
            type: UiCellType.EmptyCell,
          };
          dataArray.push(emptyCell);
          for (let i = 0; i < columns - 1; i++) {
            const emptyCell: EmptyCell = {
              id: `${bucket}_row1_${i}`,
              type: UiCellType.EmptyCell,
            };
            dataArray.push(emptyCell);
          }

          // Create tow more rows of empty cells
          for (let r = 0; r < 2; r++) {
            const blankCell1: BlankCell = {
              id: `${bucket}_row${r + 1}_blank`,
              type: UiCellType.BlankCell,
            };
            dataArray.push(blankCell1);
            for (let i = 0; i < columns - 1; i++) {
              const emptyCell: EmptyCell = {
                id: `${bucket}_row${r + 1}_${i}`,
                type: UiCellType.EmptyCell,
              };
              dataArray.push(emptyCell);
            }
          }
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

function returnInventoryRow(
  profile: ProfileData,
  characterGear: GuardianGear,
  column: number,
  rowWidth = 3,
): DestinyIconData[] {
  const rowData: DestinyIconData[] = [];

  const startIndex = column * rowWidth;
  const endIndex = startIndex + rowWidth;

  for (let i = startIndex; i < endIndex; i++) {
    const item = characterGear.inventory[i];
    if (item) {
      const iconData = returnDestinyIconData(profile, item);
      rowData.push(iconData);
    }
  }

  return rowData;
}

function returnVaultUiData(profile: ProfileData, itemBuckets: number[], vaultData: VaultData): UiCell[] {
  const dataArray: UiCell[] = [];
  const columns = 5;

  for (const bucket of itemBuckets) {
    const bucketItems = vaultData.items[bucket];
    if (bucketItems) {
      for (let i = 0; i < columns; i++) {
        const separator: SeparatorCell = {
          id: `${bucket}_separator_${i}`,
          type: UiCellType.Separator,
        };
        dataArray.push(separator);
      }

      const totalRows = Math.ceil(bucketItems.inventory.length / columns);

      for (let i = 0; i < totalRows; i++) {
        const rowData = returnInventoryRow(profile, bucketItems, i, columns);
        for (let j = 0; j < columns; j++) {
          const item = rowData[j];
          if (item) {
            const destinyCell: DestinyCell = {
              ...item,
              id: `${bucket}_row1_${i}_${j}`,
              type: UiCellType.DestinyCell,
            };
            dataArray.push(destinyCell);
          } else {
            const emptyCell: EmptyCell = {
              id: `${bucket}_row1_${i}_${j}`,
              type: UiCellType.EmptyCell,
            };
            dataArray.push(emptyCell);
          }
        }
      }
    }
  }

  return dataArray;
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
