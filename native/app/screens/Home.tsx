import { NavigationProp } from "@react-navigation/native";
import { StyleSheet, View, useWindowDimensions } from "react-native";
import { ScrollView } from "react-native-gesture-handler";
import { FlashList } from "@shopify/flash-list";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useGlobalStateContext } from "@/app/state/GlobalState.tsx";
import { buildUIData } from "@/app/inventory/UiDataBuilder.ts";
import { UiRowRenderItem } from "@/app/inventory/UiRowRenderItem.tsx";
import { ITEM_SIZE, type UiRow } from "@/app/inventory/Common.ts";
import { useEffect, useState } from "react";

const p1 = performance.now();

export default function HomeScreen({ navigation }: { navigation: NavigationProp<ReactNavigation.RootParamList> }) {
  const globalState = useGlobalStateContext();
  const insets = useSafeAreaInsets();
  const { height, width } = useWindowDimensions();
  const HOME_WIDTH = width;

  const [listData, setListData] = useState<Array<Array<UiRow>>>([]);

  const homeStyles = StyleSheet.create({
    homeContainer: {
      paddingBottom: insets.bottom,
      backgroundColor: "#17101F",
    },
    page: {
      width: HOME_WIDTH,
      height: "100%",
    },
  });

  useEffect(() => {
    if (globalState.dataIsReady) {
      setListData(buildUIData());
    }
  }, [globalState.dataIsReady]);

  return (
    <ScrollView removeClippedSubviews={true} horizontal pagingEnabled style={homeStyles.homeContainer}>
      {listData.map((dataArray, index) => (
        // biome-ignore lint/suspicious/noArrayIndexKey: <Index is unique for each page in this case>
        <View key={index} style={[homeStyles.page]}>
          <FlashList
            estimatedItemSize={ITEM_SIZE}
            data={dataArray}
            renderItem={UiRowRenderItem}
            keyExtractor={(item) => item.id}
            getItemType={(item) => item.type}
          />
        </View>
      ))}
    </ScrollView>
  );
}
