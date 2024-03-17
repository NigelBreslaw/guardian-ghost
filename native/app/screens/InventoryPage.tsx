import type { UiCell } from "@/app/inventory/Common.ts";
import { buildUIData } from "@/app/inventory/UiDataBuilder.ts";
import { UiCellRenderItem } from "@/app/inventory/UiRowRenderItem.tsx";
import { useGlobalDispatchContext, useGlobalStateContext } from "@/app/state/GlobalState.tsx";
import { useIsFocused, useNavigation, useRoute } from "@react-navigation/native";
import { useEffect, useRef, useState } from "react";
import { FlatList, StyleSheet, View, useWindowDimensions } from "react-native";
import { ScrollView } from "react-native-gesture-handler";
import { debounce } from "@/app/utilities/Helpers.ts";

const pageColumns = [4, 4, 4, 4];

type InventoryPageProps = {
  itemBuckets: Array<number>;
};

export default function InventoryPage(props: InventoryPageProps) {
  const globalState = useGlobalStateContext();
  const globalDispatch = useGlobalDispatchContext();
  const navigator = useNavigation();
  const { width, height } = useWindowDimensions();
  const HOME_WIDTH = width;

  const [listData, setListData] = useState<Array<Array<UiCell>>>([]);
  const listRefs = useRef<(FlatList<UiCell> | null)[]>([]);
  const pagedScrollRef = useRef<ScrollView>(null);

  const isFocused = useIsFocused();
  const route = useRoute();

  const styles = StyleSheet.create({
    container: {},
    page: {
      flex: 1,
      width: HOME_WIDTH,
    },
  });

  const jumpToCharacter = () => {
    const posX = HOME_WIDTH * globalState.currentListIndex;
    pagedScrollRef.current?.scrollTo({ x: posX, y: 0, animated: false });
  };

  useEffect(() => {
    if (globalState.dataIsReady) {
      const UiData = buildUIData(props.itemBuckets);
      setListData(UiData);
    }
  }, [globalState.dataIsReady, props.itemBuckets]);

  // biome-ignore lint/correctness/useExhaustiveDependencies: <This should only run when the view is focus>
  useEffect(() => {
    if (isFocused) {
      jumpToCharacter();
    }
  }, [isFocused]);

  function activateSheet(itemInstanceIdArg: string | undefined, itemHashArg: number) {
    navigator.navigate("BottomSheet", { itemInstanceId: itemInstanceIdArg, itemHash: itemHashArg });
  }

  // Keeps the non vault list in sync with each other. So if you scroll to energy weapons on guardian 1
  // when you horizontally scroll to guardian 2 you will see it's energy weapons too.
  function listMoved(index: number, toY: number) {
    if (index === listData.length - 1) {
      return;
    }

    for (let i = 0; i < listRefs.current.length; i++) {
      if (i === index) {
        continue;
      }

      const lRef = listRefs.current[i];
      if (lRef) {
        lRef.scrollToOffset({ offset: toY, animated: false });
      }
    }
  }

  const debouncedMove = debounce(listMoved, 100);

  const calcCurrentListIndex = (posX: number) => {
    const LIST_WIDTH = HOME_WIDTH;
    let index = 0;
    if (posX > 0) {
      index = Math.floor(posX / LIST_WIDTH);
    }
    globalDispatch({ type: "setCurrentListIndex", payload: index });
  };

  const debouncedCalcCurrentListIndex = debounce(calcCurrentListIndex, 100);

  return (
    <ScrollView
      horizontal
      pagingEnabled
      scrollEventThrottle={32}
      onScroll={(e) => debouncedCalcCurrentListIndex(e.nativeEvent.contentOffset.x)}
      ref={pagedScrollRef}
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
              scrollEventThrottle={32}
              onScroll={(e) => {
                if (index < listData.length - 1) {
                  debouncedMove(index, e.nativeEvent.contentOffset.y);
                }
              }}
            />
          </View>
        );
      })}
    </ScrollView>
  );
}
