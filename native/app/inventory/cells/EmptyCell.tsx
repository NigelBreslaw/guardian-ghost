import { StyleSheet, View } from "react-native";

import { ICON_SIZE } from "@/app/utilities/UISize.ts";

const BORDER_COLOR = "#555555";
const BORDER_RADIUS = 10;
const BORDER_SIZE = 15;
const BORDER_WIDTH = 1;

export default function EmptyCell() {
  "use memo";
  return (
    <View style={styles.square}>
      <View style={topLeft} />
      <View style={topRight} />
      <View style={bottomLeft} />
      <View style={bottomRight} />
    </View>
  );
}

const styles = StyleSheet.create({
  square: {
    width: ICON_SIZE,
    height: ICON_SIZE,
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

const topLeft = StyleSheet.flatten([styles.topLeft, styles.corner]);
const topRight = StyleSheet.flatten([styles.topRight, styles.corner]);
const bottomLeft = StyleSheet.flatten([styles.bottomLeft, styles.corner]);
const bottomRight = StyleSheet.flatten([styles.bottomRight, styles.corner]);
