import { View, StyleSheet, Text } from "react-native";

import { TierType } from "@/app/bungie/Enums.ts";
import { CategoryStyle, type SocketCategory } from "@/app/inventory/logic/Sockets.ts";
import PerkCircle from "@/app/stats/PerkCircle.tsx";

type Props = {
  readonly socketCategory: SocketCategory;
};

export default function ReusablePlugs({ socketCategory }: Props) {
  switch (socketCategory.categoryStyle) {
    case CategoryStyle.Reusable: {
      return (
        <View style={styles.root}>
          <Text style={styles.text}>{`${socketCategory.name}`}</Text>
          <View style={styles.container}>
            {socketCategory.topLevelSockets.map((column, index) => {
              // Don't draw columns with no icons
              const valid = column.some((e) => e.def?.icon);
              if (!valid) {
                return null;
              }
              return (
                // biome-ignore lint/suspicious/noArrayIndexKey: <explanation>
                <View key={index} style={styles.column}>
                  {column.map((e, index) => {
                    return (
                      <PerkCircle
                        // biome-ignore lint/suspicious/noArrayIndexKey: <explanation>
                        key={index}
                        icon={e.def?.icon}
                        isEnabled={e.isEnabled}
                        isEnhanced={e.def?.tierType === TierType.Common}
                      />
                    );
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
