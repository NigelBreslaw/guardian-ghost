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
type dProps = {
  iconUri: string;
};
function DestinyCell(props: dProps) {
  const DEFAULT_BORDER_COLOR = "#3E3D45";
  const MINI_ICON_SIZE = 18;
  return (
    <View style={{ width: 68, height: 68 }}>
      <View
        style={{
          width: 68,
          height: 68,
          borderRadius: 10,
          overflow: "hidden",
          borderWidth: 3,
          borderColor: "#555555",
        }}
      >
        <View style={{ width: 62, height: 62 }}>
          <Image
            cachePolicy="memory-disk"
            source={{
              uri: props.iconUri,
            }}
            style={{ width: 62, height: 62, position: "absolute" }}
          />
          <Image
            cachePolicy="memory-disk"
            source={{
              uri: "https://www.bungie.net/common/destiny2_content/icons/1b6c8b94cec61ea42edb1e2cb6b45a31.png",
            }}
            style={{ width: 46, height: 46, position: "absolute" }}
          />
        </View>
      </View>
      <View
        style={{
          width: 40,
          height: 20,
          borderRadius: 4,
          backgroundColor: DEFAULT_BORDER_COLOR,
          zIndex: 100,
          position: "absolute",
          bottom: -9,
          right: -9,
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Text style={{ color: "white", fontSize: 14, fontWeight: "bold" }}>1804</Text>
      </View>
      <View
        style={{
          width: MINI_ICON_SIZE,
          height: MINI_ICON_SIZE,
          borderRadius: 4,
          backgroundColor: DEFAULT_BORDER_COLOR,
          position: "absolute",
          zIndex: 100,
          bottom: 15,
          right: -9,
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Image
          cachePolicy="memory-disk"
          style={{ width: 13, height: 13 }}
          source={{
            uri: "https://www.bungie.net/common/destiny2_content/icons/DestinyDamageTypeDefinition_2a1773e10968f2d088b97c22b22bba9e.png",
          }}
        />
      </View>
      <View
        style={{
          width: MINI_ICON_SIZE,
          height: MINI_ICON_SIZE,
          borderRadius: 4,
          backgroundColor: DEFAULT_BORDER_COLOR,
          zIndex: 1500,
          position: "absolute",
          bottom: 37,
          right: -9,
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
}

export default function HomeScreen({ navigation }: { navigation: NavigationProp<ReactNavigation.RootParamList> }) {
  const globalState = useGlobalStateContext();
  const { width } = Dimensions.get("window");
  const ITEM_WIDTH = width;
  const ITEM_SIZE = 90;
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
      width: 380,
      height: ITEM_SIZE,
    },
    flatList: {
      width: ITEM_WIDTH,
    },
  });

  type rItem = { id: number };

  const renderItem = ({ item }: { item: rItem }) => (
    <View style={{ ...styles.item, paddingLeft: 20, paddingTop: 10, flexDirection: "row" }}>
      <View style={{ flex: 1, backgroundColor: "transparent", alignItems: "center" }}>
        <DestinyCell iconUri="https://www.bungie.net/common/destiny2_content/icons/77bff899a4de6d0ddd6711867b576b6c.jpg" />
      </View>
      <View style={{ flex: 3, justifyContent: "space-around", flexDirection: "row" }}>
        <DestinyCell iconUri="https://www.bungie.net/common/destiny2_content/icons/7393c216e3b437571e64f78a613dc181.jpg" />
        <DestinyCell iconUri="https://www.bungie.net/common/destiny2_content/icons/42120a6f2e1f43dd7f67bedffc42d0d2.jpg" />
        <DestinyCell iconUri="https://www.bungie.net/common/destiny2_content/icons/f805d81b5d20407ef668588121a97706.jpg" />
      </View>
    </View>
  );

  return (
    <ScrollView horizontal pagingEnabled style={{ backgroundColor: "#17101F" }}>
      {[0].map((page) => (
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
