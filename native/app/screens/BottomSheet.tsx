import type { DestinyItem } from "@/app/bungie/Types.ts";
import TransferEquipButtons from "@/app/screens/TransferEquipButtons.tsx";
import { itemTypeDisplayName, itemsDefinition } from "@/app/store/Definitions.ts";
import { useGGStore } from "@/app/store/GGStore.ts";
import { startTransfer } from "@/app/transfer/TransferLogic.ts";
import type { NavigationProp, RouteProp } from "@react-navigation/native";
import { Image } from "expo-image";
import { useEffect, useRef, useState } from "react";
import { StatusBar, StyleSheet, Text, View, useWindowDimensions, TextInput, Platform, Keyboard } from "react-native";
import { TouchableWithoutFeedback } from "react-native-gesture-handler";
import RBSheet from "react-native-raw-bottom-sheet";

type ViewData = {
  itemInstanceId: string | undefined;
  itemTypeDisplayName: string;
  screenshot: string;
  name: string;
};

function buildViewData(destinyItem: DestinyItem): ViewData {
  const itemDef = itemsDefinition[destinyItem.itemHash];

  let screenshot = "";

  if (destinyItem.overrideStyleItemHash !== undefined) {
    const overrideDef = itemsDefinition[destinyItem.overrideStyleItemHash];
    const s = overrideDef?.s;
    if (s) {
      screenshot = `https://www.bungie.net/common/destiny2_content/screenshots/${s}`;
    }
  } else {
    const s = itemDef?.s;
    if (s) {
      screenshot = `https://www.bungie.net/common/destiny2_content/screenshots/${s}`;
    }
  }
  const name = itemDef?.n;
  const itd = itemDef?.itd;

  const viewData: ViewData = {
    itemInstanceId: destinyItem.itemInstanceId,
    screenshot: screenshot,
    name: name ? name.toLocaleUpperCase() : "",
    itemTypeDisplayName: itd ? itemTypeDisplayName[itd]?.toLocaleUpperCase() ?? "" : "",
  };
  return viewData;
}

const styles = StyleSheet.create({
  quantityRoot: {
    left: 20,
    position: "absolute",
    bottom: 20,
  },
  quantity: {
    width: 100,
    height: 30,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: "grey",
  },
  quantityText: {
    color: "white",
    fontSize: 15,
    fontWeight: "bold",
    includeFontPadding: false,
    height: "100%",
    width: "100%",
    paddingLeft: 5,
  },
  quantityTitle: {
    color: "white",
    fontSize: 15,
    fontWeight: "bold",
    includeFontPadding: false,
  },
});

export default function BottomSheet({
  navigation,
  route,
}: {
  navigation: NavigationProp<ReactNavigation.RootParamList>;
  route: RouteProp<ReactNavigation.RootParamList, "BottomSheet">;
}) {
  const refRBSheet = useRef<RBSheet>(null);
  const { width } = useWindowDimensions();
  const SCREEN_WIDTH = width;
  const { characterId } = route.params.item;
  const [viewData, _setViewData] = useState<ViewData>(buildViewData(route.params.item));
  const destinyItem = useGGStore.getState().selectedItem;

  if (!destinyItem) {
    return null;
  }

  const quantity = useGGStore((state) => state.quantityToTransfer);

  useEffect(() => {
    if (refRBSheet.current) {
      const maxQuantityToTransfer = useGGStore.getState().findMaxQuantityToTransfer(destinyItem);
      useGGStore.getState().setQuantityToTransfer(maxQuantityToTransfer);
      refRBSheet.current.open();
    }
  }, [destinyItem]);

  function transfer(targetId: string, equipOnTarget = false) {
    const transferQuantity = useGGStore.getState().quantityToTransfer;
    if (destinyItem) {
      startTransfer(targetId, destinyItem, transferQuantity, equipOnTarget);
    }
  }

  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "transparent",
      }}
    >
      <StatusBar barStyle="light-content" />
      <RBSheet
        ref={refRBSheet}
        closeOnDragDown={true}
        closeOnPressMask={true}
        onClose={() => {
          navigation.goBack();
          useGGStore.getState().setSelectedItem(null);
        }}
        height={600}
        customStyles={{
          wrapper: {
            backgroundColor: "transparent",
          },
          draggableIcon: {
            backgroundColor: "white",
          },
          container: {
            backgroundColor: "#111116",
            width: Platform.OS === "web" ? 500 : "100%",
          },
        }}
      >
        <TouchableWithoutFeedback onPressIn={Keyboard.dismiss}>
          <View style={{ height: "100%" }}>
            <View
              style={{
                width: "100%",
                height: (SCREEN_WIDTH / 1920) * 1080,
              }}
            >
              <Image
                transition={200}
                style={[
                  {
                    width: "100%",
                    height: (SCREEN_WIDTH / 1920) * 1080,
                  },
                  StyleSheet.absoluteFillObject,
                ]}
                source={{ uri: viewData.screenshot }}
              />

              <View style={{ flex: 2 }} />
              <View style={{ flex: 4, flexDirection: "row" }}>
                <View style={{ flex: 1 }} />
                <View style={{ flex: 18 }}>
                  <Text
                    style={{
                      fontSize: 20,
                      fontWeight: "bold",
                      color: "white",
                      fontFamily: "Helvetica",
                      includeFontPadding: false,
                      lineHeight: 20,
                    }}
                  >
                    {viewData.name}
                  </Text>
                  <Text
                    style={{
                      fontSize: 13,
                      color: "white",
                      opacity: 0.6,
                      includeFontPadding: false,
                      transform: [{ translateY: -4 }],
                    }}
                  >
                    {viewData.itemTypeDisplayName}
                  </Text>
                </View>
              </View>
              <View style={{ flex: 15 }} />
              <View style={{ flex: 1 }}>
                <View style={{ flex: 1, backgroundColor: "#000000", opacity: 0.4 }} />
              </View>
              {destinyItem.maxStackSize > 1 && (
                <View style={styles.quantityRoot}>
                  <Text style={styles.quantityTitle}>{"Quantity to transfer:"}</Text>
                  <View style={styles.quantity}>
                    <TextInput
                      inputMode="numeric"
                      style={styles.quantityText}
                      value={quantity.toString()}
                      onChangeText={(value) => {
                        const maxAmount = useGGStore.getState().findMaxQuantityToTransfer(destinyItem);
                        const valueAsNumber = Number.parseInt(value);
                        if (valueAsNumber > maxAmount) {
                          useGGStore.getState().setQuantityToTransfer(maxAmount);
                        } else if (valueAsNumber < 1 || Number.isNaN(valueAsNumber)) {
                          useGGStore.getState().setQuantityToTransfer(1);
                        } else {
                          useGGStore.getState().setQuantityToTransfer(valueAsNumber);
                        }
                      }}
                    />
                  </View>
                </View>
              )}
            </View>

            <View>
              <TransferEquipButtons
                close={() => {
                  if (refRBSheet.current) {
                    refRBSheet.current.close();
                  }
                }}
                destinyItem={destinyItem}
                startTransfer={transfer}
                currentCharacterId={characterId}
              />
            </View>
          </View>
        </TouchableWithoutFeedback>
      </RBSheet>
    </View>
  );
}
