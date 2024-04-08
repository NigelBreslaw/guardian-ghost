import { GuardianClassType } from "@/app/bungie/Hashes.ts";
import {
  GGCharacterType,
  type GGCharacterUiData,
  type Guardian,
  type GuardianData,
  GuardiansSchema,
} from "@/app/bungie/Types.ts";
import { bungieUrl } from "@/app/inventory/Common.ts";
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
