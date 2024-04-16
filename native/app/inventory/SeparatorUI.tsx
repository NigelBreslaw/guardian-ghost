import { SEPARATOR_SIZE } from "@/app/inventory/Common.ts";
import { useGGStore } from "@/app/store/GGStore.ts";
import React from "react";
import { StyleSheet, View, Text } from "react-native";

type SeparatorUIProps = {
  label: string;
};

function SeparatorUI(props: SeparatorUIProps) {
  const inventorySectionWidth = useGGStore.getState().inventorySectionWidth;
  const styles = StyleSheet.create({
    root: {
      width: inventorySectionWidth,
      height: SEPARATOR_SIZE,
    },
    bar: {
      width: "auto",
      height: 1,
      backgroundColor: "grey",
      marginLeft: 10,
      marginRight: 10,
    },
    label: {
      color: "white",
      textAlign: "left",
      paddingLeft: 10,
      fontSize: 17,
    },
    spacer: {
      height: 20,
    },
    spacer2: {
      height: 1,
    },
  });

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
