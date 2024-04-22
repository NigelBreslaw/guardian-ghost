import {
  GGCharacterType,
  type GGCharacterUiData,
  type Guardian,
  type GuardianData,
  GuardiansSchema,
  type DestinyItem,
} from "@/app/bungie/Types.ts";
import { bungieUrl, GuardianClassType, type DestinyItemIdentifier } from "@/app/bungie/Common";
import type { AccountSliceGetter } from "@/app/store/AccountSlice.ts";
import { bucketTypeHashArray, itemsDefinition } from "@/app/store/Definitions.ts";
import {
  GLOBAL_CONSUMABLES_CHARACTER_ID,
  GLOBAL_LOST_ITEMS_CHARACTER_ID,
  GLOBAL_MODS_CHARACTER_ID,
  VAULT_CHARACTER_ID,
} from "@/app/utilities/Constants.ts";
import { safeParse } from "valibot";

export function getCharactersAndVault(guardians: Record<string, Guardian>): GGCharacterUiData[] {
  const ggCharacters: GGCharacterUiData[] = [];

  for (const guardian in guardians) {
    const fullCharacter = guardians[guardian]?.data;

    if (fullCharacter) {
      const parseCharacter = safeParse(GuardiansSchema, fullCharacter);
      if (parseCharacter.success) {
        const ggCharacter = addCharacterDefinition(parseCharacter.output);
        ggCharacters.push(ggCharacter);
      }
    }
  }

  const vaultEmblemBackgroundPath = require("../../images/vaultEmblemBackground.webp");
  const secondarySpecial = require("../../images/vaultSecondary.webp");

  const vaultData: GGCharacterUiData = {
    characterId: VAULT_CHARACTER_ID,
    guardianClassType: GuardianClassType.Vault,
    genderType: 0,
    raceType: 0,
    emblemPath: "",
    emblemBackgroundPath: vaultEmblemBackgroundPath,
    secondarySpecial,
    lastActiveCharacter: false,
    ggCharacterType: GGCharacterType.Vault,
    armorPageData: [],
    generalPageData: [],
    weaponsPageData: [],
  };
  ggCharacters.push(vaultData);

  return ggCharacters;
}

function addCharacterDefinition(guardianData: GuardianData): GGCharacterUiData {
  const emblemBackgroundPath = guardianData.emblemBackgroundPath;
  const emblemPath = guardianData.emblemPath;
  const fullBackgroundEmblemPath = `${bungieUrl}${emblemBackgroundPath}`;
  const fullEmblemPath = `${bungieUrl}${emblemPath}`;

  const data: GGCharacterUiData = {
    characterId: guardianData.characterId,
    guardianClassType: guardianData.classType,
    genderType: guardianData.genderType,
    raceType: guardianData.raceType,
    emblemPath: fullEmblemPath,
    emblemBackgroundPath: fullBackgroundEmblemPath,
    secondarySpecial: "",
    lastActiveCharacter: false,
    ggCharacterType: GGCharacterType.Guardian,
    armorPageData: [],
    generalPageData: [],
    weaponsPageData: [],
  };

  return data;
}

// These are the fewest arguments possible. itemInstanceId would be enough for all instanced items. But for non
// instanced the characterId and itemHash are needed. Because you could have a non instanced item such as upgrade
// materials in the lost items of two different characters. So the characterId is needed to find the correct item.
// TODO: This function does not check the global items, mods or consumables.
export function findDestinyItem(get: AccountSliceGetter, itemIdentifier: DestinyItemIdentifier): DestinyItem {
  const itemDefinition = itemsDefinition[itemIdentifier.itemHash];
  if (!itemDefinition) {
    throw new Error("No itemDefinition found");
  }

  if (itemDefinition.b !== undefined) {
    const defaultBucket = bucketTypeHashArray[itemDefinition.b];

    if (defaultBucket) {
      if (itemIdentifier.characterId === VAULT_CHARACTER_ID) {
        const vault = get().generalVault;
        const vaultSectionInventory = vault[defaultBucket];
        if (vaultSectionInventory) {
          try {
            const item = findDestinyItemInArray(vaultSectionInventory, itemIdentifier);
            return item;
          } catch {
            console.error("Failed to find item in lost items");
          }
        }
      } else if (itemIdentifier.characterId === GLOBAL_MODS_CHARACTER_ID) {
        const mods = get().mods;
        if (mods) {
          try {
            const item = findDestinyItemInArray(mods, itemIdentifier);
            return item;
          } catch {
            console.error("Failed to find item in lost items");
          }
        }
      } else if (itemIdentifier.characterId === GLOBAL_CONSUMABLES_CHARACTER_ID) {
        const consumables = get().consumables;
        if (consumables) {
          try {
            const item = findDestinyItemInArray(consumables, itemIdentifier);
            return item;
          } catch {
            console.error("Failed to find item in lost items");
          }
        }
      } else if (itemIdentifier.characterId === GLOBAL_LOST_ITEMS_CHARACTER_ID) {
        const lostItems = get().lostItems;
        if (lostItems) {
          try {
            const item = findDestinyItemInArray(lostItems, itemIdentifier);
            return item;
          } catch {
            console.error("Failed to find item in lost items");
          }
        }
      } else {
        const guardians = get().guardians;
        const section = guardians[itemIdentifier.characterId]?.items[defaultBucket];

        if (section) {
          if (section.equipped && section.equipped?.itemInstanceId === itemIdentifier.itemInstanceId) {
            return section.equipped;
          }

          for (const item of section.inventory) {
            if (item.itemInstanceId === itemIdentifier.itemInstanceId) {
              return item;
            }
          }
        }

        // Check the lost items
        const lostItems = guardians[itemIdentifier.characterId]?.items[215593132]?.inventory;
        if (lostItems) {
          try {
            const item = findDestinyItemInArray(lostItems, itemIdentifier);
            return item;
          } catch {
            console.error("Failed to find item in lost items");
          }
        }
      }
    } else {
      console.error("No default bucket");
    }
  }
  throw new Error("No DestinyItem found");
}

function findDestinyItemInArray(itemArray: DestinyItem[], itemIdentifier: DestinyItemIdentifier): DestinyItem {
  const instancedItem = itemIdentifier.itemInstanceId !== undefined;
  for (const item of itemArray) {
    if (instancedItem) {
      if (item.itemInstanceId === itemIdentifier.itemInstanceId) {
        return item;
      }
    } else {
      if (item.itemHash === itemIdentifier.itemHash) {
        return item;
      }
    }
  }
  throw new Error("No DestinyItem found");
}
