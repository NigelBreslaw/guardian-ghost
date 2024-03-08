import React from "react";
import { StyleSheet, View } from "react-native";
import { ITEM_SIZE } from "@/app/inventory/Common.ts";

const styles = StyleSheet.create({
  square: {
    width: ITEM_SIZE,
    height: ITEM_SIZE,
  },
});

function BlankCell() {
  return <View style={styles.square} />;
}

export default React.memo(BlankCell);
