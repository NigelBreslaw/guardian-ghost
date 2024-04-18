import type { DestinyIconData } from "@/app/inventory/Common.ts";
import { DEFAULT_MARGIN, ITEM_SIZE } from "@/app/utilities/UISize.ts";
import DestinyCell from "@/app/inventory/DestinyCell.tsx";
import EmptyCell from "@/app/inventory/EmptyCell.tsx";
import { useGGStore } from "@/app/store/GGStore.ts";
import React from "react";
import { StyleSheet, View } from "react-native";

type EngramsProps = {
  data: DestinyIconData[];
};

function LostItemsUI(props: EngramsProps) {
  const maxLostItemsColumns = useGGStore.getState().maxLostItemsColumns;
  const styles = StyleSheet.create({
    root: {
      height: ITEM_SIZE * maxLostItemsColumns,
      paddingLeft: DEFAULT_MARGIN,
      paddingRight: DEFAULT_MARGIN,
      flex: 5,
      flexDirection: "row",
      flexWrap: "wrap",
      justifyContent: "space-between",
      alignContent: "space-between",
    },
  });
  const totalItems = Array.from({ length: 5 * maxLostItemsColumns });

  return (
    <View style={styles.root}>
      {totalItems.map((_v, index) => {
        const item = props.data[index];
        if (item) {
          return (
            // biome-ignore lint/suspicious/noArrayIndexKey: <explanation>
            <DestinyCell key={index} data={item} />
          );
        }
        return (
          // biome-ignore lint/suspicious/noArrayIndexKey: <explanation>
          <EmptyCell key={index} />
        );
      })}
    </View>
  );
}

export default React.memo(LostItemsUI);
