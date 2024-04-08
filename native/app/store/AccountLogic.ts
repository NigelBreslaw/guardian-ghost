import { GuardianClassType } from "@/app/bungie/Hashes.ts";
import {
  GGCharacterType,
  type GGCharacterUiData,
  type Guardian,
  type GuardianData,
  GuardiansSchema,
  type DestinyItem,
} from "@/app/bungie/Types.ts";
import { bungieUrl } from "@/app/inventory/Common.ts";
import type { AccountSliceGetter } from "@/app/store/AccountSlice.ts";
import { bucketTypeHashArray, itemsDefinition } from "@/app/store/Definitions.ts";
import { VAULT_CHARACTER_ID } from "@/app/utilities/Constants.ts";
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

  const vaultData: GGCharacterUiData = {
    characterId: VAULT_CHARACTER_ID,
    guardianClassType: GuardianClassType.Vault,
    genderType: 0,
    raceType: 0,
    emblemPath: "",
    emblemBackgroundPath: vaultEmblemBackgroundPath,
    lastActiveCharacter: false,
    ggCharacterType: GGCharacterType.Vault,
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
    lastActiveCharacter: false,
    ggCharacterType: GGCharacterType.Guardian,
  };

  return data;
}

// These are the fewest arguments possible. itemInstanceId would be enough for all instanced items. But for non
// instanced the characterId and itemHash are needed. Because you could have a non instanced item such as upgrade
// materials in the lost items of two different characters. So the characterId is needed to find the correct item.
// TODO: This function does not check the global items, mods or consumables.
export function findDestinyItem(
  get: AccountSliceGetter,
  itemInstanceId: string | undefined,
  itemHash: number,
  characterId: string,
): DestinyItem {
  const itemDefinition = itemsDefinition[itemHash];
  if (!itemDefinition) {
    throw new Error("No itemDefinition found");
  }

  if (itemDefinition.b !== undefined) {
    const defaultBucket = bucketTypeHashArray[itemDefinition.b];

    const instancedItem = itemInstanceId !== undefined;
    if (defaultBucket) {
      if (characterId === VAULT_CHARACTER_ID) {
        const vault = get().generalVault;
        const vaultSectionInventory = vault.items[defaultBucket]?.inventory;
        if (vaultSectionInventory) {
          for (const item of vaultSectionInventory) {
            if (instancedItem) {
              if (item.itemInstanceId === itemInstanceId) {
                return item;
              }
            } else {
              if (item.itemHash === itemHash) {
                return item;
              }
            }
          }
        }
      } else {
        const guardians = get().guardians;
        const section = guardians[characterId]?.items[defaultBucket];

        if (section) {
          if (section.equipped && section.equipped?.itemInstanceId === itemInstanceId) {
            return section.equipped;
          }

          for (const item of section.inventory) {
            if (item.itemInstanceId === itemInstanceId) {
              return item;
            }
          }
        }

        // Check the lost items
        const lostItems = guardians[characterId]?.items[215593132]?.inventory;
        if (lostItems) {
          for (const item of lostItems) {
            if (instancedItem) {
              if (item.itemInstanceId === itemInstanceId) {
                return item;
              }
            } else {
              if (item.itemHash === itemHash) {
                return item;
              }
            }
          }
        }
      }
    } else {
      console.error("No default bucket");
    }
  }
  throw new Error("No DestinyItem found");
}
