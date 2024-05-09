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
    top: -1,
    right: 10,
    pointerEvents: "none",
    position: "absolute",
  },
  valueText: {
    color: "white",
    fontSize: 12,
    fontWeight: "bold",
    includeFontPadding: false,
  },
});

type NumericUiProps = {
  value: number;
};

function NumericUi(props: NumericUiProps) {
  return (
    <View style={{ height: HEIGHT, gap: 1 }}>
      <Text style={styles.valueText}>{props.value}</Text>
    </View>
  );
}

type BarUiProps = {
  value: number;
};

function BarUi(props: BarUiProps) {
  const value = Math.min(props.value, 100);

  return (
    <View style={{ height: HEIGHT, flexDirection: "row", gap: 1 }}>
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
}

type StatBarsProps = {
  stats: ItemStats;
};

export default function StatBars({ stats }: StatBarsProps) {
  const statUiData = DefaultWeaponStats;
  const labels = statUiData.map((UiData) => (
    <View
      key={UiData.statType}
      style={{
        height: HEIGHT,
        borderColor: "black",
        borderWidth: 0.3,
        alignContent: "flex-end",
      }}
    >
      <Text style={styles.text}>{StatType[UiData.statType]}</Text>
    </View>
  ));

  const bars = statUiData.map((UiData) => {
    const value = stats.get(UiData.statType) ?? 0;

    switch (UiData.type) {
      case "BAR":
        return <BarUi key={UiData.statType} value={value} />;
      case "NUMERAL":
        return <NumericUi key={UiData.statType} value={value} />;
      // case "RECOIL":
      //   return <RecoilUi key={UiData.statType} value={value} />;
      default:
        return <BarUi key={UiData.statType} value={value} />;
    }
  });

  return (
    <View style={{ flexDirection: "row", padding: 5 }}>
      <View style={{ flex: 1.5 }}>
        <View>{labels}</View>
      </View>
      <View style={{ flex: 2 }}>
        <View>{bars}</View>
      </View>
    </View>
  );
}
