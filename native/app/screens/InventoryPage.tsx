import type { UiCell } from "@/app/inventory/Common.ts";
import { UiCellRenderItem } from "@/app/inventory/UiRowRenderItem.tsx";
import { calcCurrentListIndex } from "@/app/screens/Helpers.ts";
import { useGGStore } from "@/app/store/GGStore.ts";
import { debounce } from "@/app/utilities/Helpers.ts";
import { useIsFocused, useNavigation } from "@react-navigation/native";
import { FlashList } from "@shopify/flash-list";
import { useEffect, useRef } from "react";
import { StyleSheet, View, useWindowDimensions } from "react-native";
import { ScrollView } from "react-native-gesture-handler";

const pageColumns = [4, 4, 4, 5];
const pageEstimatedFlashListItemSize = [77, 77, 77, 89];

type InventoryPageProps = {
  inventoryPageData: UiCell[][];
};

export default function InventoryPage(props: InventoryPageProps) {
  const currentListIndex = useGGStore((state) => state.currentListIndex);
  const navigator = useNavigation();
  const { width } = useWindowDimensions();
  const HOME_WIDTH = width;

  const listRefs = useRef<(FlashList<UiCell> | null)[]>([]);
  const pagedScrollRef = useRef<ScrollView>(null);
  const isFocused = useIsFocused();

  const styles = StyleSheet.create({
    container: {},
    page: {
      flex: 1,
      width: HOME_WIDTH,
    },
  });

  const jumpToCharacter = () => {
    const posX = HOME_WIDTH * currentListIndex;
    pagedScrollRef.current?.scrollTo({ x: posX, y: 0, animated: false });
  };

  // biome-ignore lint/correctness/useExhaustiveDependencies: <This should only run when the view is focus>
  useEffect(() => {
    if (isFocused) {
      jumpToCharacter();
    }
  }, [isFocused]);

  function activateSheet(item: UiCell) {
    navigator.navigate("BottomSheet", { item });
  }

  // Keeps the non vault list in sync with each other. So if you scroll to energy weapons on guardian 1
  // when you horizontally scroll to guardian 2 you will see it's energy weapons too.
  function listMoved(toY: number) {
    if (currentListIndex === props.inventoryPageData.length - 1) {
      return;
    }

    for (let i = 0; i < listRefs.current.length; i++) {
      if (i === currentListIndex) {
        continue;
      }
      const lRef = listRefs.current[i];
      if (lRef) {
        lRef.scrollToOffset({ offset: toY, animated: false });
      }
    }
  }

  const debouncedMove = debounce(listMoved, 60);

  const renderItem = ({ item }: { item: UiCell }) => {
    return UiCellRenderItem({ item }, activateSheet);
  };

  const keyExtractor = (item: UiCell) => item.id;

  return (
    <ScrollView
      horizontal
      pagingEnabled
      scrollEventThrottle={32}
      onScroll={(e) => calcCurrentListIndex(e.nativeEvent.contentOffset.x, HOME_WIDTH)}
      ref={pagedScrollRef}
    >
      {props.inventoryPageData.map((list, index) => {
        return (
          // biome-ignore lint/suspicious/noArrayIndexKey: <Index is unique for each page in this case>
          <View key={index} style={styles.page}>
            <FlashList
              ref={(ref) => {
                listRefs.current[index] = ref;
              }}
              data={list}
              renderItem={renderItem}
              keyExtractor={keyExtractor}
              numColumns={pageColumns[index]}
              estimatedItemSize={pageEstimatedFlashListItemSize[index]}
              scrollEventThrottle={50}
              onScroll={(e) => {
                if (index === currentListIndex && index < props.inventoryPageData.length - 1) {
                  debouncedMove(e.nativeEvent.contentOffset.y);
                }
              }}
            />
          </View>
        );
      })}
    </ScrollView>
  );
}
