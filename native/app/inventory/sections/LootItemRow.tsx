import { View } from "react-native";

import { DEFAULT_MARGIN, ICON_MARGIN, ICON_SIZE, INV_MAX_WIDTH } from "@/app/utilities/UISize.ts";
import type { DestinyIconData } from "@/app/inventory/logic/Types.ts";
import DestinyCell2 from "@/app/inventory/cells/DestinyCell2.tsx";

type Props = {
  readonly iconData: DestinyIconData[];
};

export default function LootItemRow({ iconData }: Props) {
  "use memo";
  return (
    <View
      style={{
        height: ICON_SIZE + ICON_MARGIN,
        width: ICON_SIZE * 5 + ICON_MARGIN * 4,
        flexDirection: "row",
        justifyContent: "space-between",
        alignContent: "space-between",
        alignItems: "center",
        marginLeft: DEFAULT_MARGIN,
        marginRight: DEFAULT_MARGIN,
        maxWidth: INV_MAX_WIDTH,
      }}
    >
      <DestinyCell2 iconData={iconData[0]} />
      <DestinyCell2 iconData={iconData[1]} />
      <DestinyCell2 iconData={iconData[2]} />
      <DestinyCell2 iconData={iconData[3]} />
      <DestinyCell2 iconData={iconData[4]} />
    </View>
  );
}
