import { ITEM_SIZE, type DestinyIconData } from "@/app/inventory/Common.ts";
import DestinyCell from "@/app/inventory/DestinyCell.tsx";
import EmptyCell from "@/app/inventory/EmptyCell.tsx";
import { useGGStore } from "@/app/store/GGStore.ts";
import React from "react";
import { StyleSheet, View } from "react-native";

type VaultFlexProps = {
  data: DestinyIconData[];
  minimumSpacerSize?: number;
};

function VaultFlexUI(props: VaultFlexProps) {
  const sectionRows = Math.ceil(props.data.length / 5);
  const totalItems = sectionRows * 5;
  const minimumSpacerSize = Math.max(props.minimumSpacerSize ?? 0, ITEM_SIZE * sectionRows);
  const styles = StyleSheet.create({
    root: {
      width: useGGStore.getState().inventorySectionWidth,
      height: minimumSpacerSize,
    },
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

  return (
    <View style={styles.root}>
      <View style={styles.container}>
        {Array.from({ length: totalItems }).map((_v, index) => {
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

export default React.memo(VaultFlexUI);
