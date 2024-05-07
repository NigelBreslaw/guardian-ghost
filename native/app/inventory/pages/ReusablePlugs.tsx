import { StatType } from "@/app/bungie/Enums.ts";
import { CategoryStyle, type SocketCategory } from "@/app/inventory/logic/Sockets.ts";
import type { DestinyItem } from "@/app/inventory/logic/Types.ts";
import { DestinyStatGroupDefinition } from "@/app/store/Definitions.ts";
import { Image } from "expo-image";
import { View, StyleSheet, Text } from "react-native";

const styles = StyleSheet.create({
  root: {},
  container: {
    paddingLeft: 20,
    flexDirection: "row",
    gap: 15,
  },
  text: {
    color: "white",
    fontSize: 15,
    fontWeight: "bold",
    includeFontPadding: false,
    height: 30,
    paddingLeft: 20,
  },
  column: {
    flexDirection: "column",
    justifyContent: "flex-start",
    gap: 10,
  },
});

// CREDIT: DIM for this article and code that collates information from their app,
// the community and info directly from Bungie.
// https://www.reddit.com/r/DestinyTheGame/comments/d8ahdl/dim_updates_stat_calculation_for_shadowkeep/

// Bankers rounding function. Used for all stats but magazine
// https://wiki.c2.com/?BankersRounding
function bankersRounding(num: number): number {
  if (Math.abs(Math.round(num) - num) === 0.5) {
    return Math.floor(num) % 2 === 0 ? Math.floor(num) : Math.ceil(num);
  }
  return Math.round(num);
}

type PerkCircleProps = {
  icon: string | undefined;
  isEnabled: boolean;
};

function PerkCircle(props: PerkCircleProps) {
  return (
    <View
      style={{
        width: 40,
        height: 40,
        borderWidth: 1,
        borderColor: "white",
        borderRadius: 25,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: props.isEnabled ? "#5791BD" : "transparent",
      }}
    >
      <Image source={props.icon} style={{ width: 30, height: 30 }} />
    </View>
  );
}

function debug(destinyItem: DestinyItem, socketCategory: SocketCategory) {
  const p1 = performance.now();
  const stats = new Map<number, number>();

  destinyItem.def.investmentStats.map((stat) => {
    stats.set(stat.statTypeHash, stat.value);
  });

  socketCategory.topLevelSockets.map((column) => {
    if (column) {
      column.map((e) => {
        if (e.isEnabled && e.socketDefinition?.investmentStats) {
          e.socketDefinition.investmentStats.map((stat) => {
            if (stats.has(stat.statTypeHash)) {
              const currentValue = stats.get(stat.statTypeHash) ?? 0;
              stats.set(stat.statTypeHash, currentValue + stat.value);
            } else {
              stats.set(stat.statTypeHash, stat.value);
            }
          });
        }
      });
    }
  });

  // const statsGroupData = buildStatsInterpolationData(destinyItem.def.statGroupHash);
  // console.log("StatGroupHash", destinyItem.def.statGroupHash);
  const foo: Record<string, number> = {};
  for (const [key, value] of stats) {
    const keyName = StatType[key];
    const newValue = interpolateStatValue(value, key, destinyItem.def.statGroupHash);
    if (keyName) {
      foo[keyName] = newValue;
    }
  }
  const p2 = performance.now();
  console.log("debug", `${(p2 - p1).toFixed(4)} ms`);
  console.log(foo);
}
// log generic map

export function interpolateStatValue(value: number, investment: number, socketTypeHash: number) {
  // right now, we are not doing stat interpolation for armor.
  // they're 1:1 in effects, and we are ignoring the clamping
  // if (armorStats.includes(statDisplay.statHash)) {
  //   return value;
  // }
  const fullData = buildStatsInterpolationData(socketTypeHash);
  const statData = fullData.get(investment);
  if (!statData) {
    return value;
  }
  const interpolation = statData.displayInterpolation;
  // Clamp the value to prevent overfilling
  const v = Math.min(value, statData.maximumValue);

  let endIndex = interpolation.findIndex((p) => p.value > v);

  // value < 0 is for mods with negative stats
  if (endIndex < 0) {
    endIndex = interpolation.length - 1;
  }
  const startIndex = Math.max(0, endIndex - 1);

  const start = interpolation[startIndex]!;
  const end = interpolation[endIndex]!;
  const range = end.value - start.value;
  if (range === 0) {
    return start.weight;
  }

  const t = (value - start.value) / (end.value - start.value);

  const interpolationValue = start.weight + t * (end.weight - start.weight);

  // vthorn has a hunch that magazine size doesn't use banker's rounding, but the rest definitely do:
  // https://github.com/Bungie-net/api/issues/1029#issuecomment-531849137
  return investment === StatType.Magazine ? Math.round(interpolationValue) : bankersRounding(interpolationValue);
}

function _logMap(map: Map<number, displayInterpolation>) {
  const o: Record<string, displayInterpolation> = {};
  for (const [key, value] of map) {
    const keyName = StatType[key];
    if (keyName) {
      o[keyName] = value;
    }
  }
  console.log(o);
}

type displayInterpolation = {
  maximumValue: number;
  displayInterpolation: { value: number; weight: number }[];
};

function buildStatsInterpolationData(socketTypeHash: number) {
  const statGroupDefinition = DestinyStatGroupDefinition[socketTypeHash]?.scaledStats;
  const statData = new Map<number, displayInterpolation>();

  if (!statGroupDefinition) {
    console.error("No statGroupDefinition found");
    return statData;
  }

  for (const stat of statGroupDefinition) {
    const statHash = stat.statHash;
    const maximumValue = stat.maximumValue;
    const table = stat.displayInterpolation;
    const data = {
      maximumValue,
      displayInterpolation: table,
    };
    statData.set(statHash, data);
  }

  return statData;
}

type ReusablePlugsProps = {
  socketCategory: SocketCategory;

  item: DestinyItem;
};

export default function ReusablePlugs(props: ReusablePlugsProps) {
  switch (props.socketCategory.categoryStyle) {
    case CategoryStyle.Reusable: {
      debug(props.item, props.socketCategory);
      return (
        <View style={styles.root}>
          <Text style={styles.text}>{`${props.socketCategory.name}`}</Text>
          <View style={styles.container}>
            {props.socketCategory.topLevelSockets.map((column, index) => {
              return (
                // biome-ignore lint/suspicious/noArrayIndexKey: <explanation>
                <View key={index} style={styles.column}>
                  {column.map((e, index) => {
                    // biome-ignore lint/suspicious/noArrayIndexKey: <explanation>
                    return <PerkCircle key={index} icon={e.socketDefinition?.icon} isEnabled={e.isEnabled} />;
                  })}
                </View>
              );
            })}
          </View>
        </View>
      );
    }
    default: {
      return null;
    }
  }
}
