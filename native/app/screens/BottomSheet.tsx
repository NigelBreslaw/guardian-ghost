import type { DestinyCell } from "@/app/inventory/Common.ts";
import { itemTypeDisplayName, itemsDefinition } from "@/app/store/Definitions.ts";
import { useGGStore } from "@/app/store/GGStore.ts";
import { itemSchema } from "@/app/store/Types";
import { findDestinyItem, transferItem } from "@/app/transfer/TransferLogic.ts";
import type { NavigationProp, RouteProp } from "@react-navigation/native";
import { Image } from "expo-image";
import { useEffect, useRef, useState } from "react";
import { StatusBar, StyleSheet, Text, View, useWindowDimensions } from "react-native";
import { Gesture, GestureDetector, GestureHandlerRootView } from "react-native-gesture-handler";
import RBSheet from "react-native-raw-bottom-sheet";
import { runOnJS } from "react-native-reanimated";
import { safeParse } from "valibot";

type ViewData = {
  itemInstanceId: string | undefined;
  itemTypeDisplayName: string;
  screenshot: string;
  name: string;
};

function buildViewData(itemInstanceId: string | undefined, itemHash: number): ViewData {
  const itemDef = safeParse(itemSchema, itemsDefinition[itemHash]);
  if (itemDef.success) {
    const screenshot = itemDef.output.s;
    const name = itemDef.output.n;
    const itd = itemDef.output.itd;

    const viewData: ViewData = {
      itemInstanceId,
      screenshot: screenshot ? `https://www.bungie.net/common/destiny2_content/screenshots/${screenshot}` : "",
      name: name ? name.toLocaleUpperCase() : "",
      itemTypeDisplayName: itd ? itemTypeDisplayName[itd]?.toLocaleUpperCase() ?? "" : "",
    };
    return viewData;
  }

  console.error("Failed to build view data", itemInstanceId, itemHash);
  return {
    itemInstanceId,
    screenshot: "",
    name: "",
    itemTypeDisplayName: "",
  };
}

type TransferEquipButtonsProps = {
  close: () => void;
  startTransfer: (toCharacterId: string, quantity: number, equipOnTarget: boolean) => void;
};

function TransferEquipButtons(props: TransferEquipButtonsProps) {
  const rectangles = [];

  const ggCharacters = useGGStore((state) => state.ggCharacters);
  const scale = 0.6;
  const originalWidth = 350;
  const originalHeight = 96;
  const transferWidth = originalWidth * scale;
  const transferHeight = originalHeight * scale;
  const borderRadius = 15;

  for (const ggCharacter of ggCharacters) {
    const transferTap = Gesture.Tap().onBegin(() => {
      runOnJS(props.startTransfer)(ggCharacter.characterId, 1, false);
      runOnJS(props.close)();
    });
    const transferAndEquipTap = Gesture.Tap().onBegin(() => {
      runOnJS(props.startTransfer)(ggCharacter.characterId, 1, true);
      runOnJS(props.close)();
    });

    rectangles.push(
      // style should make this a flex row
      <GestureHandlerRootView key={ggCharacter.characterId} style={{ flexDirection: "row" }}>
        <GestureDetector gesture={transferTap}>
          <View style={{ width: transferWidth, height: transferHeight, borderRadius, overflow: "hidden" }}>
            <View
              style={{
                width: originalWidth,

                overflow: "hidden",
                transformOrigin: "top left",
                transform: [{ scale: scale }],
              }}
            >
              <Image source={ggCharacter.emblemBackgroundPath} style={{ width: 474, height: 96 }} />
              <View style={[StyleSheet.absoluteFillObject, { flex: 1, alignContent: "center" }]}>
                <Text>Character: {ggCharacter.characterId}</Text>
              </View>
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
                borderColor: "grey",
              }}
            />
          </View>
        </GestureDetector>
        <GestureDetector gesture={transferAndEquipTap}>
          <View
            style={{
              width: transferHeight,
              height: transferHeight,
              borderRadius,
              overflow: "hidden",
              opacity: ggCharacter.characterId === "VAULT" ? 0 : 1,
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
                borderColor: "grey",
              }}
            />
          </View>
        </GestureDetector>
      </GestureHandlerRootView>,
    );
  }

  return rectangles;
}

export default function BottomSheet({
  navigation,
  route,
}: {
  navigation: NavigationProp<ReactNavigation.RootParamList>;
  route: RouteProp<ReactNavigation.RootParamList, "BottomSheet">;
}) {
  const refRBSheet = useRef<RBSheet>(null);
  const { width } = useWindowDimensions();
  const SCREEN_WIDTH = width;
  const { itemInstanceId, itemHash, characterId } = route.params.item as DestinyCell;
  const [viewData, _setViewData] = useState<ViewData>(buildViewData(itemInstanceId, itemHash));

  useEffect(() => {
    if (refRBSheet.current) {
      refRBSheet.current.open();
    }
  }, []);

  function startTransfer(targetId: string, quantity = 1, equipOnTarget = false) {
    const destinyItem = {
      ...findDestinyItem(itemInstanceId, itemHash, characterId),
    };
    transferItem(targetId, destinyItem, quantity, equipOnTarget);
  }

  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "transparent",
      }}
    >
      <StatusBar barStyle="light-content" />
      <RBSheet
        ref={refRBSheet}
        closeOnDragDown={true}
        closeOnPressMask={true}
        onClose={() => navigation.goBack()}
        height={600}
        customStyles={{
          wrapper: {
            backgroundColor: "transparent",
          },
          draggableIcon: {
            backgroundColor: "white",
          },
          container: {
            backgroundColor: "#111116",
          },
        }}
      >
        <View
          style={{
            width: "100%",
            height: (SCREEN_WIDTH / 1920) * 1080,
          }}
        >
          <Image
            transition={200}
            style={[
              {
                width: "100%",
                height: (SCREEN_WIDTH / 1920) * 1080,
              },
              StyleSheet.absoluteFillObject,
            ]}
            source={{ uri: viewData.screenshot }}
          />
          <View style={{ flex: 2 }} />
          <View style={{ flex: 4, flexDirection: "row" }}>
            <View style={{ flex: 1 }} />
            <View style={{ flex: 18 }}>
              <Text
                style={{
                  fontSize: 20,
                  fontWeight: "bold",
                  color: "white",
                  fontFamily: "Helvetica",
                  includeFontPadding: false,
                  lineHeight: 20,
                }}
              >
                {viewData.name}
              </Text>
              <Text
                style={{
                  fontSize: 13,
                  color: "white",
                  opacity: 0.6,
                  includeFontPadding: false,
                  transform: [{ translateY: -4 }],
                }}
              >
                {viewData.itemTypeDisplayName}
              </Text>
            </View>
          </View>
          <View style={{ flex: 15 }} />
          <View style={{ flex: 1 }}>
            <View style={{ flex: 1, backgroundColor: "#000000", opacity: 0.4 }} />
          </View>
        </View>
        <View>
          <TransferEquipButtons
            close={() => {
              if (refRBSheet.current) {
                refRBSheet.current.close();
              }
            }}
            startTransfer={startTransfer}
          />
        </View>
      </RBSheet>
    </View>
  );
}
