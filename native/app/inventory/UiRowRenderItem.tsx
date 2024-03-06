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
  vaultItem: {
    height: ITEM_SIZE,
    paddingLeft: 4,
    paddingRight: 4,
    paddingTop: 10,
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

  return <View style={styles.header} />;
}

function EquippedRowUiItem(itemData: CharacterEquippedRow) {
  return (
    <View style={styles.item}>
      <View style={styles.sectionEquipped}>
        <DestinyCell
          primaryStat={itemData.equipped.primaryStat}
          iconUri={itemData.equipped.icon}
          calculatedWaterMark={itemData.equipped.calculatedWaterMark}
          damageType={itemData.equipped.damageType}
        />
      </View>
      <View style={styles.sectionInventory}>
        {itemData.inventory.map((item, index) => {
          if (item.itemHash !== -1) {
            return (
              <DestinyCell
                // biome-ignore lint/suspicious/noArrayIndexKey: <FlashList either needs no key or a value that does not change>
                key={index}
                primaryStat={item.primaryStat}
                iconUri={item.icon}
                calculatedWaterMark={item.calculatedWaterMark}
                damageType={item.damageType}
              />
            );
          }
          // biome-ignore lint/suspicious/noArrayIndexKey: <FlashList either needs no key or a value that does not change>
          return <EmptyCell key={index} />;
        })}
      </View>
    </View>
  );
}

function InventoryRowUiItem(itemData: CharacterInventoryRow) {
  return (
    <View style={styles.item}>
      <View style={styles.sectionEquipped} />
      <View style={styles.sectionInventory}>
        {itemData.inventory.map((item, index) => {
          if (item.itemHash !== -1) {
            return (
              <DestinyCell
                // biome-ignore lint/suspicious/noArrayIndexKey: <FlashList either needs no key or a value that does not change>
                key={index}
                primaryStat={item.primaryStat}
                iconUri={item.icon}
                calculatedWaterMark={item.calculatedWaterMark}
                damageType={item.damageType}
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
  return (
    <View style={styles.vaultItem}>
      <View style={styles.sectionVault}>
        {itemData.inventory.map((item, index) => {
          if (item.itemHash !== -1) {
            return (
              <DestinyCell
                // biome-ignore lint/suspicious/noArrayIndexKey: <FlashList either needs no key or a value that does not change>
                key={index}
                primaryStat={item.primaryStat}
                iconUri={item.icon}
                calculatedWaterMark={item.calculatedWaterMark}
                damageType={item.damageType}
              />
            );
          }
          // biome-ignore lint/suspicious/noArrayIndexKey: <FlashList either needs no key or a value that does not change>
          return <EmptyCell key={index} />;
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
