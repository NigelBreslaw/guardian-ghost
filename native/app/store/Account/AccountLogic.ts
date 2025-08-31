import { safeParse } from "valibot";

import type { GGCharacterUiData, Guardian, DestinyItem } from "@/app/inventory/logic/Types.ts";
import { ProfileDataHelpers } from "@/app/store/Definitions.ts";
import {
  GLOBAL_CONSUMABLES_CHARACTER_ID,
  GLOBAL_LOST_ITEMS_CHARACTER_ID,
  GLOBAL_MODS_CHARACTER_ID,
  VAULT_CHARACTER_ID,
  vaultEmblemBackgroundPath,
  vaultEmblemPath,
  vaultSecondarySpecial,
} from "@/app/utilities/Constants.ts";
import { GuardiansSchema, type GuardianData } from "@/app/core/GetProfile.ts";
import { bungieUrl } from "@/app/core/ApiResponse.ts";
import type { DestinyItemIdentifier } from "@/app/inventory/logic/Helpers.ts";
import { GGCharacterType, GuardianClassType, SectionBuckets } from "@/app/bungie/Enums.ts";

export function getCharactersAndVault(guardians: Map<string, Guardian>): GGCharacterUiData[] {
  const ggCharacters: GGCharacterUiData[] = [];

  for (const [_key, guardian] of guardians) {
    const fullCharacter = guardian?.data;

    if (fullCharacter) {
      const parseCharacter = safeParse(GuardiansSchema, fullCharacter);
      if (parseCharacter.success) {
        const ggCharacter = addCharacterDefinition(parseCharacter.output as GuardianData);
        ggCharacters.push(ggCharacter);
      }
    }
  }

  const vaultData: GGCharacterUiData = {
    characterId: VAULT_CHARACTER_ID,
    guardianClassType: GuardianClassType.Vault,
    genderType: 0,
    raceType: 3,
    emblemPath: vaultEmblemPath,
    emblemBackgroundPath: vaultEmblemBackgroundPath,
    secondarySpecial: vaultSecondarySpecial,
    lastActiveCharacter: false,
    ggCharacterType: GGCharacterType.Vault,
    basePowerLevel: 0,
    artifactBonus: 0,
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
    basePowerLevel: 0,
    artifactBonus: 0,
  };

  return data;
}

// These are the fewest arguments possible. itemInstanceId would be enough for all instanced items. But for non
// instanced the characterId and itemHash are needed. Because you could have a non instanced item such as upgrade
// materials in the lost items of two different characters. So the characterId is needed to find the correct item.
export function findDestinyItem(itemIdentifier: DestinyItemIdentifier): DestinyItem | null {
  if (itemIdentifier.bucketHash === SectionBuckets.LostItem) {
    const guardianLostItems = ProfileDataHelpers.guardians
      .get(itemIdentifier.characterId)
      ?.items.get(SectionBuckets.LostItem)?.inventory;
    if (guardianLostItems) {
      try {
        const item = findDestinyItemInArray(guardianLostItems, itemIdentifier);
        return item;
      } catch {
        console.error("Failed to find item in lost items");
      }
    }
  }

  switch (itemIdentifier.characterId) {
    case VAULT_CHARACTER_ID: {
      const vaultSectionInventory = ProfileDataHelpers.generalVault.get(itemIdentifier.bucketHash);
      if (vaultSectionInventory) {
        try {
          const item = findDestinyItemInArray(vaultSectionInventory, itemIdentifier);
          return item;
        } catch {
          console.error("Failed to find item in VAULT");
        }
      }
      // If that failed search all the guardians
      const item = searchAllGuardians(itemIdentifier);
      if (item) {
        return item;
      }
      break;
    }
    case GLOBAL_MODS_CHARACTER_ID: {
      if (ProfileDataHelpers.mods) {
        try {
          const item = findDestinyItemInArray(ProfileDataHelpers.mods, itemIdentifier);
          return item;
        } catch {
          console.error("Failed to find item in GLOBAL_MODS");
        }
      }
      break;
    }
    case GLOBAL_CONSUMABLES_CHARACTER_ID: {
      if (ProfileDataHelpers.consumables) {
        try {
          const item = findDestinyItemInArray(ProfileDataHelpers.consumables, itemIdentifier);
          return item;
        } catch {
          console.error("Failed to find item in GLOBAL_CONSUMABLES");
        }
      }
      break;
    }
    case GLOBAL_LOST_ITEMS_CHARACTER_ID: {
      if (ProfileDataHelpers.lostItems) {
        try {
          const item = findDestinyItemInArray(ProfileDataHelpers.lostItems, itemIdentifier);
          return item;
        } catch {
          console.error("Failed to find item in GLOBAL_LOST_ITEMS");
        }
      }
      break;
    }
    default: {
      const section = ProfileDataHelpers.guardians
        .get(itemIdentifier.characterId)
        ?.items.get(itemIdentifier.bucketHash);

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

      // If that failed search all the guardians
      const item = searchAllGuardians(itemIdentifier);
      if (item) {
        return item;
      }
    }
  }

  console.error(`No DestinyItem found ${JSON.stringify(itemIdentifier)}`);
  return null;
}

function searchAllGuardians(itemIdentifier: DestinyItemIdentifier): DestinyItem | null {
  for (const [characterId, guardian] of ProfileDataHelpers.guardians) {
    if (characterId === VAULT_CHARACTER_ID) {
      continue;
    }

    const section = guardian?.items.get(itemIdentifier.bucketHash);

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
  }
  // Search the vault
  const vaultSectionInventory = ProfileDataHelpers.generalVault.get(itemIdentifier.bucketHash);
  if (vaultSectionInventory) {
    try {
      const item = findDestinyItemInArray(vaultSectionInventory, itemIdentifier);
      return item;
    } catch {
      console.error("Failed to find item in VAULT");
    }
  }
  console.log(`No DestinyItem found ${JSON.stringify(itemIdentifier)}`);
  return null;
}

export function findMaxQuantityToTransfer(destinyItem: DestinyItem): number {
  switch (destinyItem.characterId) {
    case GLOBAL_MODS_CHARACTER_ID: {
      const filteredItems = ProfileDataHelpers.mods.filter((item) => item.itemHash === destinyItem.itemHash);
      const totalStackedQuantity = filteredItems.reduce((total, item) => total + item.quantity, 0);
      return totalStackedQuantity;
    }
    case GLOBAL_CONSUMABLES_CHARACTER_ID: {
      const filteredItems = ProfileDataHelpers.consumables.filter((item) => item.itemHash === destinyItem.itemHash);
      const totalStackedQuantity = filteredItems.reduce((total, item) => total + item.quantity, 0);
      return totalStackedQuantity;
    }
    case VAULT_CHARACTER_ID: {
      const vaultSectionInventory = ProfileDataHelpers.generalVault.get(destinyItem.bucketHash);
      if (!vaultSectionInventory) {
        console.error("Failed to find section inventory");
        return 1;
      }
      const filteredItems = vaultSectionInventory.filter((item) => item.itemHash === destinyItem.itemHash);
      const totalStackedQuantity = filteredItems.reduce((total, item) => total + item.quantity, 0);
      return totalStackedQuantity;
    }
    default:
      return 1;
  }
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
