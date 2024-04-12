import { DestinyClass, ItemType } from "@/app/bungie/Hashes.ts";
import {
  ItemSubType,
  TierType,
  type DestinyItem,
  type DestinyItemBase,
  type DestinyItemDefinition,
  type GGCharacterUiData,
  type Guardian,
  type ProfileData,
  type VaultData,
} from "@/app/bungie/Types.ts";
import { characterBuckets, type DestinyItemIdentifier, type UISections } from "@/app/inventory/Common.ts";
import { findDestinyItem, getCharactersAndVault } from "@/app/store/AccountLogic.ts";
import {
  bucketTypeHashArray,
  iconWaterMarks,
  itemsDefinition,
  rawProfileData,
  setRawProfileData,
} from "@/app/store/Definitions.ts";
import { VAULT_CHARACTER_ID } from "@/app/utilities/Constants.ts";
import type { StateCreator } from "zustand";
import type { IStore } from "@/app/store/GGStore.ts";
import {
  addToGuardian,
  addToVault,
  checkForCraftedMasterwork,
  hasSocketedResonance,
  removeFromGuardian,
  removeFromVault,
  swapEquipAndInventoryItem,
  updateAllPages,
} from "@/app/store/AccountInventoryLogic.ts";
import { bitmaskContains } from "@/app/utilities/Helpers.ts";
import type { SingleItemDefinition } from "@/app/store/Types.ts";

export type AccountSliceSetter = Parameters<StateCreator<IStore, [], [], AccountSlice>>[0];
export type AccountSliceGetter = Parameters<StateCreator<IStore, [], [], AccountSlice>>[1];

export interface AccountSlice {
  appStartupTime: number;
  refreshing: boolean;
  currentListIndex: number;

  // The characters live in an object. This array does duplicate some of this data, but it's order
  // dictates
  ggCharacters: GGCharacterUiData[];

  armorPageData: UISections[][];
  generalPageData: UISections[][];
  weaponsPageData: UISections[][];
  selectedItem: DestinyItem | null;

  responseMintedTimestamp: Date;
  secondaryComponentsMintedTimestamp: Date;
  guardians: Record<string, Guardian>;
  generalVault: VaultData;

  setAppStartupTime: (appStartupTime: number) => void;
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
  appStartupTime: 0,
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

  setAppStartupTime: (appStartupTime) => set({ appStartupTime }),
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
  // set the data first as many other functions need to use the latest version
  setRawProfileData(profile);

  get().setTimestamps(profile.Response.responseMintedTimestamp, profile.Response.secondaryComponentsMintedTimestamp);
  const p1 = performance.now();
  const basicGuardians = createInitialGuardiansData(profile);
  const guardiansWithEquipment = processCharacterEquipment(profile, basicGuardians);
  const guardiansWithInventory = processCharacterInventory(profile, guardiansWithEquipment);
  const generalVault = processVaultInventory(profile);
  const ggCharacters = getCharactersAndVault(basicGuardians);
  const p2 = performance.now();
  console.info("process Inventory took:", `${(p2 - p1).toFixed(4)} ms`);

  set({
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
      if (!characterItems) {
        throw new Error("Character items not found");
      }
      // create all the sections first
      for (const bucket of characterBuckets) {
        characterItems.items[bucket] = { equipped: null, inventory: [] };
      }
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
  const definitionItems: DestinyItemDefinition = {
    recoveryBucketHash,
    itemType: ItemType.None,
    previousCharacterId: "",
    characterId: extras.characterId,
    equipped: extras.equipped,
    icon: "",
    primaryStat: 0,
    itemSubType: ItemSubType.None,
    tierType: TierType.Unknown,
    destinyClass: DestinyClass.Unknown,
  };

  definitionItems.itemType = itemDef?.it ?? ItemType.None;

  if (baseItem.overrideStyleItemHash !== undefined) {
    const overrideDef = itemsDefinition[baseItem.overrideStyleItemHash];

    definitionItems.icon = `https://www.bungie.net/common/destiny2_content/icons/${overrideDef?.i}`;
  } else {
    definitionItems.icon = `https://www.bungie.net/common/destiny2_content/icons/${itemDef.i}`;
  }

  definitionItems.itemSubType = itemDef?.is ?? 0;
  definitionItems.tierType = itemDef?.t ?? 0;
  definitionItems.destinyClass = itemDef?.c ?? 3;

  definitionItems.calculatedWaterMark = calculateWaterMark(baseItem, itemDef);
  const masterwork = bitmaskContains(baseItem.state, 4);
  if (masterwork) {
    definitionItems.masterwork = true;
  }

  if (baseItem.itemInstanceId !== undefined) {
    const itemComponent = rawProfileData?.Response.itemComponents.instances.data[baseItem.itemInstanceId];
    if (itemComponent) {
      if (
        definitionItems.itemType === ItemType.Armor ||
        definitionItems.itemType === ItemType.Weapon ||
        definitionItems.itemType === ItemType.Vehicle
      ) {
        const primaryStat = itemComponent.primaryStat?.value;
        if (primaryStat) {
          definitionItems.primaryStat = primaryStat;
        }
        if (definitionItems.itemType !== ItemType.Vehicle) {
          if (definitionItems.itemType === ItemType.Weapon) {
            const deepSightResonance = hasSocketedResonance(baseItem.itemInstanceId);
            if (deepSightResonance) {
              definitionItems.deepSightResonance = true;
            }
            definitionItems.damageType = itemComponent.damageType;
            const crafted = bitmaskContains(baseItem.state, 8);
            if (crafted) {
              definitionItems.crafted = true;
              definitionItems.masterwork = checkForCraftedMasterwork(baseItem.itemInstanceId);
            }
          }
        }
      }
      if (definitionItems.itemType === ItemType.Engram) {
        const itemLevel = itemComponent.itemLevel * 10;
        const quality = itemComponent.quality;
        const total = itemLevel + quality;
        if (total > 0) {
          definitionItems.primaryStat = Math.max(1600, itemLevel + quality);
        }
      }
    }
  }

  const destinyItem = Object.assign(baseItem, extras, definitionItems);
  return destinyItem;
}

function calculateWaterMark(destinyItem: DestinyItemBase, definition: SingleItemDefinition): string | undefined {
  const versionNumber = destinyItem.versionNumber;

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
  return watermark;
}

function processVaultInventory(profile: ProfileData): VaultData {
  const vaultInventory = profile.Response.profileInventory.data.items;
  const vaultItems: VaultData = { items: {} };

  // create all the sections first
  for (const bucket of characterBuckets) {
    vaultItems.items[bucket] = {
      equipped: null,
      inventory: [],
    };
  }
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
        vaultItems.items[destinyItem.bucketHash]?.inventory.push(destinyItem);
      }
    }
  }
  return vaultItems;
}
