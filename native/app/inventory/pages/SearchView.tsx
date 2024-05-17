import type { DestinyItem } from "@/app/inventory/logic/Types.ts";
import { consumables, generalVault, guardians, mods } from "@/app/store/Definitions.ts";
import React, { useCallback, useEffect, useState } from "react";
import { View } from "react-native";
import { Image } from "expo-image";
import { TextInput } from "react-native-gesture-handler";
import { FlashList } from "@shopify/flash-list";
import { returnBorderColor } from "@/app/store/AccountInventoryLogic.ts";
import { ICON_MARGIN, ICON_SIZE } from "@/app/utilities/UISize.ts";
import DestinyCell2 from "@/app/inventory/cells/DestinyCell2.tsx";
import { SEARCH_ICON, getDamageTypeIconUri } from "@/app/inventory/logic/Constants.ts";

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

  const words = text
    .toLocaleLowerCase()
    .split(" ")
    .filter((word) => word.trim() !== "");
  const items = getAllItems();
  const foundItems = items.filter((item) => {
    for (const word of words) {
      if (item.def.search.includes(word)) {
        return true;
      }
      if (item.instance.search.includes(word)) {
        return true;
      }
    }
  });

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

  useEffect(() => {
    searchItems(searchText);
  }, [searchText]);

  const searchItems = useCallback((clue: string) => {
    const foundItems = find(clue);

    setItems(foundItems);
  }, []);
  return (
    <View style={{ height: "100%" }}>
      <View style={{ width: "100%", height: 40, paddingLeft: 20, paddingRight: 20, alignContent: "center" }}>
        <View style={{ flex: 1, backgroundColor: "white", opacity: 0.14, borderRadius: 10 }} />
        <View style={{ flexDirection: "row", gap: 5, position: "absolute", left: 30, top: 10, marginRight: 10 }}>
          <Image source={SEARCH_ICON} style={{ width: 20, height: 20, opacity: 0.4 }} />
          <TextInput
            keyboardAppearance="dark"
            cursorColor="white"
            selectionColor={"#ffffff20"}
            textContentType="none"
            enterKeyHint="search"
            autoComplete="off"
            placeholder="Search"
            placeholderTextColor="grey"
            clearButtonMode="always"
            selectTextOnFocus={false}
            style={{
              flex: 1,
              color: "white",
              fontSize: 18,
            }}
            onChangeText={(value) => {
              setSearchText(value);
            }}
          />
        </View>
      </View>
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
