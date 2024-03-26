import { itemSchema } from "@/app/store/Types";
import { useGGStore } from "@/app/store/GGStore.ts";
import type { NavigationProp, RouteProp } from "@react-navigation/native";
import { Image } from "expo-image";
import { useEffect, useRef, useState } from "react";
import { StatusBar, StyleSheet, Text, View, useWindowDimensions } from "react-native";
import RBSheet from "react-native-raw-bottom-sheet";
import { safeParse } from "valibot";

type ViewData = {
  itemInstanceId: string | undefined;
  itemTypeDisplayName: string;
  screenshot: string;
  name: string;
};

function buildViewData(itemInstanceId: string | undefined, itemHash: number): ViewData {
  const p1 = performance.now();
  const itemDef = safeParse(itemSchema, useGGStore.getState().itemDefinition?.items[itemHash]);
  if (itemDef.success) {
    const screenshot = itemDef.output.s;
    const name = itemDef.output.n;
    const itd = itemDef.output.itd;

    const viewData: ViewData = {
      itemInstanceId,
      screenshot: screenshot ? `https://www.bungie.net/common/destiny2_content/screenshots/${screenshot}` : "",
      name: name ? name.toLocaleUpperCase() : "",
      itemTypeDisplayName: itd ? useGGStore.getState().itemTypeDisplayName[itd]?.toLocaleUpperCase() ?? "" : "",
    };

    const p2 = performance.now();
    console.log("buildViewData took:", (p2 - p1).toFixed(4), "ms");
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
        height={500}
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
      </RBSheet>
    </View>
  );
}
