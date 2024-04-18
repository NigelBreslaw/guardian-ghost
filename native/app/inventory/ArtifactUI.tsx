import ArtifactCell from "@/app/inventory/ArtifactCell.tsx";
import type { DestinyIconData } from "@/app/inventory/Common.ts";
import EmptyCell from "@/app/inventory/EmptyCell.tsx";
import { DEFAULT_SECTION_4_WIDTH, ITEM_SIZE } from "@/app/utilities/UISize.ts";
import React from "react";
import { View, StyleSheet } from "react-native";

const styles = StyleSheet.create({
  container: {
    width: DEFAULT_SECTION_4_WIDTH,
    height: ITEM_SIZE,
    alignSelf: "center",
  },
});

type ArtifactProps = {
  equipped: DestinyIconData | null;
};

function ArtifactUI(props: ArtifactProps) {
  return (
    <View style={styles.container}>
      {props.equipped !== null ? <ArtifactCell data={props.equipped} /> : <EmptyCell />}
    </View>
  );
}

export default React.memo(ArtifactUI);
