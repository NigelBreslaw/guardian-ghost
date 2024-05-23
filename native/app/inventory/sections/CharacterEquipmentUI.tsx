import React from "react";
import { StyleSheet, View } from "react-native";

import {
  DEFAULT_SECTION_4_WIDTH,
  FOOTER_HEIGHT,
  EQUIP_SECTION_HEIGHT,
  ICON_MARGIN,
  ICON_SIZE,
} from "@/app/utilities/UISize.ts";
import type { EquipSection } from "@/app/inventory/logic/Helpers.ts";
import DestinyCell from "@/app/inventory/cells/DestinyCell.tsx";
import EmptyCell from "@/app/inventory/cells/EmptyCell.tsx";

const array9 = Array.from({ length: 9 });

const styles = StyleSheet.create({
  root: {
    width: DEFAULT_SECTION_4_WIDTH,

    alignSelf: "center",
  },
  footer: {
    height: FOOTER_HEIGHT,
  },
  container: {
    flex: 3,
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    alignItems: "center",
  },
  equip: {
    width: ICON_SIZE + ICON_MARGIN,
  },
  equipAndInventoryHolder: {
    flexDirection: "row",
    height: EQUIP_SECTION_HEIGHT,
  },
  inventoryGrid: {
    flex: 3,
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    alignContent: "space-between",
  },
});

type CharacterEquipmentProps = {
  readonly data: EquipSection;
};

function CharacterEquipmentUI(props: CharacterEquipmentProps) {
  return (
    <View style={styles.root}>
      <View style={styles.equipAndInventoryHolder}>
        <View style={styles.equip}>
          {props.data.equipped !== null ? <DestinyCell data={props.data.equipped} /> : <EmptyCell />}
        </View>
        <View style={styles.inventoryGrid}>
          {array9.map((_, index) => {
            const item = props.data.inventory[index];
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
      </View>
      <View style={styles.footer} />
    </View>
  );
}

export default React.memo(CharacterEquipmentUI);
