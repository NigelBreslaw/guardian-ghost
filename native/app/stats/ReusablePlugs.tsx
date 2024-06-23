import { View, StyleSheet, Text } from "react-native";

import { TierType } from "@/app/bungie/Enums.ts";
import type { SocketCategory, SocketEntry } from "@/app/inventory/logic/Sockets.ts";
import PerkCircle from "@/app/stats/PerkCircle.tsx";
import { useEffect, useState } from "react";
import Animated, {
  Extrapolation,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";
import { useGGStore } from "@/app/store/GGStore.ts";
import { TouchableWithoutFeedback } from "react-native-gesture-handler";

type Props = {
  readonly socketCategory: SocketCategory;
};

export default function ReusablePlugs({ socketCategory }: Props) {
  "use memo";
  const [selectedPerk, setSelectedPerk] = useState<SocketEntry | null>(null);
  const animatedHeight = useSharedValue(0);
  const transferButtonStyle = useAnimatedStyle(() => ({
    opacity: interpolate(animatedHeight.value, [0, 100], [0, 1], Extrapolation.CLAMP),
  }));

  const showingPerks = useGGStore((state) => state.showingPerks);
  useEffect(() => {
    if (showingPerks) {
      animatedHeight.value = withSpring(100, {
        duration: 400,
        dampingRatio: 1,
        stiffness: 100,
        overshootClamping: false,
        restDisplacementThreshold: 0.01,
        restSpeedThreshold: 2,
      });
    } else {
      animatedHeight.value = withSpring(0, {
        duration: 300,
        dampingRatio: 1,
        stiffness: 100,
      });
    }
  }, [showingPerks, animatedHeight]);

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
                    onPress={() => {
                      setSelectedPerk(e);
                      useGGStore.getState().showPerks(true);
                    }}
                  />
                );
              })}
            </View>
          );
        })}
      </View>
      <View style={{ height: 10 }} />
      <TouchableWithoutFeedback onPress={() => useGGStore.getState().showPerks(false)}>
        <Animated.View style={[styles.perkInfo, transferButtonStyle, { height: animatedHeight }]}>
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
        </Animated.View>
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
