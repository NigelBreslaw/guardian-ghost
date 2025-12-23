import { Image } from "expo-image";
import { useEffect } from "react";
import Animated, {
  Extrapolation,
  interpolate,
  ReduceMotion,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";
import { View, StyleSheet } from "react-native";

import { useGGStore } from "@/app/store/GGStore.ts";

export default function InventoryHeader() {
  "use memo";
  const currentListIndex = useGGStore((state) => state.currentListIndex);
  const characterBackgroundEmblem = useGGStore((state) => state.ggCharacters[currentListIndex]?.secondarySpecial);
  const initialPageLoaded = useGGStore((state) => state.initialPageLoaded);

  const opacity = useSharedValue(0);
  const viewAnimationStyle = useAnimatedStyle(() => ({
    opacity: interpolate(opacity.value, [0, 1], [0, 1], Extrapolation.CLAMP),
  }));

  // biome-ignore lint/correctness/useExhaustiveDependencies: <This subscribes on mount>
  useEffect(() => {
    const unsubscribe = useGGStore.subscribe(
      (state) => state.initialPageLoaded,
      (initialPageLoaded, _previous) => {
        if (initialPageLoaded) {
          opacity.value = withSpring(1, {
            duration: 1250,
            reduceMotion: ReduceMotion.System,
          });
        }
      },
    );
    return unsubscribe;
  }, []);

  return (
    <View style={{ flex: 1 }}>
      <Animated.View style={[viewAnimationStyle, { flex: 1 }]}>
        <Image style={{ flex: 1 }} transition={initialPageLoaded ? 150 : 0} source={characterBackgroundEmblem} />
      </Animated.View>
      <View
        style={{
          width: "100%",
          height: StyleSheet.hairlineWidth,
          backgroundColor: "grey",
          position: "absolute",
          bottom: 0,
        }}
      />
    </View>
  );
}
