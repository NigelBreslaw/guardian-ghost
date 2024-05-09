import { StatType } from "@/app/bungie/Enums.ts";
import type { ItemStats } from "@/app/stats/Logic.ts";
import { View, Text, StyleSheet } from "react-native";

type UiStatType = "BAR" | "NUMERAL" | "RECOIL";

type UiStatData = {
  statType: StatType;
  type: UiStatType;
};

// impact, range, stability, handling, reload speed, aim assistance, zoom, airborne, rounds per minute, magazine, recoil
const DefaultWeaponStats: UiStatData[] = [
  { statType: StatType.Impact, type: "BAR" },
  { statType: StatType.Range, type: "BAR" },
  { statType: StatType.Stability, type: "BAR" },
  { statType: StatType.Handling, type: "BAR" },
  { statType: StatType.ReloadSpeed, type: "BAR" },
  { statType: StatType.AimAssistance, type: "BAR" },
  { statType: StatType.Zoom, type: "BAR" },
  { statType: StatType.AirborneEffectiveness, type: "BAR" },
  { statType: StatType.RoundsPerMinute, type: "NUMERAL" },
  { statType: StatType.Magazine, type: "NUMERAL" },
  { statType: StatType.RecoilDirection, type: "RECOIL" },
];

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
  const statUiData = DefaultWeaponStats;
  const labels = statUiData.map((UiData) => (
    <View key={UiData.statType} style={{ height: HEIGHT }}>
      <Text style={styles.text}>{StatType[UiData.statType]}</Text>
    </View>
  ));

  const bars = statUiData.map((UiData) => {
    const value = stats.get(UiData.statType) ?? 0;
    return (
      <View key={UiData.statType} style={{ height: HEIGHT, flexDirection: "row", gap: 1 }}>
        <View style={{ height: 10, width: 130, alignSelf: "center" }}>
          <View style={{ flex: 1, backgroundColor: "white", opacity: 0.2 }} />
          <View
            style={{
              position: "absolute",
              width: (value / 100) * 130,
              height: "100%",
              backgroundColor: "white",
            }}
          />
        </View>
        <Text style={styles.valueText}>{value}</Text>
      </View>
    );
  });

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
