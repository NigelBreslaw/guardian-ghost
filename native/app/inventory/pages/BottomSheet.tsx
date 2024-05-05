import type { DestinyItem } from "@/app/inventory/logic/Types.ts";
import TransferEquipButtons from "@/app/inventory/pages/TransferEquipButtons.tsx";
import { ItemTypeDisplayName, itemsDefinition } from "@/app/store/Definitions.ts";
import { useGGStore } from "@/app/store/GGStore.ts";
import { createSockets } from "@/app/inventory/logic/Sockets.ts";
import { startTransfer } from "@/app/inventory/logic/Transfer.ts";
import { TierTypeToColor } from "@/app/utilities/UISize.ts";
import type { NavigationProp, RouteProp } from "@react-navigation/native";
import { Image } from "expo-image";
import { useEffect, useRef, useState } from "react";
import {
  StatusBar,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
  TextInput,
  Platform,
  Keyboard,
  Dimensions,
} from "react-native";
import { TouchableWithoutFeedback } from "react-native-gesture-handler";
import RBSheet from "react-native-raw-bottom-sheet";

const SCREENSHOT_MASTERWORK_OVERLAY = require("../../../images/masterwork-landscape-overlay.png");

type ViewData = {
  itemInstanceId: string | undefined;
  itemTypeDisplayName: string;
  screenshot: string;
  secondaryIcon: string;
  name: string;
};

function buildViewData(destinyItem: DestinyItem): ViewData {
  const _sockets = createSockets(destinyItem);
  const itemDef = itemsDefinition[destinyItem.itemHash];
  let screenshot = "";
  let secondaryIcon = "";

  if (destinyItem.overrideStyleItemHash !== undefined) {
    const overrideDef = itemsDefinition[destinyItem.overrideStyleItemHash];
    if (overrideDef) {
      const s = overrideDef?.s;
      const si = overrideDef?.si;
      if (s) {
        screenshot = `https://www.bungie.net/common/destiny2_content/screenshots/${s}`;
      }
      if (si) {
        secondaryIcon = `https://www.bungie.net/common/destiny2_content/icons/${si}`;
      }
    }
  }
  if (screenshot === "" && itemDef?.s) {
    screenshot = `https://www.bungie.net/common/destiny2_content/screenshots/${itemDef?.s}`;
  }
  if (secondaryIcon === "" && itemDef?.si) {
    secondaryIcon = `https://www.bungie.net/common/destiny2_content/icons/${itemDef?.si}`;
  }
  const name = itemDef?.n;
  const itd = itemDef?.itd;

  const viewData: ViewData = {
    itemInstanceId: destinyItem.itemInstanceId,
    screenshot: screenshot,
    secondaryIcon: secondaryIcon,
    name: name ? name.toLocaleUpperCase() : "",
    itemTypeDisplayName: itd ? ItemTypeDisplayName[itd]?.toLocaleUpperCase() ?? "" : "",
  };
  return viewData;
}

const { width } = Dimensions.get("window");
const SCREEN_WIDTH = width;
const scalar = SCREEN_WIDTH / 1080;
const SCREENSHOT_HEIGHT = (SCREEN_WIDTH / 1920) * 1080;

const masterworkScalar = SCREEN_WIDTH / 2 / 500;
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
  screenshotFooter: {
    position: "absolute",
    bottom: 0,
    width: "100%",
    height: 50 * scalar,
    backgroundColor: "black",
    opacity: 0.3,
  },
  secondaryIcon: {
    height: SCREENSHOT_HEIGHT / 2,
    width: SCREENSHOT_HEIGHT / 2,
    opacity: 50 / 100,
  },
  tierHeaderContainer: {
    position: "absolute",
    width: SCREEN_WIDTH,
    height: 25 * scalar,
  },
  tierHeader: {
    flex: 1,
    opacity: 40 / 100,
  },
  tierHeaderBottom: {
    width: SCREEN_WIDTH,
    height: 4 * scalar,
    opacity: 30 / 100,
    bottom: 0,
    position: "absolute",
  },
  itemDetails: {
    position: "absolute",
    top: 100 * scalar,
    flex: 4,
    flexDirection: "row",
  },
  masterworkContainer: {
    position: "absolute",
    bottom: -20 * scalar,
    alignSelf: "center",
    flexDirection: "row",
  },
  masterworkLeft: {
    width: 700 * masterworkScalar,
    height: 264 * masterworkScalar,
  },
  masterworkRight: {
    width: 700 * masterworkScalar,
    height: 264 * masterworkScalar,
    transform: [{ scaleX: -1 }],
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

  const [viewData, setViewData] = useState<ViewData | null>(null);
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
      setViewData(buildViewData(route.params.item));
    }
  }, [destinyItem, route.params.item]);

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
        {viewData && (
          <TouchableWithoutFeedback onPressIn={Keyboard.dismiss}>
            <View style={{ height: "100%" }}>
              <View
                style={{
                  width: "100%",
                  height: (SCREEN_WIDTH / 1920) * 980,
                  overflow: "hidden",
                }}
              >
                <Image
                  transition={200}
                  style={[
                    {
                      position: "absolute",
                      top: -((SCREEN_WIDTH / 1920) * 40),
                      width: "100%",
                      height: (SCREEN_WIDTH / 1920) * 1080,
                    },
                    // StyleSheet.absoluteFillObject,
                  ]}
                  source={{ uri: viewData.screenshot }}
                />
                {destinyItem.masterwork && (
                  <View style={styles.masterworkContainer}>
                    <Image style={styles.masterworkLeft} source={SCREENSHOT_MASTERWORK_OVERLAY} />
                    <Image style={styles.masterworkRight} source={SCREENSHOT_MASTERWORK_OVERLAY} />
                  </View>
                )}
                <Image transition={200} style={styles.secondaryIcon} source={{ uri: viewData.secondaryIcon }} />
                <View style={styles.tierHeaderContainer}>
                  <View style={[styles.tierHeader, { backgroundColor: TierTypeToColor[destinyItem.tierType] }]} />
                  <View style={[styles.tierHeaderBottom, { backgroundColor: TierTypeToColor[destinyItem.tierType] }]} />
                </View>

                <View style={styles.itemDetails}>
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
                <View style={styles.screenshotFooter} />
                {!destinyItem.nonTransferrable &&
                  destinyItem.maxStackSize > 1 &&
                  destinyItem.stackUniqueLabel === undefined && (
                    <View style={styles.quantityRoot}>
                      <Text style={styles.quantityTitle}>{"Quantity to transfer:"}</Text>
                      <View style={styles.quantity}>
                        <TextInput
                          inputMode="numeric"
                          style={styles.quantityText}
                          value={quantity === 0 ? "" : quantity.toString()}
                          onChangeText={(value) => {
                            const maxAmount = useGGStore.getState().findMaxQuantityToTransfer(destinyItem);
                            const valueAsNumber = Number.parseInt(value);
                            if (valueAsNumber > maxAmount) {
                              useGGStore.getState().setQuantityToTransfer(maxAmount);
                            } else if (valueAsNumber < 1 || Number.isNaN(valueAsNumber)) {
                              useGGStore.getState().setQuantityToTransfer(0);
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
        )}
      </RBSheet>
    </View>
  );
}
