import React from "react";
import { StyleSheet, View } from "react-native";
import { SEPARATOR_SIZE } from "@/app/inventory/Common.ts";

const styles = StyleSheet.create({
  square: {
    width: SEPARATOR_SIZE,
    height: SEPARATOR_SIZE,
  },
});

function SeparatorCell() {
  return <View style={styles.square} />;
}

export default React.memo(SeparatorCell);
