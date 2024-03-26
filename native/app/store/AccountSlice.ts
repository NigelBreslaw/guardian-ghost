import { getProfile } from "@/app/bungie/BungieApi.ts";
import { characterBuckets } from "@/app/bungie/Hashes.ts";
import {
  getProfileSchema,
  type BungieUser,
  type DestinyItem,
  type GGCharacterUiData,
  type Guardian,
  type GuardianGear,
  type ProfileData,
  type SectionItems,
  type VaultData,
} from "@/app/bungie/Types.ts";
import type { SingleItemDefinition } from "@/app/store/Types";
import {
  UiCellType,
  type SeparatorCell,
  type UiCell,
  type DestinyIconData,
  getDamagetypeIconUri,
  type BlankCell,
  type EmptyCell,
  type DestinyCell,
  weaponsPageBuckets,
  generalPageBuckets,
  armorPageBuckets,
} from "@/app/inventory/Common.ts";
import { useGGStore } from "@/app/store/GGStore.ts";
import { benchmark, benchmarkAsync } from "@/app/utilities/Helpers.ts";
import { parse } from "valibot";
import type { StateCreator } from "zustand";
export interface AccountSlice {
  currentAccount: BungieUser | null;
  setCurrentAccount: (currentAccount: BungieUser | null) => void;
  ggCharacters: GGCharacterUiData[];
  setGGCharacters: (ggCharacters: GGCharacterUiData[]) => void;

  // Inventory
  currentListIndex: number;
  setCurrentListIndex: (payload: number) => void;
  weaponsPageData: Array<Array<UiCell>>;
  armorPageData: Array<Array<UiCell>>;
  generalPageData: Array<Array<UiCell>>;
  setAllInventoryPageData: (
    weaponPage: Array<Array<UiCell>>,
    armorPage: Array<Array<UiCell>>,
    generalPage: Array<Array<UiCell>>,
  ) => void;
  rawProfileData: ProfileData | null;
  guardians: Record<string, Guardian>;
  vault: VaultData;
  updateProfile: (profile: ProfileData) => void;
  getProfile: () => Promise<void>;
}

export const createAccountSlice: StateCreator<AccountSlice> = (set) => ({
  currentAccount: null,
  setCurrentAccount: (currentAccount) => set({ currentAccount }),
  ggCharacters: [],
  setGGCharacters: (ggCharacters) => set({ ggCharacters }),

  // Inventory
  currentListIndex: 0,
  setCurrentListIndex: (currentListIndex) => {
    set({ currentListIndex });
  },
  weaponsPageData: [],
  armorPageData: [],
  generalPageData: [],
  setAllInventoryPageData: (weaponPage, armorPage, generalPage) =>
    set({ weaponsPageData: weaponPage, armorPageData: armorPage, generalPageData: generalPage }),
  rawProfileData: null,
  guardians: {},
  vault: {
    characterId: "VAULT",
    emblemBackgroundPath: "",
    items: {},
  },
  updateProfile: (profile) =>
    set((state) => {
      const basicGuardians = createInitialGuardiansData(profile);
      const guardiansWithEquipment = processCharacterEquipment(profile, basicGuardians);
      const guardiansWithInventory = processCharacterInventory(profile, guardiansWithEquipment);
      const vaultItems = processVaultInventory(profile);
      const vaultData = {
        ...state.vault,
        items: vaultItems,
      };

      const weaponsPageData = buildUIData(profile, weaponsPageBuckets, guardiansWithInventory, vaultData);
      const armorPageData = buildUIData(profile, armorPageBuckets, guardiansWithInventory, vaultData);
      const generalPageData = buildUIData(profile, generalPageBuckets, guardiansWithInventory, vaultData);
      return {
        rawProfileData: profile,
        guardians: guardiansWithInventory,
        vault: vaultData,
        weaponsPageData,
        armorPageData,
        generalPageData,
      };
    }),
  getProfile: async () => {
    useGGStore.getState().setRefreshing(true);
    try {
      const profile = await benchmarkAsync(getProfile);
      const validatedProfile = benchmark(parse, getProfileSchema, profile);
      const p1 = performance.now();
      useGGStore.getState().updateProfile(validatedProfile);
      const p2 = performance.now();
      console.info("NEW updateProfile() took:", (p2 - p1).toFixed(5), "ms");
    } catch (e) {
      console.error("Failed to validate profile!", e);
    } finally {
      useGGStore.getState().setRefreshing(false);
    }
  },
});

function createInitialGuardiansData(profile: ProfileData): Record<string, Guardian> {
  const p1 = performance.now();
  const characters = profile.Response.characters.data;
  const guardians: Record<string, Guardian> = {};
  for (const character in characters) {
    const characterData = characters[character];

    if (characterData) {
      const initialCharacterData = {
        data: characterData,
        items: {} as { [key: number]: { equipped: DestinyItem | null; inventory: Array<DestinyItem> } },
      };

      for (const bucket of characterBuckets) {
        initialCharacterData.items[bucket] = { equipped: null, inventory: [] };
      }

      guardians[character] = initialCharacterData;
    }
  }
  const p2 = performance.now();
  console.log("Initializing guardians took", (p2 - p1).toFixed(5), "ms");
  return guardians;
}

function processCharacterEquipment(
  profile: ProfileData,
  guardians: Record<string, Guardian>,
): Record<string, Guardian> {
  const charactersEquipment = profile.Response.characterEquipment.data;
  for (const character in charactersEquipment) {
    const characterEquipment = charactersEquipment[character];

    if (characterEquipment) {
      const characterItems = guardians[character];
      for (const item of characterEquipment.items) {
        if (characterItems) {
          characterItems.items[item.bucketHash] = { equipped: item, inventory: [] };
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

    if (characterInventory) {
      const characterItems = guardians[character];
      for (const item of characterInventory.items) {
        if (characterItems) {
          const hasBucket = Object.hasOwn(characterItems.items, item.bucketHash);
          if (!hasBucket) {
            characterItems.items[item.bucketHash] = { equipped: null, inventory: [] };
          }
          characterItems.items[item.bucketHash]?.inventory.push(item);
        }
      }
    }
  }
  return guardians;
}

function processVaultInventory(profile: ProfileData): Record<number, SectionItems> {
  const vaultInventory = profile.Response.profileInventory.data.items;
  const vaultItems: Record<number, SectionItems> = {};
  if (vaultInventory) {
    for (const item of vaultInventory) {
      const itemHash = item.itemHash.toString();
      const data = useGGStore.getState().itemDefinition?.items[itemHash] as SingleItemDefinition;

      const bucketHashIndex = data.b;
      if (bucketHashIndex !== undefined) {
        const definitionBucketHash = useGGStore.getState().bucketTypeHashArray[bucketHashIndex];

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

            items[definitionBucketHash]?.inventory.push(item);
          }
        }
      }
    }
  }
  return vaultItems;
}

function buildUIData(
  profile: ProfileData,
  itemBuckets: Array<number>,
  guardians: Record<string, Guardian>,
  vaultData: VaultData,
): Array<Array<UiCell>> {
  const characterDataArray: Array<Array<UiCell>> = [];
  const columns = 4;

  for (const character in guardians) {
    const characterData = guardians[character];
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
  const definition = useGGStore.getState().itemDefinition?.items[item.itemHash] as SingleItemDefinition;
  const itemInstanceId = item?.itemInstanceId;

  if (itemInstanceId) {
    const itemComponent = profile.Response.itemComponents.instances.data[itemInstanceId];
    if (itemComponent) {
      // if it has a version number get the watermark from the array. If it does not then see if the definition has an 'iconWatermark'
      const versionNumber = item.versionNumber;

      let watermark: string | undefined = undefined;
      if (versionNumber !== undefined) {
        const dvwi = definition.dvwi;

        if (dvwi) {
          const index = dvwi[versionNumber];
          if (index !== undefined) {
            watermark = useGGStore.getState().iconWaterMarks[index];
          }
        }
      } else {
        const iconWatermark = definition.iw;
        if (iconWatermark) {
          watermark = useGGStore.getState().iconWaterMarks[iconWatermark];
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
): Array<DestinyIconData> {
  const rowData: Array<DestinyIconData> = [];

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

function returnVaultUiData(profile: ProfileData, itemBuckets: Array<number>, vaultData: VaultData): Array<UiCell> {
  const dataArray: Array<UiCell> = [];
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
