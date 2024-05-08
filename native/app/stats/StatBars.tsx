import { StatType } from "@/app/bungie/Enums.ts";
import type { ItemStats } from "@/app/stats/Logic.ts";
import { View, Text, StyleSheet } from "react-native";
const HEIGHT = 14;

const styles = StyleSheet.create({
  text: {
    color: "white",
    fontSize: 13,
    includeFontPadding: false,
    textAlign: "right",
    paddingRight: 10,
    height: HEIGHT,
  },
  valueText: {
    color: "white",
    fontSize: 12,
    fontWeight: "bold",
    includeFontPadding: false,
  },
});

type StatBarsProps = {
  stats: ItemStats;
};

export default function StatBars({ stats }: StatBarsProps) {
  const labels = Array.from(stats, ([key]) => (
    <View key={key} style={{ height: HEIGHT }}>
      <Text style={styles.text}>{StatType[key]}</Text>
    </View>
  ));

  const bars = Array.from(stats, ([key, value]) => (
    <View key={key} style={{ height: HEIGHT, flexDirection: "row", gap: 1 }}>
      <View style={{ height: 10, width: 130, alignSelf: "center" }}>
        <View style={{ flex: 1, backgroundColor: "white", opacity: 0.2 }} />
        <View style={{ position: "absolute", width: (value / 100) * 130, height: "100%", backgroundColor: "white" }} />
      </View>
      <Text style={styles.valueText}>{value}</Text>
    </View>
  ));

  return (
    <View style={{ flexDirection: "row" }}>
      <View style={{ flex: 1.5 }}>
        <View>{labels}</View>
      </View>
      <View style={{ flex: 2 }}>
        <View>{bars}</View>
      </View>
    </View>
  );
}
