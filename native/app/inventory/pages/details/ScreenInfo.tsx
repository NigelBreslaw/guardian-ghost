import { View, StyleSheet, Platform, Dimensions } from "react-native";
import { Image } from "expo-image";

import Text from "@/app/UI/Text.tsx";
import type { DestinyItem } from "@/app/inventory/logic/Types.ts";
import {
  LARGE_CRAFTED,
  LARGE_ENHANCED,
  MASTERWORK_TRIM,
  SCREENSHOT_MASTERWORK_OVERLAY,
  getLargeDamageTypeIconUri,
} from "@/app/utilities/Constants.ts";
import { ICON_SIZE, TierTypeToColor } from "@/app/utilities/UISize.ts";
import IconCell from "@/app/inventory/pages/details/IconCell.tsx";
import QuantityPicker from "@/app/inventory/pages/details/QuantityPicker.tsx";
import { DestinyDefinitions } from "@/app/store/Definitions.ts";
import { ItemType, StatType } from "@/app/bungie/Enums.ts";

const { width } = Dimensions.get("window");
const SCREEN_WIDTH = Platform.OS === "web" ? Math.min(500, width) : width;
const scalar = SCREEN_WIDTH / 1080;
const SCREENSHOT_HEIGHT = (SCREEN_WIDTH / 1920) * 1080;

const masterworkScalar = SCREEN_WIDTH / 2 / 500;

type Props = {
  readonly destinyItem: DestinyItem;
};

export default function ScreenInfo({ destinyItem }: Props) {
  "use memo";
  return (
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
      {destinyItem.instance.enhanced && (
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
          source={LARGE_ENHANCED}
          cachePolicy="none"
        />
      )}
      <Image transition={200} style={styles.secondaryIcon} source={{ uri: destinyItem.def.secondaryIcon }} />
      <View style={styles.tierHeaderContainer}>
        <View style={[styles.tierHeader, { backgroundColor: TierTypeToColor[destinyItem.def.tierType] }]} />
        <View style={[styles.tierHeaderBottom, { backgroundColor: TierTypeToColor[destinyItem.def.tierType] }]} />
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
      </View>
      <Text style={styles.flavorText}>{destinyItem.def.flavorText}</Text>
      {destinyItem.instance.primaryStat > 0 && <PrimaryStatUI destinyItem={destinyItem} />}

      <View style={styles.screenshotFooter} />
      {!destinyItem.def.nonTransferrable &&
        destinyItem.def.maxStackSize > 1 &&
        destinyItem.def.stackUniqueLabel === undefined && <QuantityPicker destinyItem={destinyItem} />}
    </View>
  );
}

function getPrimaryStatLabel(destinyItem: DestinyItem): string {
  if (destinyItem.def.itemType === ItemType.Weapon) {
    return DestinyDefinitions.stat?.[StatType.Power]?.displayProperties.name ?? "";
  }
  if (destinyItem.def.itemType === ItemType.Vehicle) {
    return DestinyDefinitions.stat?.[StatType.Speed]?.displayProperties.name ?? "";
  }
  return "";
}

function PrimaryStatUI({ destinyItem }: { readonly destinyItem: DestinyItem }) {
  "use memo";
  const POWER_NAME = getPrimaryStatLabel(destinyItem);

  return (
    <View style={styles.primaryStat}>
      <View style={{ flexDirection: "row", alignItems: "center" }}>
        {getLargeDamageTypeIconUri(destinyItem.instance.damageType) !== null && (
          <Image style={styles.primaryStatIcon} source={getLargeDamageTypeIconUri(destinyItem.instance.damageType)} />
        )}
        <Text style={styles.primaryStatText}>{destinyItem.instance.primaryStat}</Text>
        <View style={{ width: 3 }} />
        <View>
          <View style={{ height: 7 }} />
          <View
            style={{
              height: 8,
              width: StyleSheet.hairlineWidth,
              backgroundColor: "white",
              transform: [{ translateX: 1 }],
            }}
          />
          <View style={{ height: 2 }} />
          <Text style={styles.powerText}>{POWER_NAME}</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  primaryStat: {
    position: "absolute",
    bottom: 120 * scalar,
    right: 170 * scalar,
  },
  primaryStatText: {
    color: "white",
    fontSize: 30,
    letterSpacing: -1,
    includeFontPadding: false,
    fontWeight: "600",
    textShadowColor: "#000000",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  primaryStatIcon: {
    width: 23,
    height: 23,
    transform: [{ translateY: 3 }],
  },
  powerText: {
    color: "white",
    fontSize: 10,
    includeFontPadding: false,
    textTransform: "uppercase",
    textShadowColor: "#000000AA",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  secondaryIcon: {
    height: SCREENSHOT_HEIGHT / 2,
    width: SCREENSHOT_HEIGHT / 2,
    opacity: 50 / 100,
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
  masterworkTrim: {
    width: 1250,
    height: 50,
    position: "absolute",
    top: -15 * scalar,
    left: 0,
    transformOrigin: "top left",
    transform: [{ scale: SCREEN_WIDTH / 1250 }],
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
    position: "absolute",
    left: 40 * scalar,
    top: 180 * scalar,
    fontSize: 33 * scalar,
    color: "#FFFFFF",
    fontStyle: "italic",
    includeFontPadding: false,
    width: SCREEN_WIDTH * 0.92,
    textShadowColor: "black",
    textShadowOffset: { width: 3 * scalar, height: 3 * scalar },
    textShadowRadius: 1 * scalar,
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
  screenshotFooter: {
    position: "absolute",
    bottom: 0,
    width: "100%",
    height: 50 * scalar,
    backgroundColor: "black",
    opacity: 0.3,
  },
});
