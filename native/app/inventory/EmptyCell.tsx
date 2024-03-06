import React from "react";
import { StyleSheet, View } from "react-native";

const ICON_SIZE = 68;
const BORDER_COLOR = "#555555";
const BORDER_RADIUS = 10;
const BORDER_SIZE = 15;
const BORDER_WIDTH = 3;

const styles = StyleSheet.create({
  square: {
    width: ICON_SIZE,
    height: ICON_SIZE,
    position: "relative",
  },
  corner: {
    position: "absolute",
    width: BORDER_SIZE,
    height: BORDER_SIZE,
    borderColor: BORDER_COLOR,
  },
  topLeft: {
    top: 0,
    left: 0,
    borderTopWidth: BORDER_WIDTH,
    borderLeftWidth: BORDER_WIDTH,
    borderTopLeftRadius: BORDER_RADIUS,
  },
  topRight: {
    top: 0,
    right: 0,
    borderTopWidth: BORDER_WIDTH,
    borderRightWidth: BORDER_WIDTH,
    borderTopRightRadius: BORDER_RADIUS,
  },
  bottomLeft: {
    bottom: 0,
    left: 0,
    borderBottomWidth: BORDER_WIDTH,
    borderLeftWidth: BORDER_WIDTH,
    borderBottomLeftRadius: BORDER_RADIUS,
  },
  bottomRight: {
    bottom: 0,
    right: 0,
    borderBottomWidth: BORDER_WIDTH,
    borderRightWidth: BORDER_WIDTH,
    borderBottomRightRadius: BORDER_RADIUS,
  },
});

function EmptyCell() {
  return (
    <View style={styles.square}>
      <View style={[styles.corner, styles.topLeft]} />
      <View style={[styles.corner, styles.topRight]} />
      <View style={[styles.corner, styles.bottomLeft]} />
      <View style={[styles.corner, styles.bottomRight]} />
    </View>
  );
}

export default React.memo(EmptyCell);
