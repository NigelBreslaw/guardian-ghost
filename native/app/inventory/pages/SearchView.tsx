import type { DestinyItem } from "@/app/inventory/logic/Types.ts";
import { consumables, generalVault, guardians, mods } from "@/app/store/Definitions.ts";
import React, { useCallback, useEffect, useState } from "react";
import { View } from "react-native";
import { Image } from "expo-image";
import { TextInput } from "react-native-gesture-handler";

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
          flexDirection: "row",
          flexWrap: "wrap",
          justifyContent: "space-between",
          alignContent: "space-between",
        }}
      >
        {items.map((item) => {
          return (
            <View key={item.itemInstanceId} style={{ width: 100, height: 100 }}>
              <Image source={{ uri: item.instance.icon }} style={{ width: 40, height: 40 }} />
            </View>
          );
        })}
      </View>
    </View>
  );
}

export default React.memo(SearchView);
