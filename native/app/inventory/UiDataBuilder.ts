import type { CharacterGear, DestinyItem } from "@/app/bungie/Types.ts";
import DataService from "@/app/core/DataService.ts";
import {
  weaponsPageBuckets,
  type UiRow,
  type HeaderRow,
  UiRowType,
  type DestinyIconData,
  type CharacterInventoryRow,
} from "@/app/inventory/Common";

export function buildUIData(): Array<Array<UiRow>> {
  const p1 = performance.now();
  const characterDataArray: Array<Array<UiRow>> = [];

  for (const character in DataService.charactersAndVault.characters) {
    const characterData = DataService.charactersAndVault.characters[character];
    const dataArray: Array<UiRow> = [];

    for (const bucket of weaponsPageBuckets) {
      const header: HeaderRow = {
        id: `${bucket}_header`,
        type: UiRowType.Header,
      };
      dataArray.push(header);
      const bucketItems = characterData.items[bucket];

      const equipItem = returnEquippedData(bucketItems);
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
    characterDataArray.push(dataArray);
  }
  const p2 = performance.now();
  console.log("buildUIData took:", (p2 - p1).toFixed(4), "ms");
  return characterDataArray;
}

function returnEquippedData(characterGear: CharacterGear): DestinyIconData | null {
  const equipped = characterGear.equipped;
  if (equipped) {
    return returnDestinyIconData(equipped);
  }
  return null;
}

function returnDestinyIconData(item: DestinyItem): DestinyIconData {
  const definition = DataService.itemDefinition.items[item.itemHash];
  const itemComponent = DataService.profileData.Response.itemComponents.instances.data[item.itemInstanceId];

  const iconData: DestinyIconData = {
    itemHash: item.itemHash,
    itemInstanceId: item.itemInstanceId,
    icon: definition.i,
    primaryStat: itemComponent.primaryStat?.value || 0,
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
      };
      rowData.push(frame);
    }
  }

  return rowData;
}
