import {
  GGCharacterType,
  type GGCharacterUiData,
  type Guardian,
  type GuardianData,
  GuardiansSchema,
} from "@/app/bungie/Types.ts";
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

  return ggCharacters;
}

function addCharacterDefinition(guardianData: GuardianData): GGCharacterUiData {
  const data: GGCharacterUiData = {
    characterId: guardianData.characterId,
    guardianClassType: guardianData.classType,
    genderType: guardianData.genderType,
    raceType: guardianData.raceType,
    emblemPath: guardianData.emblemPath,
    emblemBackgroundPath: guardianData.emblemBackgroundPath,
    lastActiveCharacter: false,
    ggCharacterType: GGCharacterType.Guardian,
  };

  return data;
}
