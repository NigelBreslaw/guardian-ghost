import { ENGRAMS_SECTION_SIZE, ITEM_SIZE, VAULT_5x5_SIZE, type DestinyIconData } from "@/app/inventory/Common.ts";
import EngramCell from "@/app/inventory/EngramCell.tsx";
import { useGGStore } from "@/app/store/GGStore.ts";
import React from "react";
import { StyleSheet, View } from "react-native";

const array10 = Array.from({ length: 10 });

type EngramsSectionProps = {
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

function EngramsSection(props: EngramsSectionProps) {
  const inventorySectionWidth = useGGStore.getState().inventorySectionWidth;
  const rootStyle = {
    width: inventorySectionWidth,
    height: ENGRAMS_SECTION_SIZE,
  };

  return (
    <View style={rootStyle}>
      <View style={styles.container}>
        {array10.map((_v, index) => {
          const item = props.data[index];
          return (
            // biome-ignore lint/suspicious/noArrayIndexKey: <explanation>
            <View key={index} style={styles.box}>
              <EngramCell data={item} />
            </View>
          );
        })}
      </View>
    </View>
  );
}

export default React.memo(EngramsSection);
