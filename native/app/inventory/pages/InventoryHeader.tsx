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
    const checkAndShow = () => {
      const initialPageLoaded = useGGStore.getState().initialPageLoaded;
      const ggCharacters = useGGStore.getState().ggCharacters;
      const currentIndex = useGGStore.getState().currentListIndex;
      const emblem = ggCharacters[currentIndex]?.secondarySpecial;
      if (initialPageLoaded && ggCharacters.length > 0 && emblem) {
        opacity.value = withSpring(1, {
          duration: 1250,
          reduceMotion: ReduceMotion.System,
        });
      }
    };

    // Check initial state
    checkAndShow();

    // Subscribe to initialPageLoaded, ggCharacters, and currentListIndex changes
    const unsubscribe1 = useGGStore.subscribe(
      (state) => state.initialPageLoaded,
      () => {
        checkAndShow();
      },
    );

    const unsubscribe2 = useGGStore.subscribe(
      (state) => state.ggCharacters,
      () => {
        checkAndShow();
      },
    );

    const unsubscribe3 = useGGStore.subscribe(
      (state) => state.currentListIndex,
      () => {
        checkAndShow();
      },
    );

    return () => {
      unsubscribe1();
      unsubscribe2();
      unsubscribe3();
    };
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
