import { SEPARATOR_SIZE, VISUAL_MARGIN } from "@/app/inventory/Common.ts";
import React from "react";
import { StyleSheet, View, Text } from "react-native";

const styles = StyleSheet.create({
  root: {
    width: "100%",
    height: SEPARATOR_SIZE,
    paddingLeft: VISUAL_MARGIN,
    paddingRight: VISUAL_MARGIN,
  },
  bar: {
    width: "auto",
    height: 1,
    backgroundColor: "#818181",
  },
  label: {
    color: "#D1D1D1",
    textAlign: "left",
    fontSize: 19,
  },
  spacer: {
    height: 10,
  },
  spacer2: {
    height: 4,
  },
});

type SeparatorUIProps = {
  label: string;
};

function SeparatorUI(props: SeparatorUIProps) {
  return (
    <View style={styles.root}>
      <View style={styles.spacer} />
      <Text style={styles.label}>{props.label}</Text>
      <View style={styles.spacer2} />

      <View style={styles.bar} />
    </View>
  );
}

export default React.memo(SeparatorUI);
