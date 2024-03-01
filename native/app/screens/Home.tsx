import { NavigationProp } from "@react-navigation/native";
import { Dimensions, StyleSheet, View, Text } from "react-native";
import { ScrollView } from "react-native-gesture-handler";
import { FlashList } from "@shopify/flash-list";
import { Image } from "expo-image";
import { getItemDefinition } from "@/app/backend/api.ts";
import { useGlobalStateContext } from "@/app/state/GlobalState.tsx";

const p1 = performance.now();
const data = [...Array(100).keys()].map((i) => ({ id: i }));
const p2 = performance.now();
console.log("data took:", (p2 - p1).toFixed(5), "ms");

async function createUI() {
  const defintion = await getItemDefinition();
}

export default function HomeScreen({ navigation }: { navigation: NavigationProp<ReactNavigation.RootParamList> }) {
  const globalState = useGlobalStateContext();
  const { width } = Dimensions.get("window");
  const ITEM_WIDTH = width;
  const ITEM_SIZE = 60;
  const DEFAULT_BORDER_COLOR = "#3E3D45";

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

  type rItem = { id: number };

  const renderItem = ({ item }: { item: rItem }) => (
    <View style={{ ...styles.item, paddingLeft: 20, paddingTop: 10, flexDirection: "row" }}>
      <View
        style={{
          width: 50,
          height: 50,
          borderRadius: 10,
          overflow: "hidden",
          borderWidth: 2,
          borderColor: "#555555",
        }}
      >
        <View style={{ width: 46, height: 46 }}>
          <Image
            cachePolicy="memory-disk"
            source={{
              uri: "https://www.bungie.net/common/destiny2_content/icons/77bff899a4de6d0ddd6711867b576b6c.jpg",
            }}
            style={{ flex: 1 }}
          >
            <Image
              cachePolicy="memory-disk"
              source={{
                uri: "https://www.bungie.net/common/destiny2_content/icons/1b6c8b94cec61ea42edb1e2cb6b45a31.png",
              }}
              style={{ flex: 1 }}
            />
          </Image>
        </View>
      </View>

      <View
        style={{
          width: 35,
          height: 15,
          borderRadius: 4,
          backgroundColor: DEFAULT_BORDER_COLOR,
          zIndex: 100,
          position: "absolute",
          bottom: -5,
          left: 42,
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Text style={{ color: "white", fontSize: 11, fontWeight: "bold" }}>1804</Text>
      </View>
      <View
        style={{
          width: 14,
          height: 14,
          borderRadius: 4,
          backgroundColor: DEFAULT_BORDER_COLOR,
          position: "absolute",
          bottom: 28,
          left: 63,
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Image
          cachePolicy="memory-disk"
          style={{ width: 10, height: 10 }}
          source={{
            uri: "https://www.bungie.net/common/destiny2_content/icons/DestinyDamageTypeDefinition_2a1773e10968f2d088b97c22b22bba9e.png",
          }}
        />
      </View>
      <View
        style={{
          width: 14,
          height: 14,
          borderRadius: 4,
          backgroundColor: DEFAULT_BORDER_COLOR,
          zIndex: 1500,
          position: "absolute",
          bottom: 12,
          left: 63,
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Image
          cachePolicy="memory-disk"
          style={{ width: 15, height: 15 }}
          source={{
            uri: "https://bray.tech/static/images/extracts/ui/overrides/kinetic.png",
          }}
        />
      </View>
    </View>
  );

  return (
    <ScrollView horizontal pagingEnabled>
      {[0, 1, 2].map((page) => (
        <View key={page} style={[styles.page]}>
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
