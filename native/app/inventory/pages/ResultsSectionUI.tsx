import { View } from "react-native";

import DestinyCell from "@/app/inventory/cells/DestinyCell.tsx";
import type { DestinyItem } from "@/app/inventory/logic/Types.ts";
import { ICON_MARGIN, ICON_SIZE } from "@/app/utilities/UISize.ts";

export type ResultsSection = {
  id: string;
  items: DestinyItem[];
};

type ResultsSectionUIProps = {
  readonly items: DestinyItem[];
};

export default function ResultsSectionUI({ items }: ResultsSectionUIProps) {
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
      }}
    >
      <DestinyCell destinyItem={items[0]} />
      <DestinyCell destinyItem={items[1]} />
      <DestinyCell destinyItem={items[2]} />
      <DestinyCell destinyItem={items[3]} />
      <DestinyCell destinyItem={items[4]} />
    </View>
  );
}
