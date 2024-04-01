import { characterBuckets } from "@/app/bungie/Hashes.ts";
import type {
  DestinyItem,
  DestinyItemBase,
  GGCharacterUiData,
  Guardian,
  GuardianGear,
  ProfileData,
  SectionItems,
  VaultData,
} from "@/app/bungie/Types.ts";
import {
  type BlankCell,
  type DestinyCell,
  type DestinyIconData,
  type EmptyCell,
  type SeparatorCell,
  type UiCell,
  UiCellType,
  armorPageBuckets,
  generalPageBuckets,
  getDamageTypeIconUri,
  weaponsPageBuckets,
} from "@/app/inventory/Common.ts";
import { getCharactersAndVault } from "@/app/store/AccountLogic.ts";
import type { AuthenticationSlice } from "@/app/store/AuthenticationSlice.ts";
import { bucketTypeHashArray, iconWaterMarks, itemsDefinition } from "@/app/store/Definitions.ts";
import type { DefinitionsSlice } from "@/app/store/DefinitionsSlice.ts";
import type { StateCreator } from "zustand";
export interface AccountSlice {
  refreshing: boolean;
  currentListIndex: number;

  // The characters live in an object. This array does duplicate some of this data, but it's order
  // dictates
  ggCharacters: GGCharacterUiData[];

  armorPageData: UiCell[][];
  generalPageData: UiCell[][];
  weaponsPageData: UiCell[][];

  responseMintedTimestamp: Date;
  secondaryComponentsMintedTimestamp: Date;
  rawProfileData: ProfileData | null;
  guardians: Record<string, Guardian>;
  vault: VaultData;

  setRefreshing: (refreshing: boolean) => void;
  setCurrentListIndex: (payload: number) => void;

  setAllInventoryPageData: (weaponPage: UiCell[][], armorPage: UiCell[][], generalPage: UiCell[][]) => void;

  updateProfile: (profile: ProfileData) => void;

  setTimestamps: (responseMintedTimestamp: string, secondaryComponentsMintedTimestamp: string) => void;
}

export const createAccountSlice: StateCreator<
  AccountSlice & AuthenticationSlice & DefinitionsSlice,
  [],
  [],
  AccountSlice
> = (set, get) => ({
  refreshing: false,
  currentListIndex: 0,

  ggCharacters: [],

  armorPageData: [],
  generalPageData: [],
  weaponsPageData: [],

  responseMintedTimestamp: new Date(1977),
  secondaryComponentsMintedTimestamp: new Date(1977),
  rawProfileData: null,
  guardians: {},
  vault: {
    characterId: "VAULT",
    emblemBackgroundPath: "",
    items: {},
  },

  setRefreshing: (refreshing) => set({ refreshing }),

  setCurrentListIndex: (currentListIndex) => {
    set({ currentListIndex });
  },

  setAllInventoryPageData: (weaponPage, armorPage, generalPage) =>
    set({ weaponsPageData: weaponPage, armorPageData: armorPage, generalPageData: generalPage }),

  updateProfile: (profile) =>
    set((state) => {
      get().setTimestamps(
        profile.Response.responseMintedTimestamp,
        profile.Response.secondaryComponentsMintedTimestamp,
      );
      const p1 = performance.now();
      const basicGuardians = createInitialGuardiansData(profile);
      const guardiansWithEquipment = processCharacterEquipment(profile, basicGuardians);
      const guardiansWithInventory = processCharacterInventory(profile, guardiansWithEquipment);
      const vaultItems = processVaultInventory(profile);
      const vaultData = {
        ...state.vault,
        items: vaultItems,
      };
      const ggCharacters = getCharactersAndVault(basicGuardians);
      const weaponsPageData = buildUIData(profile, weaponsPageBuckets, guardiansWithInventory, vaultData);
      const armorPageData = buildUIData(profile, armorPageBuckets, guardiansWithInventory, vaultData);
      const generalPageData = buildUIData(profile, generalPageBuckets, guardiansWithInventory, vaultData);
      const p2 = performance.now();
      console.log("updateProfile", `${(p2 - p1).toFixed(4)} ms`);
      console.info("inventory pages updated");
      return {
        rawProfileData: profile,
        guardians: guardiansWithInventory,
        vault: vaultData,
        weaponsPageData,
        armorPageData,
        generalPageData,
        ggCharacters,
      };
    }),
  setTimestamps: (responseMintedTimestamp, secondaryComponentsMintedTimestamp) =>
    set((state) => {
      const rmTimestamp = new Date(responseMintedTimestamp);
      const scmTimestamp = new Date(secondaryComponentsMintedTimestamp);
      const previousResponseMintedTimestamp = state.responseMintedTimestamp;
      const previousSecondaryComponentsMintedTimestamp = state.secondaryComponentsMintedTimestamp;

      // check new are newer than previous
      if (
        rmTimestamp.getTime() > previousResponseMintedTimestamp.getTime() &&
        scmTimestamp.getTime() > previousSecondaryComponentsMintedTimestamp.getTime()
      ) {
        return { responseMintedTimestamp: rmTimestamp, secondaryComponentsMintedTimestamp: scmTimestamp };
      }

      console.log("No new timestamps", rmTimestamp, previousResponseMintedTimestamp);
      console.log("No new timestamps", scmTimestamp, previousSecondaryComponentsMintedTimestamp);
      // Should be impossible as BungieApi.ts -> getFullProfile() already did this check.
      throw new Error("No new timestamps");
    }),
});

function createInitialGuardiansData(profile: ProfileData): Record<string, Guardian> {
  const characters = profile.Response.characters.data;
  const guardians: Record<string, Guardian> = {};
  for (const character in characters) {
    const characterData = characters[character];

    if (characterData) {
      const initialCharacterData = {
        data: characterData,
        items: {} as { [key: number]: { equipped: DestinyItem | null; inventory: DestinyItem[] } },
      };

      for (const bucket of characterBuckets) {
        initialCharacterData.items[bucket] = { equipped: null, inventory: [] };
      }

      guardians[character] = initialCharacterData;
    }
  }
  return guardians;
}

function processCharacterEquipment(
  profile: ProfileData,
  guardians: Record<string, Guardian>,
): Record<string, Guardian> {
  const charactersEquipment = profile.Response.characterEquipment.data;
  for (const character in charactersEquipment) {
    const characterEquipment = charactersEquipment[character];
    const characterAsId = { characterId: character, equipped: true };

    if (characterEquipment) {
      const characterItems = guardians[character];
      for (const item of characterEquipment.items) {
        if (characterItems) {
          const destinyItem = Object.assign(item, characterAsId);
          characterItems.items[item.bucketHash] = { equipped: destinyItem, inventory: [] };
        }
      }
    }
  }
  return guardians;
}

function processCharacterInventory(
  profile: ProfileData,
  guardians: Record<string, Guardian>,
): Record<string, Guardian> {
  const charactersInventory = profile.Response.characterInventories.data;
  for (const character in charactersInventory) {
    const characterInventory = charactersInventory[character];
    const characterAsId = { characterId: character, equipped: false };

    if (characterInventory) {
      const characterItems = guardians[character];
      for (const item of characterInventory.items) {
        if (characterItems) {
          const hasBucket = Object.hasOwn(characterItems.items, item.bucketHash);
          if (!hasBucket) {
            characterItems.items[item.bucketHash] = { equipped: null, inventory: [] };
          }
          const destinyItem = Object.assign(item, characterAsId);
          characterItems.items[item.bucketHash]?.inventory.push(destinyItem);
        }
      }
    }
  }
  return guardians;
}

function processVaultInventory(profile: ProfileData): Record<number, SectionItems> {
  const vaultInventory = profile.Response.profileInventory.data.items;
  const vaultItems: Record<number, SectionItems> = {};
  const characterIsVault = { characterId: "VAULT", equipped: false };
  if (vaultInventory) {
    for (const item of vaultInventory) {
      const itemHash = item.itemHash.toString();
      const data = itemsDefinition[itemHash];

      if (data) {
        const bucketHashIndex = data.b;
        if (bucketHashIndex !== undefined) {
          const definitionBucketHash = bucketTypeHashArray[bucketHashIndex];

          if (definitionBucketHash) {
            const hasBaseBucket = Object.hasOwn(vaultItems, item.bucketHash);
            if (!hasBaseBucket) {
              vaultItems[item.bucketHash] = { items: {} };
            }

            const items = vaultItems[item.bucketHash]?.items;
            if (items) {
              const hasBucket = Object.hasOwn(items, definitionBucketHash);
              if (!hasBucket) {
                items[definitionBucketHash] = {
                  equipped: null,
                  inventory: [],
                };
              }
              const destinyItem = Object.assign(item, characterIsVault);

              items[definitionBucketHash]?.inventory.push(destinyItem);
            }
          }
        }
      }
    }
  }
  return vaultItems;
}

function buildUIData(
  profile: ProfileData,
  itemBuckets: number[],
  guardians: Record<string, Guardian>,
  vaultData: VaultData,
): UiCell[][] {
  const characterDataArray: UiCell[][] = [];
  const columns = 4;

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

function returnDestinyIconData(profile: ProfileData, item: DestinyItemBase): DestinyIconData {
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

      const iconData: DestinyIconData = {
        itemHash: item.itemHash,
        itemInstanceId: item.itemInstanceId,
        icon: `https://www.bungie.net/common/destiny2_content/icons/${definition.i}`,
        primaryStat: itemComponent.primaryStat?.value.toString() || "",
        calculatedWaterMark: watermark,
        damageTypeIconUri: getDamageTypeIconUri(itemComponent.damageType),
      };
      return iconData;
    }

    console.error("No itemComponent found for item", item);
  }

  if (definition) {
    const nonInstancedItem: DestinyIconData = {
      itemHash: item.itemHash,
      itemInstanceId: undefined,
      icon: `https://www.bungie.net/common/destiny2_content/icons/${definition.i}`,
      primaryStat: "",
      calculatedWaterMark: "",
      damageTypeIconUri: null,
    };

    return nonInstancedItem;
  }

  const emptyData: DestinyIconData = {
    itemHash: item.itemHash,
    itemInstanceId: undefined,
    icon: "",
    primaryStat: "",
    calculatedWaterMark: "",
    damageTypeIconUri: null,
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
    const bucketItems = vaultData.items[138197802]?.items[bucket];
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
