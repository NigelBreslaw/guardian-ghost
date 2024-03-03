import { NavigationProp } from "@react-navigation/native";
import { StyleSheet, View, Text, useWindowDimensions } from "react-native";
import { ScrollView } from "react-native-gesture-handler";
import { FlashList } from "@shopify/flash-list";
import { Image } from "expo-image";
import { getItemDefinition } from "@/app/backend/api.ts";
import { memo } from "react";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const p1 = performance.now();
const data = [...Array(100).keys()].map((i) => ({ id: i.toString() }));
const p2 = performance.now();
console.log("data took:", (p2 - p1).toFixed(5), "ms");

async function createUI() {
  const defintion = await getItemDefinition();
}
const ITEM_SIZE = 90;
const DEFAULT_BORDER_COLOR = "#3E3D45";
const MINI_ICON_SIZE = 16;
const RIGHT_ALIGNMENT = -9;

const styles = StyleSheet.create({
  scrollViewContainer: {
    flexGrow: 1,
  },
  item: {
    width: 380,
    height: ITEM_SIZE,
    paddingLeft: 20,
    paddingTop: 10,
    flexDirection: "row",
  },
  sectionEquipped: {
    flex: 1,
    backgroundColor: "transparent",
    alignItems: "center",
  },
  sectionInventory: {
    flex: 3,
    justifyContent: "space-around",
    flexDirection: "row",
  },
  miniIconAmmonSize: {
    width: 14,
    height: 14,
  },
  miniIconAmmo: {
    width: MINI_ICON_SIZE,
    height: MINI_ICON_SIZE,
    borderRadius: 4,
    backgroundColor: DEFAULT_BORDER_COLOR,
    zIndex: 150,
    position: "absolute",
    bottom: 32,
    right: RIGHT_ALIGNMENT,
    justifyContent: "center",
    alignItems: "center",
  },
  miniIconBurnSize: {
    width: 12,
    height: 12,
  },
  miniIconBurn: {
    width: MINI_ICON_SIZE,
    height: MINI_ICON_SIZE,
    borderRadius: 4,
    backgroundColor: DEFAULT_BORDER_COLOR,
    position: "absolute",
    zIndex: 100,
    bottom: 13,
    right: RIGHT_ALIGNMENT,
    justifyContent: "center",
    alignItems: "center",
  },
  powerLevelText: {
    color: "white",
    fontSize: 14,
    fontWeight: "bold",
  },
  powerLevel: {
    width: 40,
    height: 18,
    borderRadius: 4,
    backgroundColor: DEFAULT_BORDER_COLOR,
    zIndex: 100,
    position: "absolute",
    bottom: -8,
    right: -8,
    justifyContent: "center",
    alignItems: "center",
  },
  icon: {
    width: 68,
    height: 68,
    borderRadius: 10,
    overflow: "hidden",
    borderWidth: 3,
    borderColor: "#555555",
  },
  frameSize: {
    width: 68,
    height: 68,
  },
  innerFrameSize: {
    width: 63,
    height: 63,
  },
  innerFrameOverlaySize: {
    width: 63,
    height: 63,
    position: "absolute",
  },
});

type dProps = {
  iconUri: string;
  versionUri: string;
};

const DAMAGE_TYPE_ICON_URI =
  "https://www.bungie.net/common/destiny2_content/icons/DestinyDamageTypeDefinition_2a1773e10968f2d088b97c22b22bba9e.png";
const KINETIC_ICON_URI = "https://bray.tech/static/images/extracts/ui/overrides/kinetic.png";

const DestinyCell = memo((props: dProps) => {
  return (
    <View style={styles.frameSize}>
      <View style={styles.icon}>
        <View style={styles.innerFrameSize}>
          <Image source={props.iconUri} style={styles.innerFrameSize} />
          <Image source={props.versionUri} style={styles.innerFrameOverlaySize} />
        </View>
      </View>
      <View style={styles.powerLevel}>
        <Text style={styles.powerLevelText}>1804</Text>
      </View>
      <View style={styles.miniIconBurn}>
        <Image style={styles.miniIconBurnSize} source={DAMAGE_TYPE_ICON_URI} />
      </View>
      <View style={styles.miniIconAmmo}>
        <Image style={styles.miniIconAmmonSize} source={KINETIC_ICON_URI} />
      </View>
    </View>
  );
});

const MemoItem = memo(() => {
  return (
    <View style={styles.item}>
      <View style={styles.sectionEquipped}>
        <DestinyCell
          iconUri="https://www.bungie.net/common/destiny2_content/icons/77bff899a4de6d0ddd6711867b576b6c.jpg"
          versionUri="https://www.bungie.net/common/destiny2_content/icons/1b6c8b94cec61ea42edb1e2cb6b45a31.png"
        />
      </View>
      <View style={styles.sectionInventory}>
        <DestinyCell
          iconUri="https://www.bungie.net/common/destiny2_content/icons/7393c216e3b437571e64f78a613dc181.jpg"
          versionUri="https://www.bungie.net/common/destiny2_content/icons/1b6c8b94cec61ea42edb1e2cb6b45a31.png"
        />
        <DestinyCell
          iconUri="https://www.bungie.net/common/destiny2_content/icons/42120a6f2e1f43dd7f67bedffc42d0d2.jpg"
          versionUri="https://www.bungie.net/common/destiny2_content/icons/1b6c8b94cec61ea42edb1e2cb6b45a31.png"
        />
        <DestinyCell
          iconUri="https://www.bungie.net/common/destiny2_content/icons/f805d81b5d20407ef668588121a97706.jpg"
          versionUri="https://www.bungie.net/common/destiny2_content/icons/1b6c8b94cec61ea42edb1e2cb6b45a31.png"
        />
      </View>
    </View>
  );
});

type rItem = { id: string };

export default function HomeScreen({ navigation }: { navigation: NavigationProp<ReactNavigation.RootParamList> }) {
  const insets = useSafeAreaInsets();
  const { height, width } = useWindowDimensions();
  const HOME_WIDTH = width;
  const renderItem = ({ item }: { item: rItem }) => <MemoItem />;

  const homeStyles = StyleSheet.create({
    homeContainer: {
      paddingBottom: insets.bottom,
      backgroundColor: "#17101F",
    },
    page: {
      width: HOME_WIDTH,
      height: "100%",
    },
  });

  return (
    <ScrollView removeClippedSubviews={true} horizontal pagingEnabled style={homeStyles.homeContainer}>
      {[0, 1, 2, 4].map((page) => (
        <View key={page} style={[homeStyles.page]}>
          <FlashList
            estimatedItemSize={ITEM_SIZE}
            data={data}
            renderItem={renderItem}
            keyExtractor={(item) => item.id}
          />
        </View>
      ))}
    </ScrollView>
  );
}
