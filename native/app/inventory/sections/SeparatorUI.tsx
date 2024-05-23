import React from "react";
import { StyleSheet, View, Text } from "react-native";

import { SEPARATOR_HEIGHT, DEFAULT_MARGIN } from "@/app/utilities/UISize.ts";

const styles = StyleSheet.create({
  root: {
    height: SEPARATOR_HEIGHT,
    marginLeft: DEFAULT_MARGIN,
    marginRight: DEFAULT_MARGIN,
  },
  bar: {
    width: "auto",
    height: 1,
    backgroundColor: "#818181",
  },
  label: {
    color: "#D1D1D1",
    textAlign: "left",
    fontSize: 16,
  },
  spacer: {
    height: 20,
  },
  spacer2: {
    height: 2,
  },
});

type SeparatorUIProps = {
  readonly label: string;
  readonly info?: string;
};

function SeparatorUI(props: SeparatorUIProps) {
  return (
    <View style={styles.root}>
      <View style={styles.spacer} />
      <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
        <Text style={styles.label}>{props.label}</Text>
        {props.info && <Text style={styles.label}>{props.info}</Text>}
      </View>
      <View style={styles.spacer2} />

      <View style={styles.bar} />
    </View>
  );
}

export default React.memo(SeparatorUI);
