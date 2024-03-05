import { memo } from "react";
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
};

const DAMAGE_TYPE_ICON_URI =
  "https://www.bungie.net/common/destiny2_content/icons/DestinyDamageTypeDefinition_2a1773e10968f2d088b97c22b22bba9e.png";

const DestinyCell = memo((props: dProps) => {
  return (
    <View style={styles.frameSize}>
      <View style={styles.icon}>
        <View style={styles.innerFrameSize}>
          <Image source={props.iconUri} style={styles.innerFrameSize} recyclingKey={props.iconUri} />
          <Image source={props.versionUri} style={styles.innerFrameOverlaySize} recyclingKey={props.versionUri} />
        </View>
      </View>
      <View style={styles.powerLevel}>
        <Text style={styles.powerLevelText}>1804</Text>
      </View>
      <View style={styles.miniIconBurn}>
        <Image style={styles.miniIconBurnSize} source={DAMAGE_TYPE_ICON_URI} />
      </View>
    </View>
  );
});

export default DestinyCell;
