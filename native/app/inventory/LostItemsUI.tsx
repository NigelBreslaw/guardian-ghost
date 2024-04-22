import type { DestinyIconData } from "@/app/bungie/Common";
import { DEFAULT_MARGIN, FOOTER_HEIGHT, ICON_MARGIN, ICON_SIZE } from "@/app/utilities/UISize.ts";
import DestinyCell from "@/app/inventory/DestinyCell.tsx";
import EmptyCell from "@/app/inventory/EmptyCell.tsx";
import { useGGStore } from "@/app/store/GGStore.ts";
import React from "react";
import { StyleSheet, View } from "react-native";
import EngramCell from "@/app/inventory/EngramCell.tsx";

type EngramsProps = {
  data: DestinyIconData[];
};

function LostItemsUI(props: EngramsProps) {
  const maxLostItemsColumns = useGGStore.getState().maxLostItemsColumns;
  const styles = StyleSheet.create({
    root: {
      height: ICON_SIZE * maxLostItemsColumns + (maxLostItemsColumns - 1) * ICON_MARGIN,
      paddingLeft: DEFAULT_MARGIN,
      paddingRight: DEFAULT_MARGIN,
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
  const totalItems = Array.from({ length: 5 * maxLostItemsColumns });

  return (
    <View>
      <View style={styles.root}>
        {totalItems.map((_v, index) => {
          const item = props.data[index];
          if (item) {
            if (item.engram) {
              return (
                // biome-ignore lint/suspicious/noArrayIndexKey: <Index is unique for each page in this case>
                <EngramCell key={index} data={item} />
              );
            }
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
      <View style={styles.footer} />
    </View>
  );
}

export default React.memo(LostItemsUI);
