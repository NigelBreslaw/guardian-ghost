import { CRAFTED_OVERLAY, ICON_SIZE, INNER_FRAME_SIZE, type DestinyIconData } from "@/app/inventory/Common.ts";
import { useGGStore } from "@/app/store/GGStore.ts";
import { Image } from "expo-image";
import React, { useCallback } from "react";
import { StyleSheet, Text, View } from "react-native";
import { TouchableOpacity } from "react-native-gesture-handler";

const MINI_ICON_SIZE = 18;
const RIGHT_ALIGNMENT = -9;
const DEFAULT_OVERLAP_COLOR = "#242429CC";

const common = StyleSheet.create({
  quantity: {
    paddingLeft: 2,
    paddingRight: 2,
    paddingTop: 0,
    paddingBottom: 0,
    borderRadius: 4,
    position: "absolute",
    bottom: 2,
    right: 2,
    justifyContent: "center",
    alignItems: "center",
  },
});

const styles = StyleSheet.create({
  container: {
    width: ICON_SIZE,
    height: ICON_SIZE,
  },
  icon: {
    width: ICON_SIZE,
    height: ICON_SIZE,
    borderRadius: 12,
    overflow: "hidden",
    borderWidth: 2,
    pointerEvents: "none",
  },
  innerFrameSize: {
    width: INNER_FRAME_SIZE,
    height: INNER_FRAME_SIZE,
    position: "absolute",
    top: -0.5,
    left: -0.5,
    pointerEvents: "none",
  },
  quantity: {
    ...common.quantity,
    backgroundColor: "#AEAEAE",
  },
  quantityMaxed: {
    ...common.quantity,
    backgroundColor: "#A48F36",
  },
  quantityLevelText: {
    color: "black",
    fontSize: 15,
    alignContent: "center",
    includeFontPadding: false,
    pointerEvents: "none",
  },
  quantityLevelTextMaxed: {
    color: "#F7F8E3",
    fontSize: 15,
    alignContent: "center",
    includeFontPadding: false,
    pointerEvents: "none",
  },
  primaryStat: {
    paddingLeft: 2,
    paddingRight: 2,
    paddingTop: 1,
    paddingBottom: 1,
    borderRadius: 4,
    backgroundColor: DEFAULT_OVERLAP_COLOR,
    position: "absolute",
    bottom: -7,
    right: -8,
    justifyContent: "center",
    alignItems: "center",
  },
  primaryStatText: {
    color: "white",
    fontSize: 14,
    fontWeight: "bold",
    alignContent: "center",
    includeFontPadding: false,
    pointerEvents: "none",
  },
  miniIconBurnSize: {
    width: 15,
    height: 15,
    pointerEvents: "none",
  },
  miniIconBurn: {
    width: MINI_ICON_SIZE,
    height: MINI_ICON_SIZE,
    borderRadius: 9,
    backgroundColor: DEFAULT_OVERLAP_COLOR,
    position: "absolute",
    bottom: 16,
    right: RIGHT_ALIGNMENT,
    justifyContent: "center",
    alignItems: "center",
  },
});

type DestinyCellProps = {
  data: DestinyIconData;
};

const DestinyCell = (props: DestinyCellProps) => {
  const handlePress = useCallback(() => {
    useGGStore.getState().setSelectedItem({
      itemInstanceId: props.data.itemInstanceId,
      itemHash: props.data.itemHash,
      characterId: props.data.characterId,
    });
  }, [props.data.itemInstanceId, props.data.itemHash, props.data.characterId]);

  return (
    <TouchableOpacity onPress={handlePress}>
      <View style={styles.container}>
        <View style={[styles.icon, { borderColor: props.data.borderColor }]}>
          <Image
            source={{ uri: props.data.icon }}
            cachePolicy="memory-disk"
            style={styles.innerFrameSize}
            recyclingKey={props.data.icon}
          />

          <Image
            source={{ uri: props.data.calculatedWaterMark }}
            cachePolicy="memory-disk"
            style={styles.innerFrameSize}
            recyclingKey={props.data.calculatedWaterMark}
          />

          {props.data.crafted && <Image source={CRAFTED_OVERLAY} cachePolicy="memory" style={styles.innerFrameSize} />}
        </View>
        {props.data.primaryStat > 0 && (
          <View style={styles.primaryStat}>
            <Text style={styles.primaryStatText}>{props.data.primaryStat}</Text>
          </View>
        )}
        {props.data.damageTypeIconUri && (
          <View style={styles.miniIconBurn}>
            <Image style={styles.miniIconBurnSize} source={props.data.damageTypeIconUri} cachePolicy="memory" />
          </View>
        )}
        {props.data.quantity > 1 && (
          <View style={props.data.stackSizeMaxed ? styles.quantityMaxed : styles.quantity}>
            <Text style={props.data.stackSizeMaxed ? styles.quantityLevelTextMaxed : styles.quantityLevelText}>
              {props.data.quantity}
            </Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
};

export default React.memo(DestinyCell);
