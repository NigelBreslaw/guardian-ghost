import { EQUIP_SECTION_SIZE, ITEM_SIZE, type EquipSectionCell } from "@/app/inventory/Common.ts";
import DestinyCell from "@/app/inventory/DestinyCell.tsx";
import EmptyCell from "@/app/inventory/EmptyCell.tsx";
import { useGGStore } from "@/app/store/GGStore.ts";
import React from "react";
import { StyleSheet, View } from "react-native";

type EquipSectionProps = {
  data: EquipSectionCell;
};

function EquipSection(props: EquipSectionProps) {
  const styles = StyleSheet.create({
    root: {
      width: useGGStore.getState().inventorySectionWidth,
      height: EQUIP_SECTION_SIZE,
    },
    container: {
      flex: 3,
      flexDirection: "row",
      flexWrap: "wrap",
      justifyContent: "center",
      alignItems: "center",
    },
    box: {
      width: "33.33%",
      height: ITEM_SIZE,
    },
  });
  return (
    <View style={styles.root}>
      <View style={{ flex: 1, flexDirection: "row", justifyContent: "space-between" }}>
        <View style={{ flex: 1 }}>
          {props.data.equipped !== null ? <DestinyCell data={props.data.equipped} /> : <EmptyCell />}
        </View>
        <View style={styles.container}>
          {Array.from({ length: 9 }).map((_, index) => {
            const item = props.data.inventory[index];
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
    </View>
  );
}

export default React.memo(EquipSection);
