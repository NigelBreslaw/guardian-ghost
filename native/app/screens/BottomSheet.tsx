import type { NavigationProp, RouteProp } from "@react-navigation/native";
import { useEffect, useRef, useState } from "react";
import { View, Text, useWindowDimensions, StyleSheet, StatusBar } from "react-native";
import { Image } from "expo-image";
import RBSheet from "react-native-raw-bottom-sheet";
import DataService from "@/app/core/DataService.ts";
import { safeParse } from "valibot";
import { itemSchema } from "@/app/core/Types.ts";

type ViewData = {
  itemInstanceId: string;
  screenshot: string;
  name: string;
};

function buildViewData(itemInstanceId: string, itemHash: number): ViewData {
  const p1 = performance.now();
  const itemDef = safeParse(itemSchema, DataService.itemDefinition.items[itemHash]);
  if (itemDef.success) {
    const screenshot = itemDef.output.s;
    const name = itemDef.output.n;

    const viewData: ViewData = {
      itemInstanceId,
      screenshot: screenshot ? `https://www.bungie.net/common/destiny2_content/screenshots/${screenshot}` : "",
      name: name ? name.toLocaleUpperCase() : "",
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
  };
}

export default function BottomSheet({
  navigation,
  route,
}: {
  navigation: NavigationProp<ReactNavigation.RootParamList>;
  route: RouteProp<ReactNavigation.RootParamList, "BottomSheet">;
}) {
  const refRBSheet = useRef<RBSheet | null>();
  const { width } = useWindowDimensions();
  const SCREEN_WIDTH = width;
  const { itemInstanceId, itemHash } = route.params;
  const [viewData, setViewData] = useState<ViewData>(buildViewData(itemInstanceId, itemHash));

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
        ref={(ref) => {
          refRBSheet.current = ref;
        }}
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
          <View style={{ flex: 2, flexDirection: "row" }}>
            <View style={{ flex: 1 }} />
            <Text style={{ fontSize: 20, fontWeight: "bold", color: "white" }}>{viewData.name}</Text>
            <View style={{ flex: 20 }} />
          </View>
          <View style={{ flex: 18 }} />
          <View style={{ flex: 1 }}>
            <View style={{ flex: 1, backgroundColor: "#000000", opacity: 0.4 }} />
          </View>
        </View>
      </RBSheet>
    </View>
  );
}
