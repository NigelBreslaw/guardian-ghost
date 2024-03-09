import { NavigationProp } from "@react-navigation/native";
import { FlatList, StyleSheet, View, useWindowDimensions } from "react-native";
import { ScrollView } from "react-native-gesture-handler";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useGlobalStateContext } from "@/app/state/GlobalState.tsx";
import { buildUIData } from "@/app/inventory/UiDataBuilder.ts";
import { UiCellRenderItem } from "@/app/inventory/UiRowRenderItem.tsx";
import { type UiCell } from "@/app/inventory/Common.ts";
import { useEffect, useState } from "react";

const pageColumns = [4, 4, 4, 4];

export default function HomeScreen({ navigation }: { navigation: NavigationProp<ReactNavigation.RootParamList> }) {
  const globalState = useGlobalStateContext();
  const insets = useSafeAreaInsets();
  const { height, width } = useWindowDimensions();
  const HOME_WIDTH = width;

  const [listData, setListData] = useState<Array<Array<UiCell>>>([]);

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
    <ScrollView horizontal pagingEnabled style={styles.homeContainer}>
      {listData.map((list, index) => {
        return (
          // biome-ignore lint/suspicious/noArrayIndexKey: <Index is unique for each page in this case>
          <View key={index} style={styles.page}>
            <FlatList
              data={list}
              renderItem={UiCellRenderItem}
              keyExtractor={(item) => item.id}
              numColumns={pageColumns[index]}
            />
          </View>
        );
      })}
    </ScrollView>
  );
}
