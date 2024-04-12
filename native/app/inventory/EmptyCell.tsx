import { ITEM_SIZE } from "@/app/inventory/Common.ts";
import React from "react";
import { StyleSheet, View } from "react-native";

const BORDER_COLOR = "#555555";
const BORDER_RADIUS = 10;
const BORDER_SIZE = 15;
const BORDER_WIDTH = 1;

const styles = StyleSheet.create({
  square: {
    width: ITEM_SIZE,
    height: ITEM_SIZE,
    position: "relative",
  },
  corner: {
    position: "absolute",
    width: BORDER_SIZE,
    height: BORDER_SIZE,
    borderColor: BORDER_COLOR,
  },
  topLeft: {
    top: 11,
    left: 11,
    borderTopWidth: BORDER_WIDTH,
    borderLeftWidth: BORDER_WIDTH,
    borderTopLeftRadius: BORDER_RADIUS,
  },
  topRight: {
    top: 11,
    right: 11,
    borderTopWidth: BORDER_WIDTH,
    borderRightWidth: BORDER_WIDTH,
    borderTopRightRadius: BORDER_RADIUS,
  },
  bottomLeft: {
    bottom: 11,
    left: 11,
    borderBottomWidth: BORDER_WIDTH,
    borderLeftWidth: BORDER_WIDTH,
    borderBottomLeftRadius: BORDER_RADIUS,
  },
  bottomRight: {
    bottom: 11,
    right: 11,
    borderBottomWidth: BORDER_WIDTH,
    borderRightWidth: BORDER_WIDTH,
    borderBottomRightRadius: BORDER_RADIUS,
  },
});

const topLeft = StyleSheet.flatten([styles.topLeft, styles.corner]);
const topRight = StyleSheet.flatten([styles.topRight, styles.corner]);
const bottomLeft = StyleSheet.flatten([styles.bottomLeft, styles.corner]);
const bottomRight = StyleSheet.flatten([styles.bottomRight, styles.corner]);

function EmptyCell() {
  return (
    <View style={styles.square}>
      <View style={topLeft} />
      <View style={topRight} />
      <View style={bottomLeft} />
      <View style={bottomRight} />
    </View>
  );
}

export default React.memo(EmptyCell);
