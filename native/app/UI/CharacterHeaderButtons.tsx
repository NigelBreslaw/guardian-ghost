import { Platform, View, StyleSheet } from "react-native";
import { Image } from "expo-image";
import { Pressable } from "react-native-gesture-handler";

import { useGGStore } from "@/app/store/GGStore.ts";
import Animated, {
  Extrapolation,
  interpolate,
  ReduceMotion,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";
import { useEffect } from "react";

const scale = 0.4;
const originalHeight = 96;
const borderRadius = 7;
const transferHeight = originalHeight * scale;
const paddingBottom = Platform.OS === "ios" ? 8 : 0;

export default function CharacterHeaderButtons() {
  "use memo";
  const ggCharacters = useGGStore((state) => state.ggCharacters);
  const currentListIndex = useGGStore((state) => state.currentListIndex);

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
    <Animated.View style={[viewAnimationStyle, { flexDirection: "row", gap: 10, paddingBottom }]}>
      {ggCharacters.map((ggCharacter, index) => {
        return (
          <Pressable
            onPress={() => useGGStore.getState().setJumpToIndex({ index, animate: true })}
            key={ggCharacter.characterId}
            style={({ pressed }) => (pressed ? styles.highlight : styles.pressable)}
          >
            <View
              style={{
                width: transferHeight,
                height: transferHeight,
                borderRadius,
                overflow: "hidden",
              }}
            >
              <View
                style={{
                  transformOrigin: "top left",
                  transform: [{ scale: scale }],
                }}
              >
                <Image source={ggCharacter.emblemPath} style={{ width: 96, height: 96 }} />
              </View>
              <View
                style={{
                  position: "absolute",
                  top: 0,
                  bottom: 0,
                  left: 0,
                  right: 0,
                  borderRadius,
                  borderWidth: 1,
                  borderColor: index === currentListIndex ? "white" : "#5B5B5B",
                }}
              />
            </View>
          </Pressable>
        );
      })}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  pressable: {
    borderWidth: StyleSheet.hairlineWidth,
  },
  highlight: {
    opacity: 0.8,
    borderWidth: StyleSheet.hairlineWidth,
  }
});