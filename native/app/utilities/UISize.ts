import { TierType } from "@/app/bungie/Enums.ts";
import { Dimensions } from "react-native";

const { width } = Dimensions.get("window");

const MIN_WIDTH = 16 * 2 + 5 * 72 + 4 * 16;

let SCALAR = 1;
if (width < MIN_WIDTH) {
  SCALAR = width / MIN_WIDTH;
}

export const INV_MAX_WIDTH = Math.ceil((MIN_WIDTH - 16 * 2) * SCALAR);

export const ICON_SIZE = Math.ceil(72 * SCALAR);
export const INNER_FRAME_SIZE = Math.ceil(ICON_SIZE * 0.95);
export const ICON_MARGIN = Math.ceil(16 * SCALAR);
export const DEFAULT_MARGIN = Math.ceil(16 * SCALAR);
export const MINI_ICON_SIZE = Math.ceil(18 * SCALAR);
export const MINI_BURN_SIZE = Math.ceil(MINI_ICON_SIZE * 0.83);
export const PRIMARY_STAT_FONT_SIZE = Math.ceil(14 * SCALAR);
export const RIGHT_ALIGNMENT = Math.ceil(-9 * SCALAR);

export const DEFAULT_SECTION_4_WIDTH = 4 * ICON_SIZE + 3 * ICON_MARGIN;
export const EQUIP_SECTION_HEIGHT = 3 * ICON_SIZE + 2 * ICON_MARGIN;
export const FOOTER_HEIGHT = Math.ceil(18 * SCALAR);

export const ENGRAMS_SECTION_HEIGHT = ICON_SIZE * 2;
export const ENGRAMS_SECTION_WIDTH = ICON_SIZE * 5 + 20 * SCALAR;

export const VAULT_5x5_HEIGHT = ICON_SIZE * 5 + ICON_MARGIN * 4;
export const EQUIP_SECTION_SIZE = ICON_SIZE * 3 + 2 * ICON_MARGIN;
export const SEPARATOR_HEIGHT = 70 * SCALAR;

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
