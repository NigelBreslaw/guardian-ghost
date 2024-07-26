import { View, StyleSheet } from "react-native";
import { useState } from "react";
import { TouchableWithoutFeedback } from "react-native-gesture-handler";

import Text from "@/app/UI/Text.tsx";
import { TierType } from "@/app/bungie/Enums.ts";
import type { SocketCategory, SocketEntry } from "@/app/inventory/logic/Sockets.ts";
import PerkCircle from "@/app/stats/PerkCircle.tsx";

type Props = {
  readonly socketCategory: SocketCategory;
};

export default function ReusablePlugs({ socketCategory }: Props) {
  "use memo";
  const [selectedPerk, setSelectedPerk] = useState<SocketEntry | null>(null);

  return (
    <View>
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
                    onPress={() => {
                      setSelectedPerk(e);
                    }}
                  />
                );
              })}
            </View>
          );
        })}
      </View>
      <View style={{ height: 10 }} />
      <TouchableWithoutFeedback onPress={() => setSelectedPerk(null)}>
        <View style={[styles.perkInfo, { height: 300, opacity: selectedPerk !== null ? 1 : 0 }]}>
          <View style={{ width: "100%", height: 2, backgroundColor: "#A9A9A9" }} />
          <View style={{ width: "100%", height: 2 }} />

          <View style={{ paddingLeft: 20, backgroundColor: "black" }}>
            <Text style={styles.perkInfoName}>{`${selectedPerk?.def?.name}`}</Text>
            <Text style={styles.perkInfoItemType}>{`${selectedPerk?.def?.itemTypeDisplayName}`}</Text>
            <View style={{ width: "100%", height: 2 }} />
          </View>
          <View style={{ width: "100%", height: 2 }} />

          <View style={{ paddingLeft: 20, backgroundColor: "#1C1C1D" }}>
            <View style={{ width: "100%", height: 5 }} />
            <Text style={styles.perkInfoDescription}>{`${selectedPerk?.def?.description}`}</Text>
            <View style={{ width: "100%", height: 5 }} />
          </View>
          <View style={{ height: 50 }} />
        </View>
      </TouchableWithoutFeedback>
    </View>
  );
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
  perkInfo: {},
  perkInfoName: {
    color: "white",
    fontSize: 15,
    fontWeight: "bold",
    includeFontPadding: false,
    textTransform: "uppercase",
    maxWidth: 200,
  },
  perkInfoItemType: {
    color: "#808080",
    fontSize: 12,
    includeFontPadding: false,
  },
  perkInfoDescription: {
    color: "white",
    fontSize: 13,
    includeFontPadding: false,
    maxWidth: 280,
  },
});
