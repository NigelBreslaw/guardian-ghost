import { ITEM_SIZE } from "@/app/inventory/Common.ts";
import { Image } from "expo-image";
import React from "react";
import { StyleSheet, Text, View } from "react-native";

const DEFAULT_BORDER_COLOR = "#3E3D45";
const MINI_ICON_SIZE = 17;
const RIGHT_ALIGNMENT = -7;

const styles = StyleSheet.create({
  container: {
    width: ITEM_SIZE,
    height: ITEM_SIZE,
    justifyContent: "center",
    alignItems: "center",
  },
  gesture: {
    width: ITEM_SIZE,
    height: ITEM_SIZE,
    position: "absolute",
  },
  powerLevelText: {
    color: "white",
    fontSize: 14,
    fontWeight: "bold",
    alignContent: "center",
    includeFontPadding: false,
  },
  powerLevel: {
    width: 40,
    height: 18,
    borderRadius: 4,
    backgroundColor: DEFAULT_BORDER_COLOR,
    zIndex: 100,
    position: "absolute",
    bottom: -8,
    right: -8,
    justifyContent: "center",
    alignItems: "center",
  },
  icon: {
    width: 68,
    height: 68,
    borderRadius: 12,
    overflow: "hidden",
    borderWidth: 2,
    borderColor: "#555555",
  },
  frameSize: {
    width: 68,
    height: 68,
  },
  innerFrameSize: {
    width: 65,
    height: 65,
    position: "absolute",
    top: -0.5,
    left: -0.5,
  },
  innerFrameOverlaySize: {
    width: 65,
    height: 65,
    position: "absolute",
  },
  miniIconBurnSize: {
    width: 13,
    height: 13,
  },
  miniIconBurn: {
    width: MINI_ICON_SIZE,
    height: MINI_ICON_SIZE,
    borderRadius: 4,
    backgroundColor: DEFAULT_BORDER_COLOR,
    position: "absolute",
    zIndex: 100,
    bottom: 14,
    right: RIGHT_ALIGNMENT,
    justifyContent: "center",
    alignItems: "center",
  },
});

type DestinyCellProps = {
  iconUri: string;
  primaryStat: string;
  damageTypeIconUri: number | null;
  calculatedWaterMark: string | undefined;
  masterwork: boolean;
};

const DestinyCell = (props: DestinyCellProps) => {
  const borderColor = props.masterwork ? "#CEAE32" : "#555555";

  return (
    <View style={styles.container}>
      <View style={styles.frameSize}>
        <View style={[styles.icon, { borderColor }]}>
          <View style={styles.innerFrameSize}>
            <Image
              source={{ uri: props.iconUri }}
              cachePolicy="memory-disk"
              style={styles.innerFrameSize}
              recyclingKey={props.iconUri}
            />
            <Image
              source={{ uri: props.calculatedWaterMark }}
              cachePolicy="memory-disk"
              style={styles.innerFrameOverlaySize}
              recyclingKey={props.calculatedWaterMark}
            />
          </View>
        </View>
        {props.primaryStat !== "" && (
          <View style={styles.powerLevel}>
            <Text style={styles.powerLevelText}>{props.primaryStat}</Text>
          </View>
        )}
        {props.damageTypeIconUri && (
          <View style={styles.miniIconBurn}>
            <Image style={styles.miniIconBurnSize} source={props.damageTypeIconUri} cachePolicy="memory" />
          </View>
        )}
      </View>
    </View>
  );
};

export default React.memo(DestinyCell);
