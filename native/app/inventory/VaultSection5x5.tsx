import { ITEM_SIZE, VAULT_5x5_SIZE, type DestinyIconData } from "@/app/inventory/Common.ts";
import DestinyCell from "@/app/inventory/DestinyCell.tsx";
import EmptyCell from "@/app/inventory/EmptyCell.tsx";
import { useGGStore } from "@/app/store/GGStore.ts";
import React from "react";
import { StyleSheet, View } from "react-native";

const array25 = Array.from({ length: 25 });

type VaultSection5x5Props = {
  data: DestinyIconData[];
};

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

function VaultSection5x5(props: VaultSection5x5Props) {
  const inventorySectionWidth = useGGStore.getState().inventorySectionWidth;
  const rootStyle = {
    width: inventorySectionWidth,
    height: VAULT_5x5_SIZE,
  };

  return (
    <View style={rootStyle}>
      <View style={styles.container}>
        {array25.map((_v, index) => {
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

export default React.memo(VaultSection5x5);
