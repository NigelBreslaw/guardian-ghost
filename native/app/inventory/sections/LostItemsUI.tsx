import { StyleSheet, View } from "react-native";

import { DEFAULT_MARGIN, FOOTER_HEIGHT, ICON_MARGIN, ICON_SIZE, INV_MAX_WIDTH } from "@/app/utilities/UISize.ts";
import { useGGStore } from "@/app/store/GGStore.ts";
import type { DestinyItem } from "@/app/inventory/logic/Types.ts";
import DestinyCell from "@/app/inventory/cells/DestinyCell.tsx";
import EmptyCell from "@/app/inventory/cells/EmptyCell.tsx";
import EngramCell from "@/app/inventory/cells/EngramCell.tsx";
import { ItemType } from "@/app/bungie/Enums.ts";

type Props = {
  readonly items: DestinyItem[];
};

export default function LostItemsUI({ items: destinyItems }: Props) {
  "use memo";
  const maxLostItemsRows = useGGStore.getState().maxLostItemsRows;
  const minimumSpacerHeight = ICON_SIZE * maxLostItemsRows + ICON_MARGIN * (maxLostItemsRows - 1);

  const normalHeight = ICON_SIZE * maxLostItemsRows + ICON_MARGIN * (maxLostItemsRows - 1);

  const styles = StyleSheet.create({
    root: {
      height: minimumSpacerHeight,
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
    footer: {
      height: FOOTER_HEIGHT,
    },
  });
  const totalItems = Array.from({ length: 5 * maxLostItemsRows });

  return (
    <View>
      <View style={styles.root}>
        <View style={styles.container}>
          {totalItems.map((_v, index) => {
            const item = destinyItems[index];
            if (item) {
              if (item.def.itemType === ItemType.Engram) {
                return (
                  // biome-ignore lint/suspicious/noArrayIndexKey: <Index is unique for each page in this case>
                  <EngramCell key={index} destinyItem={item} />
                );
              }
              return (
                // biome-ignore lint/suspicious/noArrayIndexKey: <explanation>
                <DestinyCell key={index} destinyItem={item} />
              );
            }
            return (
              // biome-ignore lint/suspicious/noArrayIndexKey: <explanation>
              <EmptyCell key={index} />
            );
          })}
        </View>
      </View>
      <View style={styles.footer} />
    </View>
  );
}
