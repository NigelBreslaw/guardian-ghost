import {
  GGCharacterType,
  type GGCharacterUiData,
  type Guardian,
  type GuardianData,
  GuardiansSchema,
} from "@/app/bungie/Types.ts";
import { safeParse } from "valibot";

export function defineCharactersAndVault(guardians: Record<string, Guardian>) {
  for (const guardian in guardians) {
    const fullCharacter = guardians[guardian]?.data;

    if (fullCharacter) {
      const parseCharacter = safeParse(GuardiansSchema, fullCharacter);
      if (parseCharacter.success) {
        addCharacterDefinition(parseCharacter.output);
      }
    }
  }
}

function addCharacterDefinition(guardianData: GuardianData): GGCharacterUiData {
  const data: GGCharacterUiData = {
    characterId: guardianData.characterId,
    guardianClassType: guardianData.classType,
    genderType: guardianData.genderType,
    raceType: guardianData.raceType,
    emblem: "",
    lastActiveCharacter: false,
    ggCharacterType: GGCharacterType.Guardian,
  };

  return data;
}
