import type { DestinyItem } from "@/app/inventory/logic/Types.ts";
import { consumables, generalVault, guardians, mods } from "@/app/store/Definitions.ts";
import React, { useCallback, useEffect, useState } from "react";
import { View } from "react-native";
import { TextInput } from "react-native-gesture-handler";
import { FlashList } from "@shopify/flash-list";
import { returnBorderColor } from "@/app/store/AccountInventoryLogic.ts";
import { ICON_MARGIN, ICON_SIZE } from "@/app/utilities/UISize.ts";
import DestinyCell2 from "@/app/inventory/cells/DestinyCell2.tsx";
import { getDamageTypeIconUri } from "@/app/inventory/logic/Constants.ts";

function getAllItems(): DestinyItem[] {
  const items = [];

  for (const [_key, guardian] of guardians) {
    for (const [_key, bucket] of guardian.items) {
      if (bucket.equipped) {
        items.push(bucket.equipped);
      }
      for (const item of bucket.inventory) {
        items.push(item);
      }
    }
  }

  for (const [_key, bucket] of generalVault) {
    for (const item of bucket) {
      items.push(item);
    }
  }

  for (const item of mods) {
    items.push(item);
  }

  for (const item of consumables) {
    items.push(item);
  }
  return items;
}

function find(text: string): DestinyItem[] {
  if (text === "") {
    return [];
  }
  const textToLowercase = text.toLowerCase();
  const items = getAllItems();
  const foundItems = items.filter((item) => item.def.search.includes(textToLowercase));

  return foundItems;
}

const keyExtractor = (item: DestinyItem) => item.instance.id;

export const UiCellRenderItem = ({ item }: { item: DestinyItem }) => {
  return (
    <View
      key={item.itemInstanceId}
      style={{
        width: ICON_SIZE + ICON_MARGIN,
        height: ICON_SIZE + ICON_MARGIN,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <DestinyCell2
        characterId={item.characterId}
        itemHash={item.itemHash}
        itemInstanceId={item.itemInstanceId}
        bucketHash={item.bucketHash}
        icon={item.instance.icon}
        calculatedWaterMark={item.instance.calculatedWaterMark ?? ""}
        damageTypeIconUri={getDamageTypeIconUri(item.instance.damageType)}
        crafted={item.instance.crafted ?? false}
        stackSizeMaxed={item.quantity === item.def.maxStackSize}
        primaryStat={item.instance.primaryStat}
        quantity={item.quantity}
        borderColor={returnBorderColor(item)}
      />
    </View>
  );
};

function SearchView() {
  const [searchText, setSearchText] = useState("");
  const [items, setItems] = useState<DestinyItem[]>([]);

  // useEffect to update items when searchText changes
  useEffect(() => {
    searchItems(searchText);
  }, [searchText]);

  const searchItems = useCallback((clue: string) => {
    const foundItems = find(clue);
    setItems(foundItems);
  }, []);
  return (
    <View style={{ height: "100%" }}>
      <TextInput
        style={{ borderWidth: 1, borderColor: "white", height: 50, width: "100%", color: "white" }}
        onChangeText={(value) => {
          setSearchText(value);
        }}
        value={searchText}
      />
      <View style={{ height: 50 }} />
      <View
        style={{
          flex: 1,
        }}
      >
        <FlashList
          data={items}
          renderItem={UiCellRenderItem}
          numColumns={5}
          estimatedItemSize={100}
          keyExtractor={keyExtractor}
        />
      </View>
    </View>
  );
}

export default React.memo(SearchView);
