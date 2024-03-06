import DestinyCell from "@/app/inventory/DestinyCell.tsx";
import EmptyCell from "@/app/inventory/EmptyCell.tsx";
import {
  UiRowType,
  type UiRow,
  type HeaderRow,
  type CharacterEquippedRow,
  type CharacterInventoryRow,
  ITEM_SIZE,
  type VaultInventoryRow,
} from "@/app/inventory/Common.ts";
import { useMemo } from "react";
import { View, StyleSheet } from "react-native";

const styles = StyleSheet.create({
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
  sectionVault: {
    flex: 1,
    justifyContent: "space-around",
    flexDirection: "row",
  },
});

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
          primaryStat={itemData.equipped?.primaryStat}
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
                primaryStat={item.primaryStat}
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
                primaryStat={item.primaryStat}
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

function VaultRowUiItem(itemData: VaultInventoryRow) {
  const data = useMemo(() => {
    return itemData;
  }, [itemData]);

  return (
    <View style={styles.item}>
      <View style={styles.sectionInventory}>
        {data.inventory.map((item) => {
          if (item.itemHash !== -1) {
            return (
              <DestinyCell
                key={item.itemInstanceId}
                primaryStat={item.primaryStat}
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

export const UiRowRenderItem = ({ item }: { item: UiRow }) => {
  switch (item.type) {
    case UiRowType.CharacterEquipped:
      return <EquippedRowUiItem id={item.id} equipped={item.equipped} inventory={item.inventory} type={item.type} />;
    case UiRowType.CharacterInventory:
      return <InventoryRowUiItem id={item.id} inventory={item.inventory} type={item.type} />;
    case UiRowType.VaultInventory:
      return <VaultRowUiItem id={item.id} inventory={item.inventory} type={item.type} />;
    case UiRowType.Header:
      return <HeaderRowUiItem id={item.id} type={item.type} />;
  }
};
