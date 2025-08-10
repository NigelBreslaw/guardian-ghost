import { useEffect, useRef } from "react";
import { StyleSheet, View, ScrollView } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import type { NavigationProp, RouteProp } from "@react-navigation/native";
import { useIsFocused } from "@react-navigation/native";
import BottomSheet, { BottomSheetView, useBottomSheetSpringConfigs } from "@gorhom/bottom-sheet";

import { useGGStore } from "@/app/store/GGStore.ts";
import { startTransfer } from "@/app/inventory/logic/Transfer.ts";
import { findDestinyItem } from "@/app/store/Account/AccountLogic";
import type { CharacterId } from "@/app/core/GetProfile.ts";
import Stats from "@/app/stats/Stats.tsx";
import type { RootStackParamList } from "@/app/Root.tsx";
import ScreenInfo from "@/app/inventory/pages/details/ScreenInfo.tsx";
import TransferEquipButtons from "@/app/inventory/pages/TransferEquipButtons.tsx";
import { ShowBottomSheet } from "@/app/store/SettingsSlice.ts";
import type { DestinyItem } from "@/app/inventory/logic/Types.ts";
import { ItemType } from "@/app/bungie/Enums.ts";

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

const BOTTOM_SHEET_COLOR = "black";

export default function DetailsView({ route, navigation }: Props) {
  "use memo";
  const insets = useSafeAreaInsets();
  const destinyItem = findDestinyItem(route.params);

  const bottomSheetRef = useRef<BottomSheet>(null);
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

  const animationConfigs = useBottomSheetSpringConfigs({
    mass: 20,
    damping: 80,
    duration: 250,
    dampingRatio: 0.8,
  });

  function dismissBottomSheet() {
    bottomSheetRef.current?.snapToIndex(0);
  }

  if (!destinyItem) {
    return null;
  }

  return (
    <View style={{ flex: 1 }}>
      <View style={{ flex: 1, paddingBottom: 80 }}>
        <ScrollView style={{}} keyboardShouldPersistTaps="always" onScrollBeginDrag={dismissBottomSheet}>
          {destinyItem && (
            <View>
              <ScreenInfo destinyItem={destinyItem} />
              <Stats destinyItem={destinyItem} />
            </View>
          )}
        </ScrollView>
      </View>

      {showBottomSheet(destinyItem) && <BottomSheet
        ref={bottomSheetRef}
        animationConfigs={animationConfigs}
        snapPoints={[60]}
        animateOnMount={false}
        index={useGGStore.getState().showNextBottomSheet === ShowBottomSheet.show ? 1 : 0}
        onChange={(e) => {
          if (e === 0) {
            useGGStore.getState().setShowBottomSheet(ShowBottomSheet.minimize);
          } else if (e === 1) {
            useGGStore.getState().setShowBottomSheet(ShowBottomSheet.show);
          }
        }}
        handleIndicatorStyle={{ backgroundColor: "gray" }}
        bottomInset={insets.bottom}
        backgroundStyle={{
          backgroundColor: BOTTOM_SHEET_COLOR,
        }}
      >
        <BottomSheetView style={styles.contentContainer}>
          <TransferEquipButtons
            close={() => {
              navigation.goBack();
            }}
            destinyItem={destinyItem}
            startTransfer={transfer}
          />
        </BottomSheetView>
      </BottomSheet>}
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
  container: {
    flex: 1,
    backgroundColor: "grey",
  },
  contentContainer: {
    flex: 1,
    alignItems: "center",
    backgroundColor: BOTTOM_SHEET_COLOR,
  },
});
