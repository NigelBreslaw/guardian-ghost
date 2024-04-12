import { CRAFTED_OVERLAY, ITEM_SIZE, type DestinyIconData } from "@/app/inventory/Common.ts";
import { useGGStore } from "@/app/store/GGStore.ts";
import { Image } from "expo-image";
import React, { useCallback } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

const MINI_ICON_SIZE = 18;
const RIGHT_ALIGNMENT = -9;
const DEFAULT_OVERLAP_COLOR = "#242429CC";

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
  quantity: {
    paddingLeft: 2,
    paddingRight: 2,
    paddingTop: 0,
    paddingBottom: 0,
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 6,
    borderTopLeftRadius: 0,
    borderTopRightRadius: 0,
    backgroundColor: "#AEAEAE",
    zIndex: 100,
    position: "absolute",
    bottom: 0,
    right: 0,
    justifyContent: "center",
    alignItems: "center",
  },
  quantityLevelText: {
    color: "black",
    fontSize: 15,
    fontWeight: "bold",
    alignContent: "center",
    includeFontPadding: false,
    pointerEvents: "none",
  },
  primaryStat: {
    paddingLeft: 2,
    paddingRight: 2,
    paddingTop: 0,
    paddingBottom: 0,
    borderRadius: 4,
    backgroundColor: DEFAULT_OVERLAP_COLOR,
    zIndex: 100,
    position: "absolute",
    bottom: -6,
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
  icon: {
    width: 68,
    height: 68,
    borderRadius: 12,
    overflow: "hidden",
    borderWidth: 2,
    borderColor: "#555555",
    pointerEvents: "none",
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
    pointerEvents: "none",
  },
  innerFrameOverlaySize: {
    width: 65,
    height: 65,
    position: "absolute",
    pointerEvents: "none",
  },
  crafted: {
    width: 65,
    height: 65,
    position: "absolute",
    pointerEvents: "none",
  },
  miniIconBurnSize: {
    width: 13,
    height: 13,
    pointerEvents: "none",
  },
  miniIconBurn: {
    width: MINI_ICON_SIZE,
    height: MINI_ICON_SIZE,
    borderRadius: 9,
    backgroundColor: DEFAULT_OVERLAP_COLOR,
    position: "absolute",
    zIndex: 100,
    bottom: 14,
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
  }, [props.data]);

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={handlePress}>
        <View style={styles.frameSize}>
          <View style={[styles.icon, { borderColor: props.data.borderColor }]}>
            <View style={styles.innerFrameSize}>
              <Image
                source={{ uri: props.data.icon }}
                cachePolicy="memory-disk"
                style={styles.innerFrameSize}
                recyclingKey={props.data.icon}
              />
              <Image
                source={{ uri: props.data.calculatedWaterMark }}
                cachePolicy="memory-disk"
                style={styles.innerFrameOverlaySize}
                recyclingKey={props.data.calculatedWaterMark}
              />
              <Image
                source={CRAFTED_OVERLAY}
                cachePolicy="memory"
                style={[styles.crafted, { display: props.data.crafted ? "flex" : "none" }]}
              />
            </View>
          </View>
          {props.data.primaryStat !== "" && (
            <View style={styles.primaryStat}>
              <Text style={styles.primaryStatText}>{props.data.primaryStat}</Text>
            </View>
          )}
          {props.data.damageTypeIconUri && (
            <View style={styles.miniIconBurn}>
              <Image style={styles.miniIconBurnSize} source={props.data.damageTypeIconUri} cachePolicy="memory" />
            </View>
          )}
          <View style={[styles.quantity, { display: props.data.quantity > 1 ? "flex" : "none" }]}>
            <Text style={styles.quantityLevelText}>{props.data.quantity}</Text>
          </View>
        </View>
      </TouchableOpacity>
    </View>
  );
};

export default React.memo(DestinyCell);
