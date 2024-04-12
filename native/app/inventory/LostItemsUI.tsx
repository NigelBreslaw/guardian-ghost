import { ITEM_SIZE, type DestinyIconData } from "@/app/inventory/Common.ts";
import DestinyCell from "@/app/inventory/DestinyCell.tsx";
import EmptyCell from "@/app/inventory/EmptyCell.tsx";
import { useGGStore } from "@/app/store/GGStore.ts";
import React from "react";
import { StyleSheet, View } from "react-native";

const array21 = Array.from({ length: 21 });

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

const SECTION_HEIGHT = ITEM_SIZE * 5;

type EngramsProps = {
  data: DestinyIconData[];
};

function LostItemsUI(props: EngramsProps) {
  const inventorySectionWidth = useGGStore.getState().inventorySectionWidth;
  const rootStyle = {
    width: inventorySectionWidth,
    height: SECTION_HEIGHT,
  };

  return (
    <View style={rootStyle}>
      <View style={styles.container}>
        {array21.map((_v, index) => {
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
