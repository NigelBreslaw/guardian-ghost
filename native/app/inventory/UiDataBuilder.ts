import type { CharacterGear, DestinyItem } from "@/app/bungie/Types.ts";
import DataService from "@/app/core/DataService.ts";
import type { SingleItemDefinition } from "@/app/core/Types.ts";
import {
  weaponsPageBuckets,
  type UiRow,
  type HeaderRow,
  UiRowType,
  type DestinyIconData,
  type CharacterInventoryRow,
  type VaultInventoryRow,
  getDamagetypeIconUri,
} from "@/app/inventory/Common.ts";

export function buildUIData(): Array<Array<UiRow>> {
  const p1 = performance.now();
  const characterDataArray: Array<Array<UiRow>> = [];

  for (const character in DataService.charactersAndVault.characters) {
    const characterData = DataService.charactersAndVault.characters[character];
    if (characterData) {
      const dataArray: Array<UiRow> = [];

      for (const bucket of weaponsPageBuckets) {
        const header: HeaderRow = {
          id: `${bucket}_header`,
          type: UiRowType.Header,
        };
        dataArray.push(header);
        const bucketItems = characterData.items[bucket];
        if (bucketItems) {
          const equipped = bucketItems.equipped;
          let equipItem: DestinyIconData | null = null;
          if (equipped) {
            equipItem = returnDestinyIconData(equipped);
          }
          const inventoryRowData0 = returnInventoryRow(bucketItems, 0);
          const equippedRow = {
            id: `${bucket}_equipped`,
            equipped: equipItem,
            inventory: inventoryRowData0,
            type: UiRowType.CharacterEquipped,
          };
          dataArray.push(equippedRow);

          const inventoryRow1Data = returnInventoryRow(bucketItems, 1);
          const inventoryRow1: CharacterInventoryRow = {
            id: `${bucket}_row1`,
            inventory: inventoryRow1Data,
            type: UiRowType.CharacterInventory,
          };
          dataArray.push(inventoryRow1);

          const inventoryRow2Data = returnInventoryRow(bucketItems, 2);
          const inventoryRow2: CharacterInventoryRow = {
            id: `${bucket}_row2`,
            inventory: inventoryRow2Data,
            type: UiRowType.CharacterInventory,
          };
          dataArray.push(inventoryRow2);
        }
      }
      characterDataArray.push(dataArray);
    }
  }
  // Now build the vault data
  const vaultData = returnVaultData();
  characterDataArray.push(vaultData);

  const p2 = performance.now();
  console.log("buildUIData took:", (p2 - p1).toFixed(4), "ms");
  return characterDataArray;
}

function returnVaultData(): Array<UiRow> {
  const vaultData = DataService.charactersAndVault.vault;
  const dataArray: Array<UiRow> = [];

  for (const bucket of weaponsPageBuckets) {
    const header: HeaderRow = {
      id: `${bucket}_header`,
      type: UiRowType.Header,
    };
    dataArray.push(header);

    const bucketItems = vaultData.items[138197802].items[bucket];
    if (bucketItems) {
      const totalRows = Math.ceil(bucketItems.inventory.length / 5);

      for (let i = 0; i < totalRows; i++) {
        const rowData = returnInventoryRow(bucketItems, i, 5);
        const vaultRow: VaultInventoryRow = {
          id: `${bucket}_row_${i}`,
          inventory: rowData,
          type: UiRowType.VaultInventory,
        };
        dataArray.push(vaultRow);
      }
    }
  }

  return dataArray;
}

function returnDestinyIconData(item: DestinyItem): DestinyIconData {
  const definition = DataService.itemDefinition.items[item.itemHash] as SingleItemDefinition;
  const itemInstanceId = item?.itemInstanceId || "";

  const itemComponent = DataService.profileData.Response.itemComponents.instances.data[itemInstanceId];
  if (!itemComponent) {
    throw new Error("No itemComponent found for item");
  }
  // if it has a version number get the watermark from the array. If it does not then see if the definition has an 'iconWatermark'
  const versionNumber = item.versionNumber;
  let watermark: string | undefined = undefined;
  if (versionNumber) {
    const dvwi = definition.dvwi;
    if (dvwi) {
      const index = dvwi[versionNumber];
      if (index) {
        watermark = DataService.IconWaterMarks[index];
      }
    }
  } else {
    const iconWatermark = definition.iw;
    if (iconWatermark) {
      watermark = DataService.IconWaterMarks[iconWatermark];
    }
  }

  if (watermark) {
    watermark = `https://www.bungie.net/common/destiny2_content/icons/${watermark}`;
  }

  const iconData: DestinyIconData = {
    itemHash: item.itemHash,
    itemInstanceId: item.itemInstanceId,
    icon: `https://www.bungie.net/common/destiny2_content/icons/${definition.i}`,
    primaryStat: itemComponent.primaryStat?.value || 0,
    calculatedWaterMark: watermark,
    damageTypeIconUri: getDamagetypeIconUri(itemComponent.damageType),
  };
  return iconData;
}

function returnInventoryRow(characterGear: CharacterGear, column: number, rowWidth = 3): Array<DestinyIconData> {
  const rowData: Array<DestinyIconData> = [];

  const startIndex = column * rowWidth;
  const endIndex = startIndex + rowWidth;

  for (let i = startIndex; i < endIndex; i++) {
    const item = characterGear.inventory[i];
    if (item) {
      const iconData = returnDestinyIconData(item);
      rowData.push(iconData);
    } else {
      const frame: DestinyIconData = {
        itemHash: -1,
        icon: "",
        calculatedWaterMark: "",
        primaryStat: 0,
        damageTypeIconUri: null,
      };
      rowData.push(frame);
    }
  }

  return rowData;
}
