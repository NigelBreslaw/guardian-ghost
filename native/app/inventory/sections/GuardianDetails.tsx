import { useGGStore } from "@/app/store/GGStore.ts";
import { StyleSheet, View } from "react-native";
import { Image } from "expo-image";
import { POWER_LEVEL, VAULT_CHARACTER_ID } from "@/app/utilities/Constants.ts";
import { getGuardianClassType, getGuardianRaceType } from "@/app/utilities/Helpers.ts";
import { DESTINY_TEXT } from "@/app/store/Definitions.ts";
import Text from "@/app/UI/Text.tsx";

const styles = StyleSheet.create({
  root: {
    height: 50,
    paddingLeft: 16,
    paddingRight: 16,
    paddingTop: 5,
  },
  rootHidden: {
    height: 50,
    opacity: 0,
  },
  powerLevelText: {
    color: "#ECDF49",
    fontSize: 22,
    fontWeight: "bold",
    height: 25,
  },
  basePowerLevelText: {
    color: "white",
    fontSize: 14,
  },
  artifactLevelText: {
    color: "#56B1B7",
    fontSize: 14,
  },
  powerIcon: {
    position: "absolute",
    top: 0,
    left: -10,
    width: 10,
    height: 10,
  },
  powerText: {
    position: "absolute",
    top: -6,
    right: 0,
    color: "white",
    fontSize: 8,
  },
  classText: {
    color: "white",
    fontSize: 25,
    fontWeight: "bold",
  },
  raceText: {
    color: "white",
    fontSize: 12,
    fontWeight: "bold",
    opacity: 0.6,
    transform: [{ translateY: -5 }],
  },
});

type Props = {
  readonly characterIndex: number;
};

export default function GuardianDetails({ characterIndex }: Props) {
  "use memo";

  const destinyClassType = useGGStore.getState().ggCharacters[characterIndex]?.guardianClassType;
  const destinyClassName = getGuardianClassType(destinyClassType);
  const destinyRaceType = useGGStore.getState().ggCharacters[characterIndex]?.raceType ?? 3;
  const destinyRaceName = getGuardianRaceType(destinyRaceType).toUpperCase();

  const characterId = useGGStore((state) => state.ggCharacters[characterIndex]?.characterId);
  const artifactBonus = useGGStore((state) => state.ggCharacters[characterIndex]?.artifactBonus);
  const basePowerLevel = useGGStore((state) => state.ggCharacters[characterIndex]?.basePowerLevel);

  function getPowerLevel(basePowerLevel: number | undefined, artifactBonus: number | undefined): number {
    const base = basePowerLevel ?? 0;
    const artifact = artifactBonus ?? 0;
    return base + artifact;
  }
  const powerLevel = getPowerLevel(basePowerLevel, artifactBonus);

  return (
    <View style={characterId === VAULT_CHARACTER_ID ? styles.rootHidden : styles.root}>
      <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
        <View>
          <Text style={styles.classText}>{`${destinyClassName}`}</Text>
          <Text style={styles.raceText}>{`${destinyRaceName}`}</Text>
        </View>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 40 }}>
          <View style={{ gap: 0 }}>
            <Image source={POWER_LEVEL} style={styles.powerIcon} tintColor={"#ECDF49"} />

            <Text style={styles.powerLevelText}>{`${powerLevel}`}</Text>
            <Text style={styles.powerText}>{DESTINY_TEXT.POWER.toUpperCase()}</Text>
            <View style={{ flexDirection: "row", position: "absolute", right: 0, top: 24, gap: 3 }}>
              <Text style={styles.basePowerLevelText}>{`${basePowerLevel}`}</Text>
              <Text style={styles.artifactLevelText}>{`+${artifactBonus}`}</Text>
            </View>
          </View>
        </View>
      </View>
    </View>
  );
}
