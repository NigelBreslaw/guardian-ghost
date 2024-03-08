import { NavigationProp } from "@react-navigation/native";
import { StyleSheet, View, useWindowDimensions } from "react-native";
import { ScrollView } from "react-native-gesture-handler";
import { FlashList } from "@shopify/flash-list";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useGlobalStateContext } from "@/app/state/GlobalState.tsx";
import { buildUIData } from "@/app/inventory/UiDataBuilder.ts";
import { UiCellRenderItem } from "@/app/inventory/UiRowRenderItem.tsx";
import { type UiCell } from "@/app/inventory/Common.ts";
import { useCallback, useEffect, useState } from "react";

const pageColumns = [4, 4, 4, 5];

export default function HomeScreen({ navigation }: { navigation: NavigationProp<ReactNavigation.RootParamList> }) {
  const globalState = useGlobalStateContext();
  const insets = useSafeAreaInsets();
  const { height, width } = useWindowDimensions();
  const HOME_WIDTH = width;

  const [listData, setListData] = useState<Array<Array<UiCell>>>([]);

  const homeStyles = StyleSheet.create({
    homeContainer: {
      paddingBottom: insets.bottom,
      backgroundColor: "#17101F",
    },
    page: {
      width: HOME_WIDTH,
    },
  });

  const onLoadListener = useCallback((info: { elapsedTimeInMs: number }) => {
    console.log("onLoadListener", info.elapsedTimeInMs);
  }, []);

  useEffect(() => {
    if (globalState.dataIsReady) {
      const UiData = buildUIData();
      setListData(UiData);
    }
  }, [globalState.dataIsReady]);

  return (
    <ScrollView horizontal pagingEnabled style={homeStyles.homeContainer}>
      {listData.map((list, index) => {
        return (
          // biome-ignore lint/suspicious/noArrayIndexKey: <Index is unique for each page in this case>
          <View key={index} style={[homeStyles.page]}>
            <FlashList
              estimatedItemSize={90}
              data={list}
              renderItem={UiCellRenderItem}
              keyExtractor={(item) => item.id}
              getItemType={(item) => item.type}
              numColumns={pageColumns[index]}
            />
          </View>
        );
      })}
    </ScrollView>
  );
}
