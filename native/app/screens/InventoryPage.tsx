import type { UiCell } from "@/app/inventory/Common.ts";
import { buildUIData } from "@/app/inventory/UiDataBuilder.ts";
import { UiCellRenderItem } from "@/app/inventory/UiRowRenderItem.tsx";
import { useGlobalStateContext } from "@/app/state/GlobalState.tsx";
import { useNavigation } from "@react-navigation/native";
import { useEffect, useRef, useState } from "react";
import { FlatList, StyleSheet, View, useWindowDimensions } from "react-native";
import { ScrollView } from "react-native-gesture-handler";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const pageColumns = [4, 4, 4, 4];

type InventoryPageProps = {
  itemBuckets: Array<number>;
};

export default function InventoryPage(props: InventoryPageProps) {
  const globalState = useGlobalStateContext();
  const navigator = useNavigation();
  const insets = useSafeAreaInsets();
  const { height, width } = useWindowDimensions();
  const HOME_WIDTH = width;

  const [listData, setListData] = useState<Array<Array<UiCell>>>([]);
  const [characterScrollPosition, setCharacterScrollPosition] = useState<number>(0);
  const listRefs = useRef<(FlatList<UiCell> | null)[]>([]);

  const styles = StyleSheet.create({
    container: {},
    page: {
      flex: 1,
      width: HOME_WIDTH,
    },
  });

  useEffect(() => {
    if (globalState.dataIsReady) {
      const UiData = buildUIData(props.itemBuckets);
      setListData(UiData);
    }
  }, [globalState.dataIsReady, props.itemBuckets]);

  function activateSheet(itemInstanceId: string) {
    console.log("activateSheet", itemInstanceId);
    navigator.navigate("BottomSheet" as never);
  }

  return (
    <ScrollView
      horizontal
      pagingEnabled
      scrollEventThrottle={0}
      onScroll={(e) => {
        // Don't tell the vault to change position. Its always the last ref in the array.
        for (let i = 0; i < listRefs.current.length - 1; i++) {
          const lRef = listRefs.current[i];
          if (lRef) {
            lRef.scrollToOffset({ offset: characterScrollPosition, animated: false });
          }
        }
      }}
    >
      {listData.map((list, index) => {
        return (
          // biome-ignore lint/suspicious/noArrayIndexKey: <Index is unique for each page in this case>
          <View key={index} style={styles.page}>
            <FlatList
              ref={(ref) => {
                listRefs.current[index] = ref;
              }}
              data={list}
              renderItem={({ item }) => UiCellRenderItem({ item }, activateSheet)}
              keyExtractor={(item) => item.id}
              numColumns={pageColumns[index]}
              scrollEventThrottle={34}
              onScroll={(e) => {
                if (index < listData.length - 1) {
                  setCharacterScrollPosition(e.nativeEvent.contentOffset.y);
                }
              }}
            />
          </View>
        );
      })}
    </ScrollView>
  );
}
