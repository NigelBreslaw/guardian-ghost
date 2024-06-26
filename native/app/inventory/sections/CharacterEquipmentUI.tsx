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

type Props = {
  readonly equipSection: EquipSection;
};

export default function CharacterEquipmentUI({ equipSection }: Props) {
  "use memo";

  return (
    <View style={styles.root}>
      <View style={styles.equipAndInventoryHolder}>
        <View style={styles.equip}>
          <DestinyCell destinyItem={equipSection.equipped} />
        </View>
        <View style={styles.inventoryGrid}>
          <DestinyCell destinyItem={equipSection.inventory[0]} />
          <DestinyCell destinyItem={equipSection.inventory[1]} />
          <DestinyCell destinyItem={equipSection.inventory[2]} />
          <DestinyCell destinyItem={equipSection.inventory[3]} />
          <DestinyCell destinyItem={equipSection.inventory[4]} />
          <DestinyCell destinyItem={equipSection.inventory[5]} />
          <DestinyCell destinyItem={equipSection.inventory[6]} />
          <DestinyCell destinyItem={equipSection.inventory[7]} />
          <DestinyCell destinyItem={equipSection.inventory[8]} />
        </View>
      </View>
      <View style={styles.footer} />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    width: DEFAULT_SECTION_4_WIDTH,
    height: EQUIP_SECTION_HEIGHT + FOOTER_HEIGHT,
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
