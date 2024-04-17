import {
  DEFAULT_MARGIN,
  DEFAULT_SECTION_4_WIDTH,
  EQUIP_SECTION_SIZE,
  ITEM_SIZE,
  type EquipSection,
} from "@/app/inventory/Common.ts";
import DestinyCell from "@/app/inventory/DestinyCell.tsx";
import EmptyCell from "@/app/inventory/EmptyCell.tsx";
import React from "react";
import { StyleSheet, View } from "react-native";

const array9 = Array.from({ length: 9 });

const styles = StyleSheet.create({
  root: {
    width: DEFAULT_SECTION_4_WIDTH,
    height: EQUIP_SECTION_SIZE,
    alignSelf: "center",
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
  grid: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "space-between",
  },
});

type CharacterEquipmentProps = {
  data: EquipSection;
};

function CharacterEquipmentUI(props: CharacterEquipmentProps) {
  return (
    <View style={styles.root}>
      <View style={styles.grid}>
        <View style={{ flex: 1 }}>
          {props.data.equipped !== null ? <DestinyCell data={props.data.equipped} /> : <EmptyCell />}
        </View>
        <View style={styles.container}>
          {array9.map((_, index) => {
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

export default React.memo(CharacterEquipmentUI);
