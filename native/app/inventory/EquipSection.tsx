import { EQUIP_SECTION_SIZE, ITEM_SIZE, type EquipSectionCell } from "@/app/inventory/Common.ts";
import DestinyCell from "@/app/inventory/DestinyCell.tsx";
import EmptyCell from "@/app/inventory/EmptyCell.tsx";
import { useGGStore } from "@/app/store/GGStore.ts";
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
              // biome-ignore lint/suspicious/noArrayIndexKey: <explanation>
              return <DestinyCell key={index} data={item} />;
            }
            // biome-ignore lint/suspicious/noArrayIndexKey: <explanation>
            return <EmptyCell key={index} />;
          })}
        </View>
      </View>
    </View>
  );
}

export default EquipSection;
