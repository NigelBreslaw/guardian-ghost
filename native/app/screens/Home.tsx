import { NavigationProp } from "@react-navigation/native";
import { StyleSheet, View, Text, useWindowDimensions } from "react-native";
import { ScrollView } from "react-native-gesture-handler";
// import { FlashList } from "@shopify/flash-list";
import { Image } from "expo-image";
import { memo, useEffect } from "react";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useGlobalStateContext } from "@/app/state/GlobalState.tsx";
import DataService from "@/app/core/DataService.ts";
import type { DestinyIconData } from "@/app/destinyItem/Types.ts";
import type { CharacterGear } from "@/app/bungie/Types.ts";

const p1 = performance.now();

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
    alignContent: "center",
    includeFontPadding: false,
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
          <Image source={props.iconUri} style={styles.innerFrameSize} recyclingKey={props.iconUri} />
          <Image source={props.versionUri} style={styles.innerFrameOverlaySize} recyclingKey={props.versionUri} />
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

const weaponsPageBuckets = [
  1498876634, // kinetic weapons
  2465295065, // energy weapons
  953998645, // power weapons
  4023194814, // ghost
  1506418338, // artifact
];

enum UiRowType {
  CharacterEquipped = 0,
  CharacterInventory = 1,
}

type CharacterEquippedRow = {
  equipped: DestinyIconData | null;
  inventory: Array<DestinyIconData>;
  type: UiRowType.CharacterEquipped;
};

type CharacterInventoryRow = {
  inventory: Array<DestinyIconData>;
  type: UiRowType.CharacterInventory;
};

type UiRow = CharacterEquippedRow | CharacterInventoryRow;

const UiRowItem = ({ item }: { item: UiRow }) => {
  switch (item.type) {
    case UiRowType.CharacterEquipped:
      return <Text />;
    case UiRowType.CharacterInventory:
      return <Image />;
  }
};

function returnEquippedData(characterGear: CharacterGear): DestinyIconData | null {
  const equipped = characterGear.equipped;
  if (equipped) {
    const definition = DataService.itemDefinition.items[equipped.itemHash];

    const iconData: DestinyIconData = {
      itemHash: equipped.itemHash,
      icon: definition.i,
    };
    return iconData;
  }
  return null;
}

function returnInventoryRow(characterGear: CharacterGear, column: number, rowWidth = 3): Array<DestinyIconData> {
  const rowData: Array<DestinyIconData> = [];

  const startIndex = column * rowWidth;
  const endIndex = startIndex + rowWidth;

  for (let i = startIndex; i < endIndex; i++) {
    const item = characterGear.inventory[i];
    if (item) {
      const definition = DataService.itemDefinition.items[item.itemHash];

      const iconData: DestinyIconData = {
        itemHash: item.itemHash,
        icon: definition.i,
      };
      rowData.push(iconData);
    }
  }

  return rowData;
}

function buildUIData() {
  const p1 = performance.now();
  const dataArray: Array<UiRow> = [];

  for (const character in DataService.charactersAndVault.characters) {
    const characterData = DataService.charactersAndVault.characters[character];
    for (const bucket of weaponsPageBuckets) {
      const bucketItems = characterData.items[bucket];

      const equipItem = returnEquippedData(bucketItems);
      const inventoryRowData0 = returnInventoryRow(bucketItems, 0);
      const equippedRow = {
        equipped: equipItem,
        inventory: inventoryRowData0,
        type: UiRowType.CharacterEquipped,
      };
      dataArray.push(equippedRow);

      const inventoryRow1Data = returnInventoryRow(bucketItems, 1);
      const inventoryRow1: CharacterInventoryRow = {
        inventory: inventoryRow1Data,
        type: UiRowType.CharacterInventory,
      };
      dataArray.push(inventoryRow1);

      const inventoryRow2Data = returnInventoryRow(bucketItems, 2);
      const inventoryRow2: CharacterInventoryRow = {
        inventory: inventoryRow2Data,
        type: UiRowType.CharacterInventory,
      };
      dataArray.push(inventoryRow2);
    }
  }
  const p2 = performance.now();
  console.log("buildUIData took:", (p2 - p1).toFixed(4), "ms");
}

export default function HomeScreen({ navigation }: { navigation: NavigationProp<ReactNavigation.RootParamList> }) {
  const globalState = useGlobalStateContext();
  const insets = useSafeAreaInsets();
  const { height, width } = useWindowDimensions();
  const HOME_WIDTH = width;

  useEffect(() => {
    if (globalState.dataIsReady) {
      const p3 = performance.now();
      console.log("dataIsReady took:", (p3 - p1).toFixed(4), "ms");

      buildUIData();
    }
  }, [globalState.dataIsReady]);

  // const renderItem = ({ item }: { item: rItem }) => (
  //   <View style={styles.item}>
  //     <View style={styles.sectionEquipped}>
  //       <DestinyCell
  //         iconUri="https://www.bungie.net/common/destiny2_content/icons/77bff899a4de6d0ddd6711867b576b6c.jpg"
  //         versionUri="https://www.bungie.net/common/destiny2_content/icons/1b6c8b94cec61ea42edb1e2cb6b45a31.png"
  //       />
  //     </View>
  //     <View style={styles.sectionInventory}>
  //       <DestinyCell
  //         iconUri="https://www.bungie.net/common/destiny2_content/icons/7393c216e3b437571e64f78a613dc181.jpg"
  //         versionUri="https://www.bungie.net/common/destiny2_content/icons/1b6c8b94cec61ea42edb1e2cb6b45a31.png"
  //       />
  //       <DestinyCell
  //         iconUri="https://www.bungie.net/common/destiny2_content/icons/42120a6f2e1f43dd7f67bedffc42d0d2.jpg"
  //         versionUri="https://www.bungie.net/common/destiny2_content/icons/1b6c8b94cec61ea42edb1e2cb6b45a31.png"
  //       />
  //       <DestinyCell
  //         iconUri="https://www.bungie.net/common/destiny2_content/icons/f805d81b5d20407ef668588121a97706.jpg"
  //         versionUri="https://www.bungie.net/common/destiny2_content/icons/1b6c8b94cec61ea42edb1e2cb6b45a31.png"
  //       />
  //     </View>
  //   </View>
  // );

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
      {/* {[0, 1, 2, 4].map((page) => (
        <View key={page} style={[homeStyles.page]}>
          <FlashList
            estimatedItemSize={ITEM_SIZE}
            data={data}
            renderItem={renderItem}
            keyExtractor={(item) => item.id}
          />
        </View>
      ))} */}
    </ScrollView>
  );
}
