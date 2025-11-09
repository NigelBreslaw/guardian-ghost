import { useFocusEffect } from "@react-navigation/native";
import { FlashList, type FlashListRef } from "@shopify/flash-list";
import { useEffect, useRef, useState } from "react";
import { Platform, RefreshControl, ScrollView, StyleSheet, View, useWindowDimensions } from "react-native";
import { useBottomTabBarHeight } from "react-native-bottom-tabs";

import { getFullProfile } from "@/app/bungie/BungieApi.ts";
import type { InventoryPageEnums, UISections } from "@/app/inventory/logic/Helpers.ts";
import { useGGStore } from "@/app/store/GGStore.ts";
import { debounce } from "@/app/utilities/Helpers.ts";
import { UiCellRenderItem } from "@/app/inventory/UiRowRenderItem.tsx";

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

type Props = {
  readonly inventoryPageEnum: InventoryPageEnums;
};

const keyExtractor = (item: UISections) => item.id;
const getItemType = (item: UISections) => item.type;

export default function InventoryPage({ inventoryPageEnum }: Props) {
  "use memo";
  const { width } = useWindowDimensions();
  const tabBarHeight = useBottomTabBarHeight();
  const bottomPadding = Platform.OS === "ios" ? tabBarHeight : 0;
  const HOME_WIDTH = width;

  const listRefs = useRef<(FlashListRef<UISections> | null)[]>([]);
  const pagedScrollRef = useRef<ScrollView>(null);

  const pageData = useGGStore((state) => state.getPageData(inventoryPageEnum));
  const pullRefreshing = useGGStore((state) => state.pullRefreshing);
  const [pageReady, setPageReady] = useState(false);

  const jumpToCharacterRef = useRef<() => void>(() => {
    const currentListIndex = useGGStore.getState().currentListIndex;
    const posX = HOME_WIDTH * currentListIndex;
    pagedScrollRef.current?.scrollTo({ x: posX, y: 0, animated: false });
  });

  const listMovedRef = useRef<(toY: number, allPages?: boolean) => void>((toY: number, allPages = false) => {
    if (lastOffsetY !== toY) {
      useGGStore.getState().setPageOffsetY(inventoryPageEnum, toY);
      const currentListIndex = useGGStore.getState().currentListIndex;

      lastOffsetY = toY;
      for (let i = 0; i < listRefs.current.length; i++) {
        if (i === currentListIndex && !allPages) {
          continue;
        }
        const lRef = listRefs.current[i];
        if (lRef) {
          lRef.scrollToOffset({ offset: toY, animated: false });
        }
      }
    }
  });

  const styles = StyleSheet.create({
    container: {},
    page: {
      width: HOME_WIDTH,
      height: "100%",
    },
  });

  // biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
  useEffect(() => {
    const unsubscribe = useGGStore.subscribe(
      (state) => state.animateToCharacterPage,
      (characterPage, previousCharacterPage) => {
        const currentPage = useGGStore.getState().currentInventoryPage;
        if (
          characterPage.index !== previousCharacterPage.index &&
          characterPage.animate &&
          currentPage === inventoryPageEnum
        ) {
          const posX = HOME_WIDTH * characterPage.index;
          pagedScrollRef.current?.scrollTo({ x: posX, y: 0, animated: true });
        }
      },
    );
    return unsubscribe;
  }, []);

  useFocusEffect(() => {
    if (pageReady) {
      jumpToCharacterRef.current();
      useGGStore.getState().setCurrentInventoryPage(inventoryPageEnum);
    }
  });

  let lastOffsetY = 0;

  const debouncedMove = debounce(listMovedRef.current, 40);
  const debounceListIndex = debounce(calcCurrentListIndex, 40);

  return (
    <View style={[{ flex: 1, width: "100%", height: "100%", backgroundColor: "#17101F" }]}>
      <ScrollView
        horizontal
        pagingEnabled
        scrollEventThrottle={32}
        onScroll={(e) => debounceListIndex(e.nativeEvent.contentOffset.x, HOME_WIDTH)}
        ref={pagedScrollRef}
      >
        {pageData.map((_c, index) => {
          return (
            // biome-ignore lint/suspicious/noArrayIndexKey: <Index is unique for each page in this case>
            <View key={index} style={styles.page}>
              <FlashList
                ref={(ref) => {
                  // biome-ignore lint/style/noParameterAssign: works fine
                  listRefs.current[index] = ref;
                }}
                contentContainerStyle={{ paddingBottom: bottomPadding }}
                refreshControl={
                  <RefreshControl
                    enabled={true}
                    tintColor="white"
                    colors={["black", "white"]}
                    refreshing={pullRefreshing}
                    onRefresh={() => {
                      getFullProfile(true);
                    }}
                  />
                }
                onLoad={() => {
                  if (index === useGGStore.getState().currentListIndex) {
                    useGGStore.getState().setInitialPageLoaded();
                    setPageReady(true);
                    jumpToCharacterRef.current();
                  }
                }}
                data={pageData[index]}
                renderItem={UiCellRenderItem}
                keyExtractor={keyExtractor}
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
