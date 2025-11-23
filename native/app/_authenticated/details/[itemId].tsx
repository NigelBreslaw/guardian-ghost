import { useEffect, useRef } from "react";
import { StyleSheet, View, ScrollView } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useIsFocused } from "@react-navigation/native";
import BottomSheet, { BottomSheetView, useBottomSheetSpringConfigs } from "@gorhom/bottom-sheet";
import { Stack } from "expo-router";

import { useGGStore } from "@/app/store/GGStore.ts";
import { startTransfer } from "@/app/inventory/logic/Transfer.ts";
import { findDestinyItem } from "@/app/store/Account/AccountLogic";
import type { CharacterId } from "@/app/core/GetProfile.ts";
import Stats from "@/app/stats/Stats.tsx";
import ScreenInfo from "@/app/inventory/pages/details/ScreenInfo.tsx";
import TransferEquipButtons from "@/app/inventory/pages/TransferEquipButtons.tsx";
import { ShowBottomSheet } from "@/app/store/SettingsSlice.ts";
import type { DestinyItem } from "@/app/inventory/logic/Types.ts";
import { ItemType } from "@/app/bungie/Enums.ts";
import type { DestinyItemIdentifier } from "@/app/inventory/logic/Helpers.ts";

function showBottomSheet(destinyItem: DestinyItem): boolean {
  if (destinyItem.def.itemType === ItemType.SeasonalArtifact) {
    return false;
  }
  return !(destinyItem.def.nonTransferrable && !destinyItem.def.equippable);
}

const BOTTOM_SHEET_COLOR = "black";

export default function DetailsView() {
  "use memo";
  const router = useRouter();
  const params = useLocalSearchParams<{ itemId: string }>();
  const insets = useSafeAreaInsets();
  const bottomSheetRef = useRef<BottomSheet>(null);
  const focus = useIsFocused();

  // Parse the itemId parameter back to DestinyItemIdentifier
  // The itemId is passed as a JSON string, URL encoded
  let itemIdentifier: DestinyItemIdentifier | null = null;
  try {
    const decodedItemId = decodeURIComponent(params.itemId);
    itemIdentifier = JSON.parse(decodedItemId) as DestinyItemIdentifier;
  } catch {
    // Error handling moved to useEffect to avoid early return before hooks
  }

  const destinyItem = itemIdentifier ? findDestinyItem(itemIdentifier) : null;

  useEffect(() => {
    if (!itemIdentifier) {
      router.back();
      useGGStore.getState().showSnackBar("Invalid item identifier");
      return;
    }
    if (focus) {
      if (destinyItem) {
        const maxQuantityToTransfer = useGGStore.getState().findMaxQuantityToTransfer(destinyItem);
        useGGStore.getState().setQuantityToTransfer(maxQuantityToTransfer);
      } else {
        router.back();
        useGGStore.getState().showSnackBar("Failed to find item");
      }
    }
  }, [focus, destinyItem, router, itemIdentifier]);

  const animationConfigs = useBottomSheetSpringConfigs({
    mass: 20,
    damping: 80,
    duration: 250,
    dampingRatio: 0.8,
  });

  function dismissBottomSheet() {
    bottomSheetRef.current?.close();
  }

  function transfer(characterId: CharacterId) {
    if (destinyItem) {
      const transferQuantity = useGGStore.getState().quantityToTransfer;
      startTransfer(characterId, destinyItem, transferQuantity);
      router.back();
    }
  }

  if (!destinyItem) {
    return null;
  }

  return (
    <>
      <Stack.Screen
        options={{
          headerBackTitle: "Back",
          headerStyle: {
            backgroundColor: "#17101F",
          },
          headerTintColor: "white",
        }}
      />
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

        {showBottomSheet(destinyItem) && (
          <BottomSheet
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
                  router.back();
                }}
                destinyItem={destinyItem}
                startTransfer={transfer}
              />
            </BottomSheetView>
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
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    flex: 1,
    alignItems: "center",
  },
});
