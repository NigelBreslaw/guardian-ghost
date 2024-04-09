import { characterBuckets } from "@/app/bungie/Hashes.ts";
import type {
  DestinyItem,
  DestinyItemBase,
  GGCharacterUiData,
  Guardian,
  ProfileData,
  VaultData,
} from "@/app/bungie/Types.ts";
import {
  DestinyItemType,
  armorBuckets,
  weaponBuckets,
  type DestinyItemIdentifier,
  type UiCell,
} from "@/app/inventory/Common.ts";
import { findDestinyItem, getCharactersAndVault } from "@/app/store/AccountLogic.ts";
import { bucketTypeHashArray, itemsDefinition } from "@/app/store/Definitions.ts";
import { VAULT_CHARACTER_ID } from "@/app/utilities/Constants.ts";
import type { StateCreator } from "zustand";
import type { IStore } from "@/app/store/GGStore.ts";
import {
  addToGuardian,
  addToVault,
  removeFromGuardian,
  removeFromVault,
  swapEquipAndInventoryItem,
  updateAllPages,
} from "@/app/store/AccountInventoryLogic.ts";

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
  selectedItem: DestinyItem | null;

  responseMintedTimestamp: Date;
  secondaryComponentsMintedTimestamp: Date;
  rawProfileData: ProfileData | null;
  guardians: Record<string, Guardian>;
  generalVault: VaultData;

  setRefreshing: (refreshing: boolean) => void;
  setCurrentListIndex: (payload: number) => void;
  updateProfile: (profile: ProfileData) => void;
  setSelectedItem: (itemIdentifier: DestinyItemIdentifier | null) => void;
  setTimestamps: (responseMintedTimestamp: string, secondaryComponentsMintedTimestamp: string) => void;
  moveItem: (updatedDestinyItem: DestinyItem) => void;
  equipItem: (updatedDestinyItem: DestinyItem) => void;
  findDestinyItem: (itemDetails: DestinyItemIdentifier) => DestinyItem;
}

export const createAccountSlice: StateCreator<IStore, [], [], AccountSlice> = (set, get) => ({
  refreshing: false,
  currentListIndex: 0,

  ggCharacters: [],

  armorPageData: [],
  generalPageData: [],
  weaponsPageData: [],
  selectedItem: null,

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

  updateProfile: (profile) => {
    updateProfile(get, set, profile);
  },

  setSelectedItem: (itemIdentifier) => {
    if (!itemIdentifier) {
      set({ selectedItem: null });
      return;
    }
    const selectedItem = findDestinyItem(get, itemIdentifier);
    set({ selectedItem });
  },

  setTimestamps: (responseMintedTimestamp, secondaryComponentsMintedTimestamp) =>
    setTimestamps(set, responseMintedTimestamp, secondaryComponentsMintedTimestamp),

  moveItem: (updatedDestinyItem) => {
    const p1 = performance.now();
    if (updatedDestinyItem.previousCharacterId === VAULT_CHARACTER_ID) {
      removeFromVault(get, set, updatedDestinyItem);
      addToGuardian(get, set, updatedDestinyItem);
    } else {
      removeFromGuardian(get, set, updatedDestinyItem);
      addToVault(get, set, updatedDestinyItem);
    }
    const p2 = performance.now();
    console.log("moveItem", `${(p2 - p1).toFixed(4)} ms`);
    updateAllPages(get, set);
    const p3 = performance.now();
    console.log("updateAllPages", `${(p3 - p2).toFixed(4)} ms`);
  },
  equipItem: (updatedDestinyItem) => {
    swapEquipAndInventoryItem(get, set, updatedDestinyItem);
    updateAllPages(get, set);
  },
  findDestinyItem: (itemDetails) =>
    findDestinyItem(get, {
      itemHash: itemDetails.itemHash,
      itemInstanceId: itemDetails.itemInstanceId,
      characterId: itemDetails.characterId,
    }),
});

function updateProfile(get: AccountSliceGetter, set: AccountSliceSetter, profile: ProfileData) {
  get().setTimestamps(profile.Response.responseMintedTimestamp, profile.Response.secondaryComponentsMintedTimestamp);
  const p1 = performance.now();
  const basicGuardians = createInitialGuardiansData(profile);
  const guardiansWithEquipment = processCharacterEquipment(profile, basicGuardians);
  const guardiansWithInventory = processCharacterInventory(profile, guardiansWithEquipment);
  const generalVault = processVaultInventory(profile);
  const ggCharacters = getCharactersAndVault(basicGuardians);
  const p2 = performance.now();
  console.log("process Inventory took:", `${(p2 - p1).toFixed(4)} ms`);
  set({
    rawProfileData: profile,
    guardians: guardiansWithInventory,
    generalVault,
    ggCharacters,
  });
  updateAllPages(get, set);
}

function setTimestamps(
  set: AccountSliceSetter,
  responseMintedTimestamp: string,
  secondaryComponentsMintedTimestamp: string,
) {
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
  });
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
    const characterAsId = { characterId: character, equipped: true };

    if (characterEquipment) {
      const characterItems = guardians[character];
      for (const item of characterEquipment.items) {
        if (characterItems) {
          try {
            const destinyItem = addDefinition(item, characterAsId);
            characterItems.items[item.bucketHash] = { equipped: destinyItem, inventory: [] };
          } catch {
            // console.error("Failed to add item", e);
          }
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
          try {
            const destinyItem = addDefinition(item, characterAsId);
            characterItems.items[item.bucketHash]?.inventory.push(destinyItem);
          } catch {
            // console.error("Failed to add item", e);
          }
        }
      }
    }
  }
  return guardians;
}

function addDefinition(baseItem: DestinyItemBase, extras: { characterId: string; equipped: boolean }): DestinyItem {
  const itemDef = itemsDefinition[baseItem.itemHash];
  if (!itemDef || itemDef.b === undefined) {
    throw new Error("No itemDefinition found");
  }
  const recoveryBucketHash = bucketTypeHashArray[itemDef.b];
  const itemType: DestinyItemType = getItemType(recoveryBucketHash);
  const definitionItems = {
    recoveryBucketHash,
    itemType,
    previousCharacterId: "",
  };

  const destinyItem = Object.assign(baseItem, extras, definitionItems);
  return destinyItem;
}

function getItemType(bucketHash: number | undefined): DestinyItemType {
  if (bucketHash === undefined) {
    return DestinyItemType.Unknown;
  }
  if (weaponBuckets.includes(bucketHash)) {
    return DestinyItemType.Weapon;
  }
  if (armorBuckets.includes(bucketHash)) {
    return DestinyItemType.Armor;
  }

  return DestinyItemType.Unknown;
}

function processVaultInventory(profile: ProfileData): VaultData {
  const vaultInventory = profile.Response.profileInventory.data.items;
  const vaultItems: VaultData = { items: {} };

  if (vaultInventory) {
    for (const item of vaultInventory) {
      //TODO: !!!! This only processes the general vault. Global items, consumables, mods, etc. need to be added.
      if (item.bucketHash !== 138197802) {
        continue;
      }
      let destinyItem: DestinyItem;
      try {
        const characterIsVault = {
          characterId: VAULT_CHARACTER_ID,
          equipped: false,
        };
        destinyItem = addDefinition(item, characterIsVault);
        destinyItem.bucketHash = destinyItem.recoveryBucketHash ?? 0;
      } catch {
        continue;
      }

      if (destinyItem.bucketHash !== 0) {
        const hasBaseBucket = Object.hasOwn(vaultItems.items, destinyItem.bucketHash);
        if (!hasBaseBucket) {
          vaultItems.items[destinyItem.bucketHash] = {
            equipped: null,
            inventory: [],
          };
        }
        vaultItems.items[destinyItem.bucketHash]?.inventory.push(destinyItem);
      }
    }
  }
  return vaultItems;
}
