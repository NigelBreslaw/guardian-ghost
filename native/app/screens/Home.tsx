import { NavigationProp } from "@react-navigation/native";
import { FlatList, StyleSheet, View, useWindowDimensions } from "react-native";
import { ScrollView } from "react-native-gesture-handler";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useGlobalStateContext } from "@/app/state/GlobalState.tsx";
import { buildUIData } from "@/app/inventory/UiDataBuilder.ts";
import { UiCellRenderItem } from "@/app/inventory/UiRowRenderItem.tsx";
import { type UiCell } from "@/app/inventory/Common.ts";
import { useEffect, useRef, useState } from "react";

const pageColumns = [4, 4, 4, 4];

export default function HomeScreen({ navigation }: { navigation: NavigationProp<ReactNavigation.RootParamList> }) {
  const globalState = useGlobalStateContext();
  const insets = useSafeAreaInsets();
  const { height, width } = useWindowDimensions();
  const HOME_WIDTH = width;

  const [listData, setListData] = useState<Array<Array<UiCell>>>([]);
  const [characterScrollPosition, setCharacterScrollPosition] = useState<number>(0);
  const listRefs = useRef<(FlatList<UiCell> | null)[]>([]);

  const styles = StyleSheet.create({
    container: {},
    homeContainer: {
      marginBottom: insets.bottom,
    },
    page: {
      flex: 1,
      width: HOME_WIDTH,
    },
  });

  useEffect(() => {
    if (globalState.dataIsReady) {
      const UiData = buildUIData();
      setListData(UiData);
    }
  }, [globalState.dataIsReady]);

  return (
    <ScrollView
      horizontal
      pagingEnabled
      style={styles.homeContainer}
      scrollEventThrottle={0}
      onScroll={(e) => {
        // iterate over the listRefs -1
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
              renderItem={UiCellRenderItem}
              keyExtractor={(item) => item.id}
              numColumns={pageColumns[index]}
              onMomentumScrollEnd={(e) => console.log("onMomentumScrollEnd", e)}
              onScrollAnimationEnd={() => console.log("onScrollAnimationEnd")}
              scrollEventThrottle={33}
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
