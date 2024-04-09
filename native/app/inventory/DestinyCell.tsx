import { ITEM_SIZE, type DestinyIconData } from "@/app/inventory/Common.ts";
import { useGGStore } from "@/app/store/GGStore.ts";
import { Image } from "expo-image";
import React, { useCallback, useMemo } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

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
  data: DestinyIconData;
};

const DestinyCell = (props: DestinyCellProps) => {
  const borderColor = useMemo(() => (props.data.masterwork ? "#CEAE32" : "#555555"), [props.data.masterwork]);

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
          <View style={[styles.icon, { borderColor }]}>
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
            </View>
          </View>
          {props.data.primaryStat !== "" && (
            <View style={styles.powerLevel}>
              <Text style={styles.powerLevelText}>{props.data.primaryStat}</Text>
            </View>
          )}
          {props.data.damageTypeIconUri && (
            <View style={styles.miniIconBurn}>
              <Image style={styles.miniIconBurnSize} source={props.data.damageTypeIconUri} cachePolicy="memory" />
            </View>
          )}
        </View>
      </TouchableOpacity>
    </View>
  );
};

export default React.memo(DestinyCell);
