import { NavigationProp } from "@react-navigation/native";
import { Dimensions, StyleSheet, View } from "react-native";
import { ScrollView } from "react-native-gesture-handler";
import { FlashList } from "@shopify/flash-list";

export default function HomeScreen({ navigation }: { navigation: NavigationProp<ReactNavigation.RootParamList> }) {
  const { width } = Dimensions.get("window");
  const ITEM_WIDTH = width;
  const ITEM_SIZE = 200;

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

  const data = [
    { id: 1, color: "white" },
    { id: 2, color: "black" },
    { id: 3, color: "white" },
    { id: 4, color: "black" },
    { id: 5, color: "white" },
    { id: 6, color: "black" },
    { id: 7, color: "white" },
    { id: 8, color: "black" },
    { id: 9, color: "white" },
    { id: 10, color: "black" },
    { id: 11, color: "white" },
    { id: 12, color: "black" },
    { id: 13, color: "white" },
    { id: 14, color: "black" },
    { id: 15, color: "white" },
    { id: 16, color: "white" },
    { id: 17, color: "black" },
    { id: 18, color: "white" },
    { id: 19, color: "black" },
    { id: 20, color: "white" },
    { id: 21, color: "black" },
    { id: 22, color: "white" },
    { id: 23, color: "black" },
    { id: 24, color: "white" },
    { id: 25, color: "black" },
    { id: 26, color: "white" },
    { id: 27, color: "black" },
    { id: 28, color: "white" },
    { id: 29, color: "black" },
    { id: 30, color: "white" },
    { id: 31, color: "black" },
    { id: 32, color: "white" },
    { id: 33, color: "black" },
    { id: 34, color: "white" },
    { id: 35, color: "black" },
    { id: 36, color: "white" },
    { id: 37, color: "black" },
    { id: 38, color: "white" },
    { id: 39, color: "black" },
    { id: 40, color: "white" },
    { id: 41, color: "black" },
    { id: 42, color: "white" },
    { id: 43, color: "black" },
    { id: 44, color: "white" },
    { id: 45, color: "black" },
    { id: 46, color: "white" },
    { id: 47, color: "black" },
    { id: 48, color: "white" },
    { id: 49, color: "black" },
    { id: 50, color: "white" },
    { id: 51, color: "black" },
    { id: 52, color: "white" },
    { id: 53, color: "black" },
  ];

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
