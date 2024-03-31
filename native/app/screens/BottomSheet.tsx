import { itemTypeDisplayName, itemsDefinition } from "@/app/store/Definitions.ts";
import { useGGStore } from "@/app/store/GGStore.ts";
import { itemSchema } from "@/app/store/Types";
import type { NavigationProp, RouteProp } from "@react-navigation/native";
import { Image } from "expo-image";
import { useEffect, useRef, useState } from "react";
import { StatusBar, StyleSheet, Text, View, useWindowDimensions } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
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
};

function TransferEquipButtons(props: TransferEquipButtonsProps) {
  const rectangles = [];

  const ggCharacters = useGGStore((state) => state.ggCharacters);
  const scale = 0.6;
  const originalWidth = 350;
  const originalHeight = 96;
  const width = originalWidth * scale;
  const height = originalHeight * scale;
  const borderRadius = 15;

  for (const ggCharacter of ggCharacters) {
    const tap = Gesture.Tap().onBegin(() => {
      console.log(ggCharacter.characterId);
      runOnJS(props.close)();
    });

    rectangles.push(
      <GestureDetector gesture={tap} key={ggCharacter.characterId}>
        <View style={{ width, height, borderRadius, overflow: "hidden" }}>
          <View
            style={{
              width: originalWidth,

              overflow: "hidden",
              transformOrigin: "top left",
              transform: [{ scale: scale }],
            }}
          >
            <Image source={ggCharacter.emblemBackgroundPath} style={{ width: 474, height: 96 }}>
              <Text>Character: {ggCharacter.characterId}</Text>
            </Image>
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
      </GestureDetector>,
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
  const { itemInstanceId, itemHash } = route.params;
  const [viewData, _setViewData] = useState<ViewData>(buildViewData(itemInstanceId, itemHash));

  useEffect(() => {
    if (refRBSheet.current) {
      refRBSheet.current.open();
    }
  }, []);

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
          />
        </View>
      </RBSheet>
    </View>
  );
}
