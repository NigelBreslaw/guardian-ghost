import { View } from "react-native";

import { DEFAULT_MARGIN, ICON_MARGIN, ICON_SIZE, INV_MAX_WIDTH } from "@/app/utilities/UISize.ts";
import type { DestinyItem } from "@/app/inventory/logic/Types.ts";
import DestinyCell3 from "@/app/inventory/cells/DestinyCell3.tsx";

type Props = {
  readonly items: DestinyItem[];
};

export default function LootItemRow2({ items }: Props) {
  "use memo";
  return (
    <View
      style={{
        height: ICON_SIZE + ICON_MARGIN,
        width: ICON_SIZE * 5 + ICON_MARGIN * 4,
        flexDirection: "row",
        justifyContent: "space-between",
        alignContent: "space-between",
        marginLeft: DEFAULT_MARGIN,
        marginRight: DEFAULT_MARGIN,
        maxWidth: INV_MAX_WIDTH,
      }}
    >
      <DestinyCell3 destinyItem={items[0]} />
      <DestinyCell3 destinyItem={items[1]} />
      <DestinyCell3 destinyItem={items[2]} />
      <DestinyCell3 destinyItem={items[3]} />
      <DestinyCell3 destinyItem={items[4]} />
    </View>
  );
}
