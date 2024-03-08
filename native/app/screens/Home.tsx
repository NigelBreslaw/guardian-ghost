import { NavigationProp } from "@react-navigation/native";
import { StyleSheet, View, useWindowDimensions } from "react-native";
import { ScrollView } from "react-native-gesture-handler";
import { FlashList } from "@shopify/flash-list";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useGlobalStateContext } from "@/app/state/GlobalState.tsx";
import { buildUIData } from "@/app/inventory/UiDataBuilder.ts";
import { UiRowRenderItem } from "@/app/inventory/UiRowRenderItem.tsx";
import { ITEM_SIZE, UiRowType, type UiRow, SEPARATOR_SIZE } from "@/app/inventory/Common.ts";
import { useCallback, useEffect, useState } from "react";

function getListSizes(UiData: Array<Array<UiRow>>): Array<number> {
  const listSizes = [];
  for (const row of UiData) {
    let size = 0;

    for (const item of row) {
      if (item.type === UiRowType.Header) {
        size += SEPARATOR_SIZE;
      } else {
        size += ITEM_SIZE;
      }
    }
    listSizes.push(size);
  }
  return listSizes;
}

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
      {listData.map((dataArray, index) => {
        return (
          // biome-ignore lint/suspicious/noArrayIndexKey: <Index is unique for each page in this case>
          <View key={index} style={[homeStyles.page]}>
            <FlashList
              estimatedItemSize={88}
              data={dataArray}
              renderItem={UiRowRenderItem}
              keyExtractor={(item) => item.id}
              getItemType={(item) => item.type}
              onLoad={onLoadListener}
            />
          </View>
        );
      })}
    </ScrollView>
  );
}
