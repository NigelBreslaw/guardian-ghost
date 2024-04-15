import { ITEM_SIZE, type DestinyIconData } from "@/app/inventory/Common.ts";
import DestinyCell from "@/app/inventory/DestinyCell.tsx";
import EmptyCell from "@/app/inventory/EmptyCell.tsx";
import { useGGStore } from "@/app/store/GGStore.ts";
import React from "react";
import { StyleSheet, View } from "react-native";

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    alignItems: "center",
  },
  box: {
    width: "20%",
    height: ITEM_SIZE,
  },
});

type EngramsProps = {
  data: DestinyIconData[];
};

function LostItemsUI(props: EngramsProps) {
  const inventorySectionWidth = useGGStore.getState().inventorySectionWidth;
  const maxLostItemsColumns = useGGStore.getState().maxLostItemsColumns;
  const rootStyle = {
    width: inventorySectionWidth,
    height: ITEM_SIZE * maxLostItemsColumns,
  };
  const totalItems = Array.from({ length: 5 * maxLostItemsColumns });

  return (
    <View style={rootStyle}>
      <View style={styles.container}>
        {totalItems.map((_v, index) => {
          const item = props.data[index];
          if (item) {
            return (
              // biome-ignore lint/suspicious/noArrayIndexKey: <explanation>
              <View key={index} style={styles.box}>
                <DestinyCell data={item} />
              </View>
            );
          }
          return (
            // biome-ignore lint/suspicious/noArrayIndexKey: <explanation>
            <View key={index} style={styles.box}>
              <EmptyCell />
            </View>
          );
        })}
      </View>
    </View>
  );
}

export default React.memo(LostItemsUI);
