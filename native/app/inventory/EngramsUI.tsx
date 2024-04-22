import { DestinyIconDataEmpty, type DestinyIconData } from "@/app/bungie/Common";
import { ENGRAMS_SECTION_WIDTH, ENGRAMS_SECTION_HEIGHT, DEFAULT_MARGIN } from "@/app/utilities/UISize.ts";
import EngramCell from "@/app/inventory/EngramCell";
import React from "react";
import { StyleSheet, View } from "react-native";

const array10 = Array.from({ length: 10 });

const styles = StyleSheet.create({
  container: {
    width: ENGRAMS_SECTION_WIDTH,
    marginLeft: DEFAULT_MARGIN,
    marginRight: DEFAULT_MARGIN,
    height: ENGRAMS_SECTION_HEIGHT,
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    alignContent: "space-between",
    alignSelf: "center",
  },
});

type EngramsProps = {
  data: DestinyIconData[];
};

function EngramsUI(props: EngramsProps) {
  return (
    <View style={styles.container}>
      {array10.map((_v, index) => {
        const item = props.data[index];
        return (
          // biome-ignore lint/suspicious/noArrayIndexKey: <explanation>
          <EngramCell key={index} data={item ?? DestinyIconDataEmpty} />
        );
      })}
    </View>
  );
}

export default React.memo(EngramsUI);
