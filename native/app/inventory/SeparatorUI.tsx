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
    backgroundColor: "grey",
  },
  label: {
    color: "white",
    textAlign: "left",
    fontSize: 17,
  },
  spacer: {
    height: 15,
  },
  spacer2: {
    height: 2,
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
