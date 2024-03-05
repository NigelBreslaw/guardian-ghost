import { NavigationProp } from "@react-navigation/native";
import { StyleSheet, View, Text, useWindowDimensions } from "react-native";
import { ScrollView } from "react-native-gesture-handler";
import { FlashList } from "@shopify/flash-list";
import { Image } from "expo-image";
import { memo, useEffect, useMemo } from "react";
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
  header: {
    height: 45,
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
    </View>
  );
});

function EmptyCell() {
  return (
    <View style={styles.frameSize}>
      <View style={styles.icon} />
    </View>
  );
}

const weaponsPageBuckets = [
  1498876634, // kinetic weapons
  2465295065, // energy weapons
  953998645, // power weapons
  4023194814, // ghost
  1506418338, // artifact
];

enum UiRowType {
  Header = 0,
  CharacterEquipped = 1,
  CharacterInventory = 2,
}

type CharacterEquippedRow = {
  id: string;
  equipped: DestinyIconData | null;
  inventory: Array<DestinyIconData>;
  type: UiRowType.CharacterEquipped;
};

type CharacterInventoryRow = {
  id: string;
  inventory: Array<DestinyIconData>;
  type: UiRowType.CharacterInventory;
};

type HeaderRow = {
  id: string;
  type: UiRowType.Header;
};

type UiRow = HeaderRow | CharacterEquippedRow | CharacterInventoryRow;

const UiRowRenderItem = ({ item }: { item: UiRow }) => {
  switch (item.type) {
    case UiRowType.CharacterEquipped:
      return <EquippedRowUiItem id={item.id} equipped={item.equipped} inventory={item.inventory} type={item.type} />;
    case UiRowType.CharacterInventory:
      return <InventoryRowUiItem id={item.id} inventory={item.inventory} type={item.type} />;
    case UiRowType.Header:
      return <HeaderRowUiItem id={item.id} type={item.type} />;
  }
};

function HeaderRowUiItem(itemData: HeaderRow) {
  const data = useMemo(() => {
    return itemData;
  }, [itemData]);

  return <View key={itemData.id} style={styles.header} />;
}
function EquippedRowUiItem(itemData: CharacterEquippedRow) {
  const data = useMemo(() => {
    return itemData;
  }, [itemData]);

  return (
    <View style={styles.item}>
      <View style={styles.sectionEquipped}>
        <DestinyCell
          iconUri={`https://www.bungie.net/common/destiny2_content/icons/${data.equipped.icon}`}
          versionUri="https://www.bungie.net/common/destiny2_content/icons/1b6c8b94cec61ea42edb1e2cb6b45a31.png"
        />
      </View>
      <View style={styles.sectionInventory}>
        {data.inventory.map((item) => {
          if (item.itemHash !== -1) {
            return (
              <DestinyCell
                key={item.itemInstanceId}
                iconUri={`https://www.bungie.net/common/destiny2_content/icons/${item.icon}`}
                versionUri="https://www.bungie.net/common/destiny2_content/icons/1b6c8b94cec61ea42edb1e2cb6b45a31.png"
              />
            );
          }
        })}
      </View>
    </View>
  );
}

function InventoryRowUiItem(itemData: CharacterInventoryRow) {
  const data = useMemo(() => {
    return itemData;
  }, [itemData]);

  return (
    <View style={styles.item}>
      <View style={styles.sectionEquipped} />
      <View style={styles.sectionInventory}>
        {data.inventory.map((item) => {
          if (item.itemHash !== -1) {
            return (
              <DestinyCell
                key={item.itemInstanceId}
                iconUri={`https://www.bungie.net/common/destiny2_content/icons/${item.icon}`}
                versionUri="https://www.bungie.net/common/destiny2_content/icons/1b6c8b94cec61ea42edb1e2cb6b45a31.png"
              />
            );
          }
          const id = Math.random();
          return <EmptyCell key={id} />;
        })}
      </View>
    </View>
  );
}

function returnEquippedData(characterGear: CharacterGear): DestinyIconData | null {
  const equipped = characterGear.equipped;
  if (equipped) {
    const definition = DataService.itemDefinition.items[equipped.itemHash];

    const iconData: DestinyIconData = {
      itemHash: equipped.itemHash,
      itemInstanceId: equipped.itemInstanceId,
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
        itemInstanceId: item.itemInstanceId,
        icon: definition.i,
      };
      rowData.push(iconData);
    } else {
      const frame: DestinyIconData = {
        itemHash: -1,
        icon: "",
      };
      rowData.push(frame);
    }
  }

  return rowData;
}

function buildUIData(): Array<Array<UiRow>> {
  const p1 = performance.now();
  const characterDataArray: Array<Array<UiRow>> = [];

  for (const character in DataService.charactersAndVault.characters) {
    const characterData = DataService.charactersAndVault.characters[character];
    const dataArray: Array<UiRow> = [];

    for (const bucket of weaponsPageBuckets) {
      const header: HeaderRow = {
        id: `${bucket}_header`,
        type: UiRowType.Header,
      };
      dataArray.push(header);
      const bucketItems = characterData.items[bucket];

      const equipItem = returnEquippedData(bucketItems);
      const inventoryRowData0 = returnInventoryRow(bucketItems, 0);
      const equippedRow = {
        id: `${bucket}_equipped`,
        equipped: equipItem,
        inventory: inventoryRowData0,
        type: UiRowType.CharacterEquipped,
      };
      dataArray.push(equippedRow);

      const inventoryRow1Data = returnInventoryRow(bucketItems, 1);
      const inventoryRow1: CharacterInventoryRow = {
        id: `${bucket}_row1`,
        inventory: inventoryRow1Data,
        type: UiRowType.CharacterInventory,
      };
      dataArray.push(inventoryRow1);

      const inventoryRow2Data = returnInventoryRow(bucketItems, 2);
      const inventoryRow2: CharacterInventoryRow = {
        id: `${bucket}_row2`,
        inventory: inventoryRow2Data,
        type: UiRowType.CharacterInventory,
      };
      dataArray.push(inventoryRow2);
    }
    characterDataArray.push(dataArray);
  }
  const p2 = performance.now();
  console.log("buildUIData took:", (p2 - p1).toFixed(4), "ms");
  return characterDataArray;
}

export default function HomeScreen({ navigation }: { navigation: NavigationProp<ReactNavigation.RootParamList> }) {
  const globalState = useGlobalStateContext();
  const insets = useSafeAreaInsets();
  const { height, width } = useWindowDimensions();
  const HOME_WIDTH = width;

  useEffect(() => {
    if (globalState.dataIsReady) {
      buildUIData();
    }
  }, [globalState.dataIsReady]);

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
      {buildUIData().map((dataArray, index) => (
        // biome-ignore lint/suspicious/noArrayIndexKey: <explanation>
        <View key={index} style={[homeStyles.page]}>
          <FlashList
            estimatedItemSize={ITEM_SIZE}
            data={dataArray}
            renderItem={UiRowRenderItem}
            keyExtractor={(item) => item.id}
          />
        </View>
      ))}
    </ScrollView>
  );
}
