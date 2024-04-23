import { InventoryPageEnums, type UISections } from "@/app/bungie/Common";
import { UiCellRenderItem } from "@/app/inventory/UiRowRenderItem.tsx";
import { useGGStore } from "@/app/store/GGStore.ts";
import { debounce } from "@/app/utilities/Helpers.ts";
import { useIsFocused } from "@react-navigation/native";
import { FlashList } from "@shopify/flash-list";
import { useCallback, useEffect, useRef } from "react";
import { StyleSheet, View, useWindowDimensions } from "react-native";
import { ScrollView } from "react-native-gesture-handler";

const pageEstimatedFlashListItemSize = [130, 130, 130, 200];

function calcCurrentListIndex(posX: number, PAGE_WIDTH: number) {
  const internalOffset = posX - PAGE_WIDTH / 2;
  let index = 0;
  if (posX > 0) {
    const newIndex = Math.ceil(internalOffset / PAGE_WIDTH);
    if (newIndex > 0) {
      index = newIndex;
    }
  }
  useGGStore.getState().setCurrentListIndex(index);
}

type InventoryPageProps = {
  inventoryPages: InventoryPageEnums;
};

const rootStyles = StyleSheet.create({
  root: {
    flex: 1,
    width: "100%",
    height: "100%",
  },
});

const keyExtractor = (item: UISections) => item.id;
const getItemType = (item: UISections) => item.type;

export default function InventoryPage(props: InventoryPageProps) {
  const currentListIndex = useGGStore((state) => state.currentListIndex);
  const { width } = useWindowDimensions();
  const HOME_WIDTH = width;

  const listRefs = useRef<(FlashList<UISections> | null)[]>([]);
  const pagedScrollRef = useRef<ScrollView>(null);
  const isFocused = useIsFocused();

  const styles = StyleSheet.create({
    container: {},
    page: {
      width: HOME_WIDTH,
      height: "100%",
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

  let lastOffsetY = 0;

  const listMoved = useCallback(
    (toY: number) => {
      if (lastOffsetY !== toY) {
        lastOffsetY = toY;
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
    },
    [currentListIndex, lastOffsetY],
  );

  const debouncedMove = debounce(listMoved, 40);
  const debounceListIndex = debounce(calcCurrentListIndex, 40);

  function getData(inventoryPage: InventoryPageEnums): UISections[][] | undefined {
    switch (inventoryPage) {
      case InventoryPageEnums.Armor:
        return useGGStore((state) => state.ggArmor);
      case InventoryPageEnums.General:
        return useGGStore((state) => state.ggGeneral);
      case InventoryPageEnums.Weapons:
        return useGGStore((state) => state.ggWeapons);
    }
  }

  const mainData = getData(props.inventoryPages) ?? [];

  return (
    <View style={rootStyles.root}>
      <ScrollView
        horizontal
        pagingEnabled
        scrollEventThrottle={32}
        onScroll={(e) => debounceListIndex(e.nativeEvent.contentOffset.x, HOME_WIDTH)}
        ref={pagedScrollRef}
      >
        {mainData.map((_c, index) => {
          return (
            // biome-ignore lint/suspicious/noArrayIndexKey: <Index is unique for each page in this case>
            <View key={index} style={styles.page}>
              <FlashList
                ref={(ref) => {
                  listRefs.current[index] = ref;
                }}
                data={mainData[index]}
                renderItem={UiCellRenderItem}
                keyExtractor={keyExtractor}
                estimatedItemSize={pageEstimatedFlashListItemSize[index]}
                getItemType={getItemType}
                scrollEventThrottle={16}
                showsVerticalScrollIndicator={false}
                onScroll={(e) => {
                  debouncedMove(e.nativeEvent.contentOffset.y);
                }}
              />
            </View>
          );
        })}
      </ScrollView>
    </View>
  );
}
