import type { CharacterGear, DestinyItem } from "@/app/bungie/Types.ts";
import DataService from "@/app/core/DataService.ts";
import type { SingleItemDefinition } from "@/app/core/Types.ts";
import {
  type BlankCell,
  type DestinyCell,
  type DestinyIconData,
  type EmptyCell,
  type SeparatorCell,
  type UiCell,
  UiCellType,
  getDamagetypeIconUri,
} from "@/app/inventory/Common.ts";

export function buildUIData(itemBuckets: Array<number>): Array<Array<UiCell>> {
  const p1 = performance.now();
  const characterDataArray: Array<Array<UiCell>> = [];
  const columns = 4;

  for (const character in DataService.charactersAndVault.characters) {
    const characterData = DataService.charactersAndVault.characters[character];
    if (characterData) {
      const dataArray: Array<UiCell> = [];

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
            equipItem = returnDestinyIconData(equipped);
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

          const inventoryRowData0 = returnInventoryRow(bucketItems, 0);

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

          const inventoryRowData1 = returnInventoryRow(bucketItems, 1);

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

          const inventoryRowData2 = returnInventoryRow(bucketItems, 2);

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
        }
      }
      characterDataArray.push(dataArray);
    }
  }
  // Now build the vault data
  const vaultData = returnVaultData(itemBuckets);
  characterDataArray.push(vaultData);

  const p2 = performance.now();
  console.log("buildUIData took:", (p2 - p1).toFixed(4), "ms");
  return characterDataArray;
}

function returnVaultData(itemBuckets: Array<number>): Array<UiCell> {
  const vaultData = DataService.charactersAndVault.vault;
  const dataArray: Array<UiCell> = [];
  const columns = 4;

  for (const bucket of itemBuckets) {
    for (let i = 0; i < columns; i++) {
      const separator: SeparatorCell = {
        id: `${bucket}_separator_${i}`,
        type: UiCellType.Separator,
      };
      dataArray.push(separator);
    }

    const bucketItems = vaultData.items[138197802].items[bucket];
    if (bucketItems) {
      const totalRows = Math.ceil(bucketItems.inventory.length / 5);

      for (let i = 0; i < totalRows; i++) {
        const rowData = returnInventoryRow(bucketItems, i, 5);
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

function returnDestinyIconData(item: DestinyItem): DestinyIconData {
  const definition = DataService.itemDefinition.items[item.itemHash] as SingleItemDefinition;
  const itemInstanceId = item?.itemInstanceId;

  if (itemInstanceId) {
    const itemComponent = DataService.profileData.Response.itemComponents.instances.data[itemInstanceId];
    if (itemComponent) {
      // if it has a version number get the watermark from the array. If it does not then see if the definition has an 'iconWatermark'
      const versionNumber = item.versionNumber;

      let watermark: string | undefined = undefined;
      if (versionNumber !== undefined) {
        const dvwi = definition.dvwi;

        if (dvwi) {
          const index = dvwi[versionNumber];
          if (index !== undefined) {
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
        primaryStat: itemComponent.primaryStat?.value.toString() || "",
        calculatedWaterMark: watermark,
        damageTypeIconUri: getDamagetypeIconUri(itemComponent.damageType),
      };
      return iconData;
    }

    console.error("No itemComponent found for item", item);
  }

  const emptyData: DestinyIconData = {
    itemHash: item.itemHash,
    itemInstanceId: item.itemInstanceId,
    icon: "",
    primaryStat: "",
    calculatedWaterMark: "",
    damageTypeIconUri: 0,
  };

  console.error("returnDestinyIconData() error", item);
  return emptyData;
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
    }
  }

  return rowData;
}
