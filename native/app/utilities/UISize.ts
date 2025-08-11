import { Dimensions, StyleSheet } from "react-native";

import { TierType } from "@/app/bungie/Enums.ts";
import { DEFAULT_OVERLAP_COLOR } from "@/app/utilities/Constants.ts";

const { width } = Dimensions.get("window");

const MIN_WIDTH = 16 * 2 + 5 * 72 + 4 * 16;

let GLOBAL_SCALAR = 1;
if (width < MIN_WIDTH) {
  GLOBAL_SCALAR = width / MIN_WIDTH;
}

export const INV_MAX_WIDTH = Math.ceil((MIN_WIDTH - 16 * 2) * GLOBAL_SCALAR);

export const ICON_SIZE = Math.ceil(72 * GLOBAL_SCALAR);
export const ICON_BORDER_SIZE = Math.ceil(8 * GLOBAL_SCALAR);
export const GEAR_TIER_WIDTH = Math.ceil(10 * 0.7 * GLOBAL_SCALAR);
export const GEAR_TIER_HEIGHT = Math.ceil(61 * 0.7 * GLOBAL_SCALAR);
export const GEAR_TIER_OFFSET_TOP = Math.ceil(12 * GLOBAL_SCALAR);
export const GEAR_TIER_OFFSET_LEFT = Math.ceil(3 * GLOBAL_SCALAR);
export const INNER_FRAME_SIZE = Math.ceil(ICON_SIZE * 0.96);
export const ICON_MARGIN = Math.ceil(16 * GLOBAL_SCALAR);
export const DEFAULT_MARGIN = Math.ceil(16 * GLOBAL_SCALAR);
export const MINI_ICON_SIZE = Math.ceil(18 * GLOBAL_SCALAR);
export const MINI_BURN_SIZE = Math.ceil(MINI_ICON_SIZE * 0.83);
export const PRIMARY_STAT_FONT_SIZE = Math.ceil(14 * GLOBAL_SCALAR);
export const RIGHT_ALIGNMENT = Math.ceil(-9 * GLOBAL_SCALAR);

export const DEFAULT_SECTION_4_WIDTH = 4 * ICON_SIZE + 3 * ICON_MARGIN;
export const EQUIP_SECTION_HEIGHT = 3 * ICON_SIZE + 2 * ICON_MARGIN;
export const FOOTER_HEIGHT = Math.ceil(18 * GLOBAL_SCALAR);

export const ENGRAMS_SECTION_HEIGHT = ICON_SIZE * 2;
export const ENGRAMS_SECTION_WIDTH = ICON_SIZE * 5 + 20 * GLOBAL_SCALAR;

export const VAULT_5x5_HEIGHT = ICON_SIZE * 5 + ICON_MARGIN * 4;
export const EQUIP_SECTION_SIZE = ICON_SIZE * 3 + 2 * ICON_MARGIN;
export const SEPARATOR_HEIGHT = 70 * GLOBAL_SCALAR;

enum TierTintColor {
  Exotic = "#CEAF33",
  Legendary = "#422458",
  Rare = "#497190",
  Common = "#275B32",
  Uncommon = "#BCB5AC",
  Unknown = "transparent",
}

export const TierTypeToColor = {
  [TierType.Exotic]: TierTintColor.Exotic,
  [TierType.Legendary]: TierTintColor.Legendary,
  [TierType.Rare]: TierTintColor.Rare,
  [TierType.Common]: TierTintColor.Common,
  [TierType.Uncommon]: TierTintColor.Uncommon,
  [TierType.Unknown]: TierTintColor.Unknown,
  [TierType.Currency]: TierTintColor.Unknown,
};

export const common = StyleSheet.create({
  primaryStat: {
    paddingLeft: 2 * GLOBAL_SCALAR,
    paddingRight: 2 * GLOBAL_SCALAR,
    paddingTop: 0,
    paddingBottom: 0,
    borderRadius: 5 * GLOBAL_SCALAR,
    backgroundColor: DEFAULT_OVERLAP_COLOR,
    position: "absolute",
    bottom: -7,
    right: -8,
    justifyContent: "center",
    alignItems: "center",
  },
  primaryStatText: {
    color: "white",
    fontSize: PRIMARY_STAT_FONT_SIZE,
    fontWeight: "bold",
    alignContent: "center",
    includeFontPadding: false,
    pointerEvents: "none",
  },
  quantity: {
    paddingLeft: 2,
    paddingRight: 2,
    paddingTop: 0,
    paddingBottom: 0,
    borderRadius: 4,
    position: "absolute",
    bottom: 2,
    right: 2,
    justifyContent: "center",
    alignItems: "center",
  },
});

export const DestinyIconStyles = StyleSheet.create({
  container: {
    width: ICON_SIZE,
    height: ICON_SIZE,
  },
  icon: {
    width: ICON_SIZE,
    height: ICON_SIZE,
    borderRadius: 8,
    overflow: "hidden",
    borderWidth: 2,
    pointerEvents: "none",
  },
  iconWatermark: {
    width: ICON_SIZE,
    height: ICON_SIZE,
    position: "absolute",
    top: -1.5,
    left: -1.5,
    pointerEvents: "none",
  },
  iconWatermarkFeatured: {
    width: ICON_SIZE * 1.2,
    height: ICON_SIZE * 1.2,
    position: "absolute",
    top: -2,
    left: -2,
    pointerEvents: "none",
    // zIndex: 9999999,
  },
  innerFrameSize: {
    width: INNER_FRAME_SIZE,
    height: INNER_FRAME_SIZE,
    position: "absolute",
    top: -0.5,
    left: -0.5,
    pointerEvents: "none",
  },
  quantity: {
    ...common.quantity,
    backgroundColor: "#AEAEAE",
  },
  quantityMaxed: {
    ...common.quantity,
    backgroundColor: "#A48F36",
  },
  quantityLevelText: {
    color: "black",
    fontSize: PRIMARY_STAT_FONT_SIZE,
    alignContent: "center",
    includeFontPadding: false,
    pointerEvents: "none",
  },
  quantityLevelTextMaxed: {
    color: "#F7F8E3",
    fontSize: PRIMARY_STAT_FONT_SIZE,
    alignContent: "center",
    includeFontPadding: false,
    pointerEvents: "none",
  },
  primaryStat: {
    ...common.primaryStat,
  },
  primaryStatText: {
    ...common.primaryStatText,
  },
  miniIconBurnSize: {
    width: MINI_BURN_SIZE,
    height: MINI_BURN_SIZE,
    pointerEvents: "none",
  },
  gearTier: {
    top: GEAR_TIER_OFFSET_TOP,
    left: GEAR_TIER_OFFSET_LEFT,
    width: GEAR_TIER_WIDTH,
    height: GEAR_TIER_HEIGHT,
    position: "absolute",
    justifyContent: "center",
    alignContent: "center",
  },
  miniIconBurn: {
    width: MINI_ICON_SIZE,
    height: MINI_ICON_SIZE,
    borderRadius: 9,
    backgroundColor: DEFAULT_OVERLAP_COLOR,
    position: "absolute",
    bottom: 16,
    right: RIGHT_ALIGNMENT,
    justifyContent: "center",
    alignItems: "center",
  },
});
