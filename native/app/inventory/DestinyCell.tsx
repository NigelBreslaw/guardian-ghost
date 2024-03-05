// import { memo } from "react";
import { View, Text, StyleSheet } from "react-native";
import { Image } from "expo-image";

const DEFAULT_BORDER_COLOR = "#3E3D45";
const MINI_ICON_SIZE = 16;
const RIGHT_ALIGNMENT = -9;

const styles = StyleSheet.create({
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
    borderRadius: 10,
    overflow: "hidden",
    borderWidth: 3,
    borderColor: "#555555",
  },
  frameSize: {
    width: 68,
    height: 68,
  },
  innerFrameSize: {
    width: 63,
    height: 63,
  },
  innerFrameOverlaySize: {
    width: 63,
    height: 63,
    position: "absolute",
  },
  miniIconBurnSize: {
    width: 12,
    height: 12,
  },
  miniIconBurn: {
    width: MINI_ICON_SIZE,
    height: MINI_ICON_SIZE,
    borderRadius: 4,
    backgroundColor: DEFAULT_BORDER_COLOR,
    position: "absolute",
    zIndex: 100,
    bottom: 13,
    right: RIGHT_ALIGNMENT,
    justifyContent: "center",
    alignItems: "center",
  },
});

type dProps = {
  iconUri: string;
  versionUri: string;
  primaryStat: number;
};

const SOLAR_MINI_ICON_URI = require("../../images/solar_mini.webp");
const VOID_MINI_ICON_URI = require("../../images/void_mini.webp");
const ARC_MINI_ICON_URI = require("../../images/arc_mini.webp");
const KINETIC_MINI_ICON_URI = require("../../images/kinetic_mini.webp");
const STASIS_MINI_ICON_URI = require("../../images/stasis_mini.webp");
const STRAND_MINI_ICON_URI = require("../../images/strand_mini.webp");

const DestinyCell = (props: dProps) => {
  return (
    <View style={styles.frameSize}>
      <View style={styles.icon}>
        <View style={styles.innerFrameSize}>
          <Image source={{ uri: props.iconUri }} cachePolicy="memory-disk" style={styles.innerFrameSize} />
          <Image source={{ uri: props.versionUri }} cachePolicy="memory-disk" style={styles.innerFrameOverlaySize} />
        </View>
      </View>
      {props.primaryStat > 0 && (
        <View style={styles.powerLevel}>
          <Text style={styles.powerLevelText}>{props.primaryStat}</Text>
        </View>
      )}

      <View style={styles.miniIconBurn}>
        <Image style={styles.miniIconBurnSize} source={KINETIC_MINI_ICON_URI} cachePolicy="memory" />
      </View>
    </View>
  );
};

export default DestinyCell;

// <View style={styles.powerLevel}>
//   <Text style={styles.powerLevelText}>1804</Text>
// </View>
