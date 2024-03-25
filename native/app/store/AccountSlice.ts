import { characterBuckets } from "@/app/bungie/Hashes.ts";
import type {
  BungieUser,
  DestinyItem,
  GGCharacterUiData,
  Guardian,
  ProfileData,
  SectionItems,
  VaultData,
} from "@/app/bungie/Types.ts";
import DataService from "@/app/core/DataService.ts";
import type { SingleItemDefinition } from "@/app/core/Types.ts";
import type { UiCell } from "@/app/inventory/Common.ts";
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
  updateProfile: (data: ProfileData) => void;
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
  updateProfile: (newData) =>
    set((state) => {
      console.log("This is the first time the account has been updated.");
      const basicGuardians = createInitialGuardiansData(newData);
      const guardiansWithEquipment = processCharacterEquipment(newData, basicGuardians);
      const guardiansWithInventory = processCharacterInventory(newData, guardiansWithEquipment);
      const vaultItems = processVaultInventory(newData);
      return {
        rawProfileData: newData,
        guardians: guardiansWithInventory,
        vault: {
          ...state.vault,
          items: vaultItems,
        },
      };
    }),
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
      const data = DataService.itemDefinition.items[itemHash] as SingleItemDefinition;

      const bucketHashIndex = data.b;
      if (bucketHashIndex !== undefined) {
        const definitionBucketHash = DataService.bucketTypeHashArray[bucketHashIndex];

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
