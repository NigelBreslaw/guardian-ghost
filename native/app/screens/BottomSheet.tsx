import type { DestinyItem } from "@/app/bungie/Types.ts";
import { itemTypeDisplayName, itemsDefinition } from "@/app/store/Definitions.ts";
import { useGGStore } from "@/app/store/GGStore.ts";
import { startTransfer } from "@/app/transfer/TransferLogic.ts";
import { GLOBAL_INVENTORY_NAMES, VAULT_CHARACTER_ID } from "@/app/utilities/Constants.ts";
import type { NavigationProp, RouteProp } from "@react-navigation/native";
import { Image } from "expo-image";
import { useEffect, useRef, useState } from "react";
import { StatusBar, StyleSheet, Text, View, useWindowDimensions, TextInput, Platform, Keyboard } from "react-native";
import {
  Gesture,
  GestureDetector,
  GestureHandlerRootView,
  TouchableWithoutFeedback,
} from "react-native-gesture-handler";
import RBSheet from "react-native-raw-bottom-sheet";
import { runOnJS } from "react-native-reanimated";

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

type TransferEquipButtonsProps = {
  currentCharacterId: string;
  destinyItem: DestinyItem;
  close: () => void;
  startTransfer: (toCharacterId: string, equipOnTarget: boolean) => void;
};

function TransferEquipButtons(props: TransferEquipButtonsProps) {
  const rectangles = [];

  const ggCharacters = useGGStore((state) => state.ggCharacters);
  const scale = 0.6;
  const originalWidth = 350;
  const originalHeight = 96;
  const transferWidth = originalWidth * scale;
  const transferHeight = originalHeight * scale;
  const borderRadius = 15;

  const itemDefinition = itemsDefinition[props.destinyItem.itemHash];
  const nonTransferable = itemDefinition?.nt === 1;
  const equipable = itemDefinition?.e === 1;

  function calcEquipOpacity(buttonCharacterId: string): number {
    if (buttonCharacterId === VAULT_CHARACTER_ID) {
      return 0;
    }
    if (!equipable) {
      return 0;
    }
    if (calcEquipButtonDisabled(buttonCharacterId)) {
      return 0.2;
    }
    return 1;
  }

  function calcTransferOpacity(buttonCharacterId: string): number {
    if (nonTransferable) {
      return 0;
    }
    if (calcTransferButtonDisabled(buttonCharacterId)) {
      return 0.2;
    }
    return 1;
  }

  // only call this if you already checked the item is equipable
  function calcEquipButtonDisabled(buttonCharacterId: string): boolean {
    // is this item already on the character, but not in the postmaster?
    if (buttonCharacterId === props.currentCharacterId && props.destinyItem.bucketHash !== 215593132) {
      if (props.destinyItem.equipped) {
        return true;
      }
      return false;
    }
    return false;
  }

  function calcTransferButtonDisabled(buttonCharacterId: string): boolean {
    // is this item already on the character, but not in the postmaster?
    if (buttonCharacterId === props.currentCharacterId && props.destinyItem.bucketHash !== 215593132) {
      return true;
    }
    return false;
  }

  for (const ggCharacter of ggCharacters) {
    // Global items can only be transferred to the vault
    if (GLOBAL_INVENTORY_NAMES.includes(props.destinyItem.characterId)) {
      if (ggCharacter.characterId !== VAULT_CHARACTER_ID) {
        continue;
      }
    }

    const isTransferDisabled = calcTransferButtonDisabled(ggCharacter.characterId);
    const isEquipDisabled = calcEquipButtonDisabled(ggCharacter.characterId);

    if (nonTransferable && ggCharacter.characterId !== props.currentCharacterId) {
      continue;
    }

    const transferTap = Gesture.Tap().onBegin(() => {
      if (isTransferDisabled) {
        return;
      }
      runOnJS(props.startTransfer)(ggCharacter.characterId, false);
      runOnJS(props.close)();
    });
    const transferAndEquipTap = Gesture.Tap().onBegin(() => {
      if (isEquipDisabled) {
        return;
      }
      runOnJS(props.startTransfer)(ggCharacter.characterId, true);
      runOnJS(props.close)();
    });

    rectangles.push(
      <GestureHandlerRootView key={ggCharacter.characterId} style={{ flexDirection: "row", gap: 5 }}>
        <GestureDetector gesture={transferTap}>
          <View
            style={{
              width: transferWidth,
              height: transferHeight,
              borderRadius,
              overflow: "hidden",
              opacity: calcTransferOpacity(ggCharacter.characterId),
              display: calcTransferOpacity(ggCharacter.characterId) === 0 ? "none" : "flex",
            }}
          >
            <View
              style={{
                width: originalWidth,

                overflow: "hidden",
                transformOrigin: "top left",
                transform: [{ scale: scale }],
              }}
            >
              <Image source={ggCharacter.emblemBackgroundPath} style={{ width: 474, height: 96 }} />
              <View style={[StyleSheet.absoluteFillObject, { flex: 1, alignContent: "center" }]}>
                <Text>Character: {ggCharacter.characterId}</Text>
              </View>
            </View>
            <View
              style={{
                position: "absolute",
                top: 0,
                bottom: 0,
                left: 0,
                right: 0,
                borderRadius,
                borderWidth: 1,
                borderColor: "grey",
              }}
            />
          </View>
        </GestureDetector>
        <GestureDetector gesture={transferAndEquipTap}>
          <View
            style={{
              width: transferHeight,
              height: transferHeight,
              borderRadius,
              overflow: "hidden",
              opacity: calcEquipOpacity(ggCharacter.characterId),
              display: calcTransferOpacity(ggCharacter.characterId) === 0 ? "none" : "flex",
            }}
          >
            <View
              style={{
                transformOrigin: "top left",
                transform: [{ scale: scale }],
              }}
            >
              <Image source={ggCharacter.emblemPath} style={{ width: 96, height: 96 }} />
            </View>
            <View
              style={{
                position: "absolute",
                top: 0,
                bottom: 0,
                left: 0,
                right: 0,
                borderRadius,
                borderWidth: 1,
                borderColor: "grey",
              }}
            />
          </View>
        </GestureDetector>
      </GestureHandlerRootView>,
    );
  }
  console.log("RENDER BUTTONS");
  return <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 5, padding: 15 }}>{rectangles}</View>;
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
  const { itemInstanceId, itemHash, characterId } = route.params.item;
  const [viewData, _setViewData] = useState<ViewData>(buildViewData(route.params.item));
  const destinyItem = { ...useGGStore.getState().findDestinyItem({ itemInstanceId, itemHash, characterId }) };

  const quantity = useGGStore((state) => state.quantityToTransfer);
  console.log("quantity", quantity);

  useEffect(() => {
    if (refRBSheet.current) {
      useGGStore.getState().setQuantityToTransfer(destinyItem.quantity);
      refRBSheet.current.open();
    }
  }, []);

  function transfer(targetId: string, equipOnTarget = false) {
    const transferQuantity = useGGStore.getState().quantityToTransfer;
    startTransfer(targetId, destinyItem, transferQuantity, equipOnTarget);
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
              {quantity > 1 && (
                <View style={styles.quantityRoot}>
                  <Text style={styles.quantityTitle}>{"Quantity to transfer:"}</Text>
                  <View style={styles.quantity}>
                    <TextInput
                      inputMode="numeric"
                      style={styles.quantityText}
                      value={quantity.toString()}
                      onChangeText={(value) => {
                        console.log("onChangeText", value);
                        useGGStore.getState().setQuantityToTransfer(Number.parseInt(value));
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
