import { View, StyleSheet } from "react-native";

import Text from "@/app/UI/Text.tsx";
import { ItemSubType, ItemType, StatType } from "@/app/bungie/Enums.ts";
import { ArmorStatInvestments } from "@/app/inventory/logic/Helpers.ts";
import type { DestinyItem } from "@/app/inventory/logic/Types.ts";
import type { ItemStats } from "@/app/stats/Logic.ts";
import { DestinyStatDefinition } from "@/app/store/Definitions.ts";
import RecoilStat from "@/app/stats/RecoilStat.tsx";
import { createSockets } from "@/app/inventory/logic/Sockets.ts";

type UiStatType = "BAR" | "NUMERAL" | "RECOIL" | "SEPARATOR" | "ARMOR-TOTAL";

type UiStatData = {
  statType: StatType;
  type: UiStatType;
};

const DefaultArmorStats: UiStatData[] = [
  { statType: StatType.Resilience, type: "BAR" },
  { statType: StatType.Strength, type: "BAR" },
  { statType: StatType.Discipline, type: "BAR" },
  { statType: StatType.Intellect, type: "BAR" },
  { statType: StatType.Recovery, type: "BAR" },
  { statType: StatType.Mobility, type: "BAR" },
  { statType: StatType.Separator, type: "SEPARATOR" },
  { statType: StatType.ArmorTotal, type: "ARMOR-TOTAL" },
];

const SharedWeaponStats: UiStatData[] = [
  { statType: StatType.Stability, type: "BAR" },
  { statType: StatType.Handling, type: "BAR" },
  { statType: StatType.ReloadSpeed, type: "BAR" },
  { statType: StatType.AimAssistance, type: "BAR" },
  { statType: StatType.Zoom, type: "BAR" },
  { statType: StatType.AirborneEffectiveness, type: "BAR" },
  { statType: StatType.AmmoGeneration, type: "BAR" },
  { statType: StatType.Separator, type: "SEPARATOR" },
  { statType: StatType.RoundsPerMinute, type: "NUMERAL" },
  { statType: StatType.Magazine, type: "NUMERAL" },
  { statType: StatType.RecoilDirection, type: "RECOIL" },
];

const DefaultWeaponStats: UiStatData[] = [
  { statType: StatType.Impact, type: "BAR" },
  { statType: StatType.Range, type: "BAR" },
  ...SharedWeaponStats,
];

const BowWeaponStats: UiStatData[] = [
  { statType: StatType.Impact, type: "BAR" },
  { statType: StatType.Accuracy, type: "BAR" },
  { statType: StatType.Stability, type: "BAR" },
  { statType: StatType.Handling, type: "BAR" },
  { statType: StatType.ReloadSpeed, type: "BAR" },
  { statType: StatType.AimAssistance, type: "BAR" },
  { statType: StatType.Zoom, type: "BAR" },
  { statType: StatType.AirborneEffectiveness, type: "BAR" },
  { statType: StatType.AmmoGeneration, type: "BAR" },
  { statType: StatType.Separator, type: "SEPARATOR" },
  { statType: StatType.DrawTime, type: "NUMERAL" },
  { statType: StatType.RecoilDirection, type: "RECOIL" },
];

const ExplosiveWeaponStats: UiStatData[] = [
  { statType: StatType.BlastRadius, type: "BAR" },
  { statType: StatType.Velocity, type: "BAR" },
  ...SharedWeaponStats,
];

const RocketSidearmStats: UiStatData[] = [
  { statType: StatType.BlastRadius, type: "BAR" },
  { statType: StatType.Velocity, type: "BAR" },
  ...SharedWeaponStats,
];

const FusionWeaponStats: UiStatData[] = [
  { statType: StatType.Impact, type: "BAR" },
  { statType: StatType.Range, type: "BAR" },
  { statType: StatType.Stability, type: "BAR" },
  { statType: StatType.Handling, type: "BAR" },
  { statType: StatType.ReloadSpeed, type: "BAR" },
  { statType: StatType.AimAssistance, type: "BAR" },
  { statType: StatType.Zoom, type: "BAR" },
  { statType: StatType.AirborneEffectiveness, type: "BAR" },
  { statType: StatType.AmmoGeneration, type: "BAR" },
  { statType: StatType.Separator, type: "SEPARATOR" },
  { statType: StatType.ChargeTime, type: "NUMERAL" },
  { statType: StatType.Magazine, type: "NUMERAL" },
  { statType: StatType.RecoilDirection, type: "RECOIL" },
];

const SwordWeaponStats: UiStatData[] = [
  { statType: StatType.Impact, type: "BAR" },
  { statType: StatType.SwingSpeed, type: "BAR" },
  { statType: StatType.ChargeRate, type: "BAR" },
  { statType: StatType.GuardResistance, type: "BAR" },
  { statType: StatType.GuardEndurance, type: "BAR" },
  { statType: StatType.Separator, type: "SEPARATOR" },
  { statType: StatType.AmmoCapacity, type: "NUMERAL" },
];

const GlaiveWeaponStats: UiStatData[] = [
  { statType: StatType.Impact, type: "BAR" },
  { statType: StatType.Range, type: "BAR" },
  { statType: StatType.ShieldDuration, type: "BAR" },
  { statType: StatType.Handling, type: "BAR" },
  { statType: StatType.ReloadSpeed, type: "BAR" },
  { statType: StatType.AimAssistance, type: "BAR" },
  { statType: StatType.AirborneEffectiveness, type: "BAR" },
  { statType: StatType.AmmoGeneration, type: "BAR" },
  { statType: StatType.Separator, type: "SEPARATOR" },
  { statType: StatType.RoundsPerMinute, type: "NUMERAL" },
  { statType: StatType.Magazine, type: "NUMERAL" },
  { statType: StatType.RecoilDirection, type: "RECOIL" },
];

const HEIGHT = 18;

type ArmorProps = {
  readonly itemStats: ItemStats;
};

function ArmorTotal({ itemStats }: ArmorProps) {
  "use memo";
  let total = 0;

  for (const [key, value] of itemStats) {
    if (ArmorStatInvestments.includes(key)) {
      total += value;
    }
  }

  return (
    <View style={{ height: HEIGHT, gap: 1 }}>
      <Text style={[styles.valueText, { paddingLeft: 10 }]}>{total}</Text>
    </View>
  );
}

type NumericUiProps = {
  readonly value: number;
};

function NumericUi({ value }: NumericUiProps) {
  "use memo";
  return (
    <View style={{ height: HEIGHT, gap: 1 }}>
      <Text style={[styles.valueText, { paddingLeft: 10 }]}>{value}</Text>
    </View>
  );
}

type BarProps = {
  readonly statType: StatType;
  readonly value: number;
};

function BarUi({ statType, value }: BarProps) {
  "use memo";
  const maxValue = ArmorStatInvestments.includes(statType) ? 42 : 100;
  const internalValue = Math.min(value, maxValue);

  return (
    <View style={{ height: HEIGHT, flexDirection: "row", gap: 10 }}>
      <View style={{ height: 13, width: 160, alignSelf: "center" }}>
        <View style={{ flex: 1, backgroundColor: "white", opacity: 0.1 }} />
        <View
          style={{
            position: "absolute",
            width: (internalValue / maxValue) * 160,
            height: "100%",
            backgroundColor: "white",
          }}
        />
      </View>
      <Text style={styles.valueText}>{internalValue}</Text>
    </View>
  );
}

function isRocketSidearm(destinyItem: DestinyItem): boolean {
  const sockets = createSockets(destinyItem);
  if (!sockets) {
    return false;
  }
  return sockets.socketEntries?.[0]?.singleInitialItemHash === 2928496916;
}

function getStatsUiData(destinyItem: DestinyItem): UiStatData[] {
  if (destinyItem.def.itemType === ItemType.Armor) {
    return DefaultArmorStats;
  }
  if (destinyItem.def.itemType === ItemType.Weapon) {
    switch (destinyItem.def.itemSubType) {
      case ItemSubType.Glaive:
        return GlaiveWeaponStats;
      case ItemSubType.FusionRifle:
      case ItemSubType.FusionRifleLine:
        return FusionWeaponStats;
      case ItemSubType.Sword:
        return SwordWeaponStats;
      case ItemSubType.GrenadeLauncher:
      case ItemSubType.RocketLauncher:
        return ExplosiveWeaponStats;
      case ItemSubType.Bow:
        return BowWeaponStats;
      case ItemSubType.Sidearm: {
        if (isRocketSidearm(destinyItem)) {
          return RocketSidearmStats;
        }
        return DefaultWeaponStats;
      }
      default:
        return DefaultWeaponStats;
    }
  }
  return [];
}

const STAT_GAP = 8;

function getName(statType: StatType) {
  switch (statType) {
    case StatType.ArmorTotal:
      return "Total:";
    case StatType.Separator:
      return "";
    default:
      return DestinyStatDefinition?.[statType]?.displayProperties.name ?? "";
  }
}

type StatBarsProps = {
  readonly stats: ItemStats;
  readonly destinyItem: DestinyItem;
};

export default function StatBars({ stats, destinyItem }: StatBarsProps) {
  "use memo";
  const statUiData = getStatsUiData(destinyItem);
  const labels = statUiData.map((UiData) => {
    const name = getName(UiData.statType);

    return (
      <View
        key={UiData.statType}
        style={{
          height: UiData.statType === StatType.Separator ? STAT_GAP : HEIGHT,
          alignContent: "flex-end",
        }}
      >
        <Text style={styles.text}>{UiData.statType === StatType.Separator ? "" : name}</Text>
      </View>
    );
  });

  const bars = statUiData.map((UiData) => {
    const value = stats.get(UiData.statType) ?? 0;

    switch (UiData.type) {
      case "BAR":
        return <BarUi key={UiData.statType} value={value} statType={UiData.statType} />;
      case "NUMERAL":
        return <NumericUi key={UiData.statType} value={value} />;
      case "RECOIL":
        return <RecoilStat key={UiData.statType} value={Math.min(100, value)} />;
      case "SEPARATOR":
        return <View key={UiData.statType} style={{ height: STAT_GAP }} />;
      case "ARMOR-TOTAL":
        return <ArmorTotal key={UiData.statType} itemStats={stats} />;
      default:
        return <BarUi key={UiData.statType} value={value} statType={UiData.statType} />;
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

const styles = StyleSheet.create({
  text: {
    color: "white",
    fontSize: 14,
    includeFontPadding: false,
    top: 0,
    right: 5,
    pointerEvents: "none",
    position: "absolute",
  },
  valueText: {
    color: "white",
    fontSize: 14,
    fontWeight: "bold",
    includeFontPadding: false,
  },
});
