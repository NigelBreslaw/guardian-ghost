import type { DestinyItem } from "@/app/inventory/logic/Types.ts";
import { getAllItems } from "@/app/store/Definitions.ts";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { KeyboardAvoidingView, TextInput, Platform, View, Keyboard } from "react-native";
import { Image } from "expo-image";
import { FlashList } from "@shopify/flash-list";
import { returnBorderColor } from "@/app/store/AccountInventoryLogic.ts";
import { ICON_MARGIN, ICON_SIZE } from "@/app/utilities/UISize.ts";
import DestinyCell2 from "@/app/inventory/cells/DestinyCell2.tsx";
import { SEARCH_ICON, getDamageTypeIconUri } from "@/app/inventory/logic/Constants.ts";
import { useDrawerStatus } from "@react-navigation/drawer";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useIsFocused } from "@react-navigation/native";

function find(text: string, allItems: DestinyItem[]): DestinyItem[] {
  if (text === "") {
    return [];
  }

  const p1 = performance.now();

  const words = text
    .toLocaleLowerCase()
    .split(" ")
    .filter((word) => word.trim() !== "");

  const foundItems = allItems.filter((item) => {
    for (const word of words) {
      if (item.def.search.includes(word)) {
        return true;
      }
      if (item.instance.search.includes(word)) {
        return true;
      }
    }
  });

  const p2 = performance.now();
  console.log("find", `${(p2 - p1).toFixed(4)} ms`);

  return foundItems;
}

const keyExtractor = (item: DestinyItem) => item.instance.id;

export const UiCellRenderItem = ({ item }: { item: DestinyItem }) => {
  return (
    <View
      key={item.itemInstanceId}
      style={{
        height: ICON_SIZE + ICON_MARGIN,
        width: ICON_SIZE,
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
  const drawerStatus = useDrawerStatus();
  const insets = useSafeAreaInsets();
  const [searchText, setSearchText] = useState("");
  const [foundItems, setFoundItems] = useState<DestinyItem[]>([]);
  const textInputRef = useRef<TextInput>(null);
  const focus = useIsFocused();

  const [allItems, setAllItems] = useState<DestinyItem[]>([]);

  useEffect(() => {
    if (focus) {
      textInputRef.current?.focus();
      setAllItems(getAllItems());
    }
  }, [focus]);

  useEffect(() => {
    if (drawerStatus === "open") {
      Keyboard.dismiss();
    }
  }, [drawerStatus]);

  useEffect(() => {
    searchItems(searchText);
  }, [searchText]);

  const searchItems = useCallback(
    (clue: string) => {
      const foundItems = find(clue, allItems);
      setFoundItems(foundItems);
    },
    [allItems],
  );

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={{ flex: 1, marginBottom: insets.bottom }}
    >
      <View style={{ height: "100%" }}>
        <View style={{ width: "100%", height: 70, backgroundColor: "#1C1C1C" }} />
        <View
          style={{
            width: "100%",
            height: 40,
            paddingLeft: 15,
            paddingRight: 15,
            alignContent: "center",
            position: "absolute",
            top: 15,
          }}
        >
          <View style={{ flex: 1, backgroundColor: "white", opacity: 0.14, borderRadius: 10 }} />
          <View
            style={{
              width: "100%",
              height: 40,
              flexDirection: "row",
              gap: 5,
              position: "absolute",
              left: 30,
              paddingRight: 20,
            }}
          >
            <Image source={SEARCH_ICON} style={{ width: 20, height: 20, opacity: 0.4, alignSelf: "center" }} />
            <TextInput
              ref={textInputRef}
              keyboardAppearance="dark"
              cursorColor="white"
              selectionColor={"white"}
              selectionHandleColor={"white"}
              selectTextOnFocus={false}
              textContentType={"none"}
              enterKeyHint="search"
              autoComplete={"off"}
              spellCheck={false}
              autoCapitalize="none"
              placeholder="Search"
              placeholderTextColor="grey"
              clearButtonMode="always"
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
        <View
          style={{
            flex: 1,
            paddingLeft: 15,
            paddingRight: 0,
          }}
        >
          <FlashList
            keyboardDismissMode="on-drag"
            keyboardShouldPersistTaps="always"
            data={foundItems}
            renderItem={UiCellRenderItem}
            numColumns={5}
            estimatedItemSize={100}
            keyExtractor={keyExtractor}
          />
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

export default React.memo(SearchView);
