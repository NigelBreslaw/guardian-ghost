import { NavigationProp } from "@react-navigation/native";
import { Dimensions, StyleSheet, View } from "react-native";
import { ScrollView } from "react-native-gesture-handler";
import { FlashList } from "@shopify/flash-list";

const data = [...Array(100).keys()].map((i) => ({ id: i, color: i % 2 === 0 ? "white" : "black" }));

export default function HomeScreen({ navigation }: { navigation: NavigationProp<ReactNavigation.RootParamList> }) {
  const { width } = Dimensions.get("window");
  const ITEM_WIDTH = width;
  const ITEM_SIZE = 100;

  const styles = StyleSheet.create({
    scrollViewContainer: {
      flexGrow: 1,
    },
    page: {
      width: ITEM_WIDTH,
      height: "100%",
    },
    item: {
      width: ITEM_WIDTH,
      height: ITEM_SIZE,
    },
    flatList: {
      width: ITEM_WIDTH,
    },
  });

  type rItem = { id: number; color: string };

  const renderItem = ({ item }: { item: rItem }) => (
    <View style={[styles.item, { backgroundColor: item.color, opacity: 0.5 }]} />
  );

  return (
    <ScrollView horizontal pagingEnabled>
      {[0, 1, 2].map((page) => (
        <View key={page} style={[styles.page, { backgroundColor: page === 0 ? "red" : page === 1 ? "green" : "blue" }]}>
          <FlashList
            estimatedItemSize={ITEM_SIZE}
            data={data}
            renderItem={renderItem}
            keyExtractor={(item) => item.id.toString()}
          />
        </View>
      ))}
    </ScrollView>
  );
}
