import { useEffect, useRef } from "react";
import { StyleSheet, Text, View, Platform, ScrollView } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import type { NavigationProp, RouteProp } from "@react-navigation/native";
import { useIsFocused } from "@react-navigation/native";
import BottomSheet from "@gorhom/bottom-sheet";
import Animated, {
  Extrapolation,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";
import { TouchableOpacity } from "react-native-gesture-handler";

import { useGGStore } from "@/app/store/GGStore.ts";
import { startTransfer } from "@/app/inventory/logic/Transfer.ts";
import { findDestinyItem } from "@/app/store/AccountLogic.ts";
import type { CharacterId } from "@/app/core/GetProfile.ts";
import Stats from "@/app/stats/Stats.tsx";
import type { RootStackParamList } from "@/app/Root.tsx";
import ScreenInfo from "@/app/inventory/pages/details/ScreenInfo.tsx";
import TransferEquipButtons from "@/app/inventory/pages/TransferEquipButtons.tsx";

type Props = {
  readonly route: RouteProp<RootStackParamList, "Details">;
  readonly navigation: NavigationProp<ReactNavigation.RootParamList>;
};

export default function DetailsView({ route, navigation }: Props) {
  "use memo";
  const insets = useSafeAreaInsets();
  const destinyItem = findDestinyItem(route.params);

  const bottomSheetRef = useRef<BottomSheet>(null);
  const snapPoints = [60, 300];
  const focus = useIsFocused();

  useEffect(() => {
    if (focus) {
      const maxQuantityToTransfer = useGGStore.getState().findMaxQuantityToTransfer(destinyItem);
      useGGStore.getState().setQuantityToTransfer(maxQuantityToTransfer);
    }
  }, [focus, destinyItem]);

  function transfer(targetId: CharacterId, equipOnTarget = false) {
    const transferQuantity = useGGStore.getState().quantityToTransfer;
    if (destinyItem) {
      startTransfer(targetId, destinyItem, transferQuantity, equipOnTarget);
    }
  }

  // BottomSheet animation
  const opacity = useSharedValue(1);
  const transferButtonStyle = useAnimatedStyle(() => ({
    opacity: interpolate(opacity.value, [0, 1], [0, 1], Extrapolation.CLAMP),
  }));
  const transferHintStyle = useAnimatedStyle(() => ({
    opacity: interpolate(opacity.value, [0, 1], [1, 0], Extrapolation.CLAMP),
  }));

  if (!destinyItem) {
    return null;
  }

  return (
    <View style={{ flex: 1, marginBottom: insets.bottom }}>
      <ScrollView keyboardShouldPersistTaps="always">
        {destinyItem && (
          <View style={{ height: "100%" }}>
            <ScreenInfo destinyItem={destinyItem} />
            <Stats destinyItem={destinyItem} />
            {Platform.OS === "web" && (
              <View>
                <TransferEquipButtons
                  close={() => {
                    navigation.goBack();
                  }}
                  destinyItem={destinyItem}
                  startTransfer={transfer}
                />
              </View>
            )}
          </View>
        )}
      </ScrollView>
      {Platform.OS !== "web" && (
        <BottomSheet
          ref={bottomSheetRef}
          index={1}
          snapPoints={snapPoints}
          animateOnMount={false}
          handleStyle={{ backgroundColor: "black" }}
          handleIndicatorStyle={{ backgroundColor: "white" }}
          backgroundStyle={{ backgroundColor: "#17101F" }}
          onAnimate={(_a, b) => {
            opacity.value = withSpring(b);
          }}
        >
          <View>
            <Animated.View style={[transferButtonStyle]}>
              <TransferEquipButtons
                close={() => {
                  navigation.goBack();
                }}
                destinyItem={destinyItem}
                startTransfer={transfer}
              />
            </Animated.View>
            <Animated.View
              style={[transferHintStyle, { width: "100%", position: "absolute", top: 0, alignItems: "flex-end" }]}
            >
              <TouchableOpacity onPress={() => bottomSheetRef.current?.snapToIndex(1)}>
                <Text style={styles.transferHint}>Transfer</Text>
              </TouchableOpacity>
            </Animated.View>
          </View>
        </BottomSheet>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  transferHint: {
    color: "white",
    fontSize: 15,
    padding: 10,
    fontWeight: "bold",
    includeFontPadding: false,
  },
});
