import { useGGStore } from "@/app/store/GGStore.ts";
import { StyleSheet, View, Text } from "react-native";
import { Image } from "expo-image";
import { POWER_LEVEL } from "@/app/utilities/Constants.ts";

const styles = StyleSheet.create({
  root: {
    height: 40,
    paddingStart: 16,
    paddingTop: 10,
  },
  powerLevelText: {
    color: "#ECDF49",
    fontSize: 22,
    fontWeight: "bold",
    letterSpacing: 1,
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
    alignSelf: "flex-start",
    marginTop: 5,
    width: 10,
    height: 10,
  },
});

type Props = {
  readonly characterIndex: number;
};

export default function GuardianDetails({ characterIndex }: Props) {
  "use memo";

  const artifactBonus = useGGStore((state) => state.ggCharacters[characterIndex]?.artifactBonus);
  const basePowerLevel = useGGStore((state) => state.ggCharacters[characterIndex]?.basePowerLevel);

  function getPowerLevel(basePowerLevel: number | undefined, artifactBonus: number | undefined): number {
    const base = basePowerLevel ?? 0;
    const artifact = artifactBonus ?? 0;
    return base + artifact;
  }
  const powerLevel = getPowerLevel(basePowerLevel, artifactBonus);

  return (
    <View style={styles.root}>
      <View style={{ flexDirection: "row", alignItems: "center", gap: 2 }}>
        <Image source={POWER_LEVEL} style={styles.powerIcon} tintColor={"#ECDF49"} />
        <View style={{ gap: 0 }}>
          <Text style={styles.powerLevelText}>{`${powerLevel}`}</Text>
          <View style={{ flexDirection: "row", position: "absolute", right: 0, top: 23, gap: 3 }}>
            <Text style={styles.basePowerLevelText}>{`${basePowerLevel}`}</Text>
            <Text style={styles.artifactLevelText}>{`+${artifactBonus}`}</Text>
          </View>
        </View>
      </View>
    </View>
  );
}
