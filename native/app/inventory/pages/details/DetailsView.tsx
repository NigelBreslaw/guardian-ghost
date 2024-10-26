import { useEffect, useRef } from "react";
import { StyleSheet, View, ScrollView } from "react-native";
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

import Text from "@/app/UI/Text.tsx";
import { useGGStore } from "@/app/store/GGStore.ts";
import { startTransfer } from "@/app/inventory/logic/Transfer.ts";
import { findDestinyItem } from "@/app/store/Account/AccountLogic";
import type { CharacterId } from "@/app/core/GetProfile.ts";
import Stats from "@/app/stats/Stats.tsx";
import type { RootStackParamList } from "@/app/Root.tsx";
import ScreenInfo from "@/app/inventory/pages/details/ScreenInfo.tsx";
import TransferEquipButtons from "@/app/inventory/pages/TransferEquipButtons.tsx";
import type { DestinyItem } from "@/app/inventory/logic/Types.ts";
import { ItemType } from "@/app/bungie/Enums.ts";
import { ShowBottomSheet } from "@/app/store/SettingsSlice.ts";

function showBottomSheet(destinyItem: DestinyItem): boolean {
  if (destinyItem.def.itemType === ItemType.SeasonalArtifact) {
    return false;
  }
  return !(destinyItem.def.nonTransferrable && !destinyItem.def.equippable);
}

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
      if (destinyItem) {
        const maxQuantityToTransfer = useGGStore.getState().findMaxQuantityToTransfer(destinyItem);
        useGGStore.getState().setQuantityToTransfer(maxQuantityToTransfer);
      } else {
        navigation.goBack();
        useGGStore.getState().showSnackBar("Failed to find item");
      }
    }
  }, [focus, destinyItem, navigation]);

  function transfer(targetId: CharacterId, equipOnTarget = false) {
    const transferQuantity = useGGStore.getState().quantityToTransfer;
    if (destinyItem) {
      startTransfer(targetId, destinyItem, transferQuantity, equipOnTarget);
    }
  }

  // BottomSheet animation
  const opacity = useSharedValue(useGGStore.getState().showNextBottomSheet === ShowBottomSheet.show ? 1 : 0);
  const transferButtonStyle = useAnimatedStyle(() => ({
    opacity: interpolate(opacity.value, [0, 1], [0, 1], Extrapolation.CLAMP),
  }));
  const transferHintStyle = useAnimatedStyle(() => ({
    opacity: interpolate(opacity.value, [0, 1], [1, 0], Extrapolation.CLAMP),
  }));

  const BOTTOM_SHEET_COLOR = "black";

  function dismissBottomSheet() {
    bottomSheetRef.current?.snapToIndex(0);
  }

  if (!destinyItem) {
    return null;
  }

  return (
    <View style={{ flex: 1 }}>
      <ScrollView
        keyboardShouldPersistTaps="always"
        onScrollBeginDrag={dismissBottomSheet}
        onTouchEnd={() => {
          dismissBottomSheet();
        }}
      >
        {destinyItem && (
          <View style={{ height: "100%" }}>
            <ScreenInfo destinyItem={destinyItem} />
            <Stats destinyItem={destinyItem} />
          </View>
        )}
      </ScrollView>
      {showBottomSheet(destinyItem) && (
        <BottomSheet
          ref={bottomSheetRef}
          index={useGGStore.getState().showNextBottomSheet === ShowBottomSheet.show ? 1 : 0}
          onChange={(e) => {
            if (e === 0) {
              useGGStore.getState().setShowBottomSheet(ShowBottomSheet.minimize);
            } else if (e === 1) {
              useGGStore.getState().setShowBottomSheet(ShowBottomSheet.show);
            }
          }}
          enableDynamicSizing={false}
          snapPoints={snapPoints}
          animateOnMount={false}
          handleStyle={{
            backgroundColor: BOTTOM_SHEET_COLOR,
            borderRadius: 15,
          }}
          handleIndicatorStyle={{ backgroundColor: "white" }}
          backgroundStyle={{
            backgroundColor: BOTTOM_SHEET_COLOR,
          }}
          bottomInset={insets.bottom}
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
      <View
        style={{
          borderTopWidth: StyleSheet.hairlineWidth,
          borderColor: "grey",
          position: "absolute",
          width: "100%",
          backgroundColor: BOTTOM_SHEET_COLOR,
          height: insets.bottom,
          bottom: 0,
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  transferHint: {
    color: "white",
    fontSize: 15,
    fontWeight: "bold",
    includeFontPadding: false,
    paddingRight: 20,
  },
});
