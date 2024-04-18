import { Dimensions } from "react-native";

const { width } = Dimensions.get("window");

// margin = 16 * 2, 5 icons * 72, icon margins at 16
const min_width = 16 * 2 + 5 * 72 + 4 * 16;
let SCALAR = 1;
if (width < min_width) {
  SCALAR = width / min_width;
}

export const ICON_SIZE = Math.ceil(72 * SCALAR);
export const INNER_FRAME_SIZE = Math.ceil(ICON_SIZE * 0.95);
export const ICON_MARGIN = Math.ceil(16 * SCALAR);
export const ICON_VAULT_MARGIN = Math.ceil(10 * SCALAR);
export const DEFAULT_MARGIN = Math.ceil(16 * SCALAR);
export const MINI_ICON_SIZE = Math.ceil(18 * SCALAR);
export const MINI_BURN_SIZE = Math.ceil(MINI_ICON_SIZE * 0.83);
export const PRIMARY_STAT_FONT_SIZE = Math.ceil(14 * SCALAR);
export const RIGHT_ALIGNMENT = Math.ceil(-9 * SCALAR);

export const DEFAULT_SECTION_4_WIDTH = 4 * ICON_SIZE + 3 * ICON_MARGIN;
export const EQUIP_SECTION_HEIGHT = 3 * ICON_SIZE + 2 * ICON_MARGIN;

export const ENGRAMS_SECTION_HEIGHT = ICON_SIZE * 2;
export const ENGRAMS_SECTION_WIDTH = ICON_SIZE * 5 + 20 * SCALAR;

export const VAULT_5x5_HEIGHT = ICON_SIZE * 5 + ICON_VAULT_MARGIN * 4;
export const EQUIP_SECTION_SIZE = ICON_SIZE * 3 + 3 * ICON_MARGIN;
export const SEPARATOR_HEIGHT = 50 * SCALAR;
