import { characterBuckets } from "@/app/bungie/Hashes.ts";
import type {
  DestinyItem,
  GGCharacterUiData,
  Guardian,
  GuardianGear,
  ProfileData,
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
import { bucketTypeHashArray, iconWaterMarks, itemsDefinition } from "@/app/store/Definitions.ts";
import { VAULT_CHARACTER_ID } from "@/app/utilities/Constants.ts";
import type { StateCreator } from "zustand";
// import { produce } from "immer";
import { create } from "mutative";
import type { IStore } from "@/app/store/GGStore.ts";

export type AccountSliceSetter = Parameters<StateCreator<IStore, [], [], AccountSlice>>[0];
export type AccountSliceGetter = Parameters<StateCreator<IStore, [], [], AccountSlice>>[1];

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
  generalVault: VaultData;

  setRefreshing: (refreshing: boolean) => void;
  setCurrentListIndex: (payload: number) => void;

  setAllInventoryPageData: (weaponPage: UiCell[][], armorPage: UiCell[][], generalPage: UiCell[][]) => void;

  updateProfile: (profile: ProfileData) => void;

  setTimestamps: (responseMintedTimestamp: string, secondaryComponentsMintedTimestamp: string) => void;
  moveItem: (updatedDestinyItem: DestinyItem) => void;
  equipItem: (updatedDestinyItem: DestinyItem) => void;
}

export const createAccountSlice: StateCreator<IStore, [], [], AccountSlice> = (set, get) => ({
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
  generalVault: {
    items: {},
  },

  setRefreshing: (refreshing) => set({ refreshing }),

  setCurrentListIndex: (currentListIndex) => {
    set({ currentListIndex });
  },

  setAllInventoryPageData: (weaponPage, armorPage, generalPage) =>
    set({ weaponsPageData: weaponPage, armorPageData: armorPage, generalPageData: generalPage }),

  updateProfile: (profile) => {
    get().setTimestamps(profile.Response.responseMintedTimestamp, profile.Response.secondaryComponentsMintedTimestamp);
    const p1 = performance.now();
    const basicGuardians = createInitialGuardiansData(profile);
    const guardiansWithEquipment = processCharacterEquipment(profile, basicGuardians);
    const guardiansWithInventory = processCharacterInventory(profile, guardiansWithEquipment);
    const generalVault = processVaultInventory(profile);
    const ggCharacters = getCharactersAndVault(basicGuardians);
    const p2 = performance.now();
    console.log("updateProfile", `${(p2 - p1).toFixed(4)} ms`);
    console.info("inventory pages updated");
    set({
      rawProfileData: profile,
      guardians: guardiansWithInventory,
      generalVault,
      ggCharacters,
    });
    updateAllPages(get, set);
  },
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
  moveItem: (updatedDestinyItem) => {
    if (updatedDestinyItem.previousCharacterId === VAULT_CHARACTER_ID) {
      removeFromVault(get, set, updatedDestinyItem);
      addToGuardian(get, set, updatedDestinyItem);
    } else {
      removeFromGuardian(get, set, updatedDestinyItem);
      addToVault(get, set, updatedDestinyItem);
    }
    updateAllPages(get, set);
  },
  equipItem: (updatedDestinyItem) => {
    swapEquipAndInventoryItem(get, set, updatedDestinyItem);
    updateAllPages(get, set);
  },
});

function removeFromVault(get: AccountSliceGetter, set: AccountSliceSetter, destinyItem: DestinyItem) {
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

function addToVault(get: AccountSliceGetter, set: AccountSliceSetter, destinyItem: DestinyItem) {
  const previousGeneralVault = get().generalVault;

  const updatedGeneralVault = create(previousGeneralVault, (draft) => {
    draft.items[destinyItem.bucketHash]?.inventory.push(destinyItem);
  });

  set({ generalVault: updatedGeneralVault });
}

function removeFromGuardian(get: AccountSliceGetter, set: AccountSliceSetter, destinyItem: DestinyItem) {
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

function addToGuardian(get: AccountSliceGetter, set: AccountSliceSetter, destinyItem: DestinyItem) {
  const previousGuardians = get().guardians;

  const updatedGuardians = create(previousGuardians, (draft) => {
    draft[destinyItem.characterId]?.items[destinyItem.bucketHash]?.inventory.push(destinyItem);
  });
  set({ guardians: updatedGuardians });
}

function swapEquipAndInventoryItem(get: AccountSliceGetter, set: AccountSliceSetter, destinyItem: DestinyItem) {
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
    const characterAsId = { characterId: character, equipped: true, previousCharacterId: "" };

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
    const characterAsId = { characterId: character, equipped: false, previousCharacterId: "" };

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

function processVaultInventory(profile: ProfileData): VaultData {
  const vaultInventory = profile.Response.profileInventory.data.items;
  const vaultItems: VaultData = { items: {} };

  if (vaultInventory) {
    for (const item of vaultInventory) {
      const itemHash = item.itemHash.toString();

      const data = itemsDefinition[itemHash];
      //TODO: !!!! This only processes the general vault. Global items, consumables, mods, etc. need to be added.
      if (item.bucketHash !== 138197802) {
        continue;
      }

      if (data) {
        const bucketHashIndex = data.b;
        if (bucketHashIndex !== undefined) {
          const recoveryBucketHash = bucketTypeHashArray[bucketHashIndex];

          if (recoveryBucketHash) {
            const hasBaseBucket = Object.hasOwn(vaultItems.items, recoveryBucketHash);
            if (!hasBaseBucket) {
              vaultItems.items[recoveryBucketHash] = {
                equipped: null,
                inventory: [],
              };
            }
            const characterIsVault = {
              characterId: VAULT_CHARACTER_ID,
              equipped: false,
              bucketHash: recoveryBucketHash,
              previousCharacterId: "",
            };
            const destinyItem = Object.assign(item, characterIsVault);

            vaultItems.items[recoveryBucketHash]?.inventory.push(destinyItem);
          }
        }
      }
    }
  }
  return vaultItems;
}

function updateAllPages(get: AccountSliceGetter, set: AccountSliceSetter) {
  const weaponsPageData = buildUIData(get, weaponsPageBuckets);
  const armorPageData = buildUIData(get, armorPageBuckets);
  const generalPageData = buildUIData(get, generalPageBuckets);
  set({ weaponsPageData, armorPageData, generalPageData });
}

function buildUIData(get: AccountSliceGetter, itemBuckets: number[]): UiCell[][] {
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

      const iconData: DestinyIconData = {
        itemHash: item.itemHash,
        itemInstanceId,
        characterId: item.characterId,
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
      characterId: item.characterId,
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
    characterId: "",
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
