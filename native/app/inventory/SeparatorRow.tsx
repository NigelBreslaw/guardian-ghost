import { SEPARATOR_SIZE } from "@/app/inventory/Common.ts";
import { useGGStore } from "@/app/store/GGStore.ts";
import React from "react";
import { StyleSheet, View } from "react-native";

const styles = StyleSheet.create({
  root: {
    width: useGGStore.getState().inventorySectionWidth,
    height: SEPARATOR_SIZE,
  },
});

function SeparatorCell() {
  return <View style={styles.root} />;
}

export default React.memo(SeparatorCell);
