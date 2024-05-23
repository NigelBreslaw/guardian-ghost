import { StyleSheet, View } from "react-native";

import { DEFAULT_MARGIN, ICON_MARGIN, ICON_SIZE, INV_MAX_WIDTH } from "@/app/utilities/UISize.ts";
import type { DestinyIconData } from "@/app/inventory/logic/Types.ts";
import DestinyCell from "@/app/inventory/cells/DestinyCell.tsx";
import EmptyCell from "@/app/inventory/cells/EmptyCell.tsx";

type Props = {
  readonly iconData: DestinyIconData[];
  readonly minimumSpacerHeight?: number;
};

export default function VaultFlexUI({ iconData, minimumSpacerHeight }: Props) {
  "use memo";
  const sectionRows = Math.ceil(iconData.length / 5);
  const totalItems = sectionRows * 5;
  const minimumSpacerHeightInternal = Math.max(
    minimumSpacerHeight ?? 0,
    ICON_SIZE * sectionRows + ICON_MARGIN * (sectionRows - 1),
  );
  const normalHeight = ICON_SIZE * sectionRows + ICON_MARGIN * (sectionRows - 1);

  const styles = StyleSheet.create({
    root: {
      height: minimumSpacerHeightInternal,
    },
    container: {
      maxHeight: normalHeight,
      marginLeft: DEFAULT_MARGIN,
      marginRight: DEFAULT_MARGIN,
      maxWidth: INV_MAX_WIDTH,
      flex: 5,
      flexDirection: "row",
      flexWrap: "wrap",
      justifyContent: "space-between",
      alignContent: "space-between",
    },
  });

  return (
    <View style={styles.root}>
      <View style={styles.container}>
        {Array.from({ length: totalItems }).map((_v, index) => {
          const item = iconData[index];
          if (item) {
            return (
              // biome-ignore lint/suspicious/noArrayIndexKey: <explanation>
              <DestinyCell key={index} iconData={item} />
            );
          }
          return (
            // biome-ignore lint/suspicious/noArrayIndexKey: <explanation>
            <EmptyCell key={index} />
          );
        })}
      </View>
    </View>
  );
}
