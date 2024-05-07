import { StatType } from "@/app/bungie/Enums.ts";
import { CategoryStyle, type SocketCategory } from "@/app/inventory/logic/Sockets.ts";
import { Image } from "expo-image";
import { View, StyleSheet } from "react-native";

const GAP = 10;
const styles = StyleSheet.create({
  container: {
    width: "100%",
    flexDirection: "row",
    gap: GAP,
  },
  text: {
    color: "white",
    fontSize: 15,
    fontWeight: "bold",
    includeFontPadding: false,
  },
  column: {
    flexDirection: "column",
    justifyContent: "flex-start",
    gap: GAP,
  },
});

// CREDIT: DIM for this article and code that collates information from their app,
// the community and info directly from Bungie.
// https://www.reddit.com/r/DestinyTheGame/comments/d8ahdl/dim_updates_stat_calculation_for_shadowkeep/

// Bankers rounding function. Used for all stats but magazine
// https://wiki.c2.com/?BankersRounding
function _bankersRounding(num: number): number {
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

function debug(socketCategory: SocketCategory) {
  const stats = new Map<number, number>();
  socketCategory.topLevelSockets.map((column, index) => {
    if (column) {
      column.map((e, index) => {
        if (e.socketDefinition?.investmentStats) {
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
  // console.log all the keys and values in stats
  for (const [key, value] of stats) {
    console.log(StatType[key], value);
  }
}

type ReusablePlugsProps = {
  socketCategory: SocketCategory;
};

export default function ReusablePlugs(props: ReusablePlugsProps) {
  debug(props.socketCategory);
  switch (props.socketCategory.categoryStyle) {
    case CategoryStyle.Reusable: {
      return (
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
      );
    }
    default: {
      return null;
    }
  }
}
