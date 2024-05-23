import TransferEquipButtons from "@/app/inventory/pages/TransferEquipButtons.tsx";
import { useGGStore } from "@/app/store/GGStore.ts";
import { startTransfer } from "@/app/inventory/logic/Transfer.ts";
import { ICON_SIZE, TierTypeToColor } from "@/app/utilities/UISize.ts";
import { Image } from "expo-image";
import { useCallback, useMemo, useRef } from "react";
import { StyleSheet, Text, View, TextInput, Platform, Dimensions, ScrollView } from "react-native";
import Stats from "@/app/stats/Stats";
import { LARGE_CRAFTED, MASTERWORK_TRIM, SCREENSHOT_MASTERWORK_OVERLAY } from "@/app/inventory/logic/Constants.ts";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import IconCell from "@/app/inventory/pages/IconCell.tsx";
import type { NavigationProp, RouteProp } from "@react-navigation/native";
import { useFocusEffect } from "@react-navigation/native";
import type { RootStackParamList } from "@/app/Root.tsx";
import { findDestinyItem } from "@/app/store/AccountLogic.ts";
import type { CharacterId } from "@/app/core/GetProfile.ts";
import BottomSheet from "@gorhom/bottom-sheet";
import Animated, {
  Extrapolation,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";
import { TouchableOpacity } from "react-native-gesture-handler";

const { width } = Dimensions.get("window");

const SCREEN_WIDTH = Platform.OS === "web" ? Math.min(500, width) : width;
const scalar = SCREEN_WIDTH / 1080;
const SCREENSHOT_HEIGHT = (SCREEN_WIDTH / 1920) * 1080;

const masterworkScalar = SCREEN_WIDTH / 2 / 500;
const styles = StyleSheet.create({
  scroll: {
    flex: 1,
    width: "100%",
    height: "100%",
  },
  transferHint: {
    color: "white",
    fontSize: 15,
    padding: 10,
    fontWeight: "bold",
    includeFontPadding: false,
  },
  contentContainer: {
    flex: 1,
    alignItems: "center",
    backgroundColor: "#17101F",
  },
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
    height: 30 * scalar,
    backgroundColor: "black",
    opacity: 0.3,
  },
  secondaryIcon: {
    height: SCREENSHOT_HEIGHT / 2,
    width: SCREENSHOT_HEIGHT / 2,
    opacity: 50 / 100,
  },
  masterworkTrim: {
    width: 1250,
    height: 50,
    position: "absolute",
    top: -15 * scalar,
    left: 0,
    transformOrigin: "top left",
    transform: [{ scale: SCREEN_WIDTH / 1250 }],
  },
  tierHeaderContainer: {
    position: "absolute",
    width: SCREEN_WIDTH,
    height: 30 * scalar,
  },
  tierHeader: {
    flex: 1,
    opacity: 40 / 100,
  },
  tierHeaderBottom: {
    width: SCREEN_WIDTH,
    height: 5 * scalar,
    opacity: 50 / 100,
    bottom: 0,
    position: "absolute",
  },
  itemDetails: {
    position: "absolute",
    top: 70 * scalar,
    left: 33 * scalar,

    height: 80 * scalar,
  },
  itemIconAndName: {
    flexDirection: "row",
    gap: 15 * scalar,
  },
  icon: {
    width: 80 * scalar,
    height: 80 * scalar,
    transformOrigin: "top left",
    transform: [{ scale: (80 / ICON_SIZE) * scalar }],
  },
  nameText: {
    fontSize: 21,
    fontWeight: "bold",
    color: "white",
    fontFamily: "Helvetica",
    includeFontPadding: false,
    lineHeight: 21,
    letterSpacing: -0.5,
    textTransform: "uppercase",
    textShadowColor: "#000000AA",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  itemTypeText: {
    fontSize: 13,
    color: "white",
    opacity: 0.6,
    includeFontPadding: false,
    transform: [{ translateY: -4 }],
    textTransform: "uppercase",
    textShadowColor: "#000000AA",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 1,
  },
  flavorText: {
    fontSize: 13,
    color: "#FFFFFFDD",
    includeFontPadding: false,
    maxWidth: SCREEN_WIDTH - 200 * scalar,
    transform: [{ translateY: 20 * scalar }],
    textShadowColor: "black",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 1,
  },
  masterworkContainer: {
    position: "absolute",
    bottom: -10 * scalar,
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
  categoryTitle: {
    color: "white",
    fontSize: 15,
    includeFontPadding: false,
  },
  socketTitle: {
    color: "white",
    fontSize: 15,
    fontWeight: "bold",
    includeFontPadding: false,
  },
  socketValue: {
    color: "white",
    fontSize: 15,
    fontWeight: "bold",
    includeFontPadding: false,
    transform: [{ translateY: -4 }],
  },
});

export default function DetailsView({
  route,
  navigation,
}: {
  readonly route: RouteProp<RootStackParamList, "Details">;
  readonly navigation: NavigationProp<ReactNavigation.RootParamList>;
}) {
  const insets = useSafeAreaInsets();
  const destinyItem = findDestinyItem(route.params);
  const quantity = useGGStore((state) => state.quantityToTransfer);

  const bottomSheetRef = useRef<BottomSheet>(null);
  const snapPoints = useMemo(() => [60, 300], []);

  useFocusEffect(
    useCallback(() => {
      const maxQuantityToTransfer = useGGStore.getState().findMaxQuantityToTransfer(destinyItem);
      useGGStore.getState().setQuantityToTransfer(maxQuantityToTransfer);
    }, [destinyItem]),
  );

  function transfer(targetId: CharacterId, equipOnTarget = false) {
    const transferQuantity = useGGStore.getState().quantityToTransfer;
    if (destinyItem) {
      startTransfer(targetId, destinyItem, transferQuantity, equipOnTarget);
    }
  }

  const opacity = useSharedValue(1);
  const transferButtonStyle = useAnimatedStyle(() => ({
    opacity: interpolate(opacity.value, [0, 1], [0, 1], Extrapolation.CLAMP),
  }));
  const transferHintStyle = useAnimatedStyle(() => ({
    opacity: interpolate(opacity.value, [0, 1], [1, 0], Extrapolation.CLAMP),
  }));

  if (!destinyItem) {
    return null;
  }

  return (
    <View style={{ flex: 1 }}>
      <ScrollView keyboardShouldPersistTaps="always" style={[styles.scroll, { marginBottom: insets.bottom }]}>
        {destinyItem && (
          <View style={{ height: "100%" }}>
            <View
              style={{
                width: "100%",
                height: (SCREEN_WIDTH / 1920) * 1080,
                overflow: "hidden",
              }}
            >
              <Image
                transition={200}
                style={[
                  {
                    position: "absolute",
                    width: "100%",
                    height: (SCREEN_WIDTH / 1920) * 1080,
                  },
                ]}
                source={{ uri: destinyItem.instance.screenshot }}
              />

              {destinyItem.instance.masterwork && (
                <View style={styles.masterworkContainer}>
                  <Image style={styles.masterworkLeft} source={SCREENSHOT_MASTERWORK_OVERLAY} cachePolicy="none" />
                  <Image style={styles.masterworkRight} source={SCREENSHOT_MASTERWORK_OVERLAY} cachePolicy="none" />
                </View>
              )}
              {destinyItem.instance.crafted && (
                <Image
                  style={{
                    opacity: 0.8,
                    width: 400,
                    height: 292,
                    position: "absolute",
                    bottom: 0,
                    left: 0,
                    transformOrigin: "bottom left",
                    transform: [{ scale: SCREEN_WIDTH / 3 / 400 }],
                  }}
                  source={LARGE_CRAFTED}
                  cachePolicy="none"
                />
              )}
              <Image transition={200} style={styles.secondaryIcon} source={{ uri: destinyItem.def.secondaryIcon }} />
              <View style={styles.tierHeaderContainer}>
                <View style={[styles.tierHeader, { backgroundColor: TierTypeToColor[destinyItem.def.tierType] }]} />
                <View
                  style={[styles.tierHeaderBottom, { backgroundColor: TierTypeToColor[destinyItem.def.tierType] }]}
                />
              </View>
              {destinyItem.instance.masterwork && (
                <Image style={styles.masterworkTrim} source={MASTERWORK_TRIM} cachePolicy={"none"} />
              )}

              <View style={styles.itemDetails}>
                <View style={styles.itemIconAndName}>
                  <View style={styles.icon}>
                    <IconCell destinyItem={destinyItem} />
                  </View>

                  <View>
                    <Text style={styles.nameText}>{destinyItem.def.name}</Text>
                    <Text style={styles.itemTypeText}>{destinyItem.def.itemTypeDisplayName}</Text>
                  </View>
                </View>
                <Text style={styles.flavorText}>{destinyItem.def.flavorText}</Text>
              </View>
              <View style={{ flex: 15 }} />
              <View style={styles.screenshotFooter} />
              {!destinyItem.def.nonTransferrable &&
                destinyItem.def.maxStackSize > 1 &&
                destinyItem.def.stackUniqueLabel === undefined && (
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
            <Stats destinyItem={destinyItem} />
            {Platform.OS === "web" && (
              <View>
                <TransferEquipButtons
                  close={() => {
                    navigation.goBack();
                  }}
                  destinyItem={destinyItem}
                  startTransfer={transfer}
                />
              </View>
            )}
          </View>
        )}
      </ScrollView>
      {Platform.OS !== "web" && (
        <BottomSheet
          ref={bottomSheetRef}
          index={1}
          snapPoints={snapPoints}
          animateOnMount={false}
          handleStyle={{ backgroundColor: "black" }}
          handleIndicatorStyle={{ backgroundColor: "white" }}
          bottomInset={insets.bottom}
          backgroundStyle={{ backgroundColor: "#17101F" }}
          onAnimate={(_a, b) => {
            opacity.value = withSpring(b);
          }}
        >
          <View>
            <Animated.View style={[transferButtonStyle]}>
              <TransferEquipButtons
                close={() => {
                  navigation.goBack();
                }}
                destinyItem={destinyItem}
                startTransfer={transfer}
              />
            </Animated.View>
            <Animated.View
              style={[transferHintStyle, { width: "100%", position: "absolute", top: 0, alignItems: "flex-end" }]}
            >
              <TouchableOpacity onPress={() => bottomSheetRef.current?.snapToIndex(1)}>
                <Text style={styles.transferHint}>Transfer</Text>
              </TouchableOpacity>
            </Animated.View>
          </View>
        </BottomSheet>
      )}
    </View>
  );
}
