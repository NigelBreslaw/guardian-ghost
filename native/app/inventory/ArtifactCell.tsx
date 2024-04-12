import { ITEM_SIZE, type DestinyIconData } from "@/app/inventory/Common.ts";
import { useGGStore } from "@/app/store/GGStore.ts";
import { Image } from "expo-image";
import React, { useCallback } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

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
    color: "#56B1B7",
    fontSize: 15,
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
    <View style={styles.container}>
      <TouchableOpacity onPress={handlePress}>
        <View style={styles.frameSize}>
          <View style={styles.icon}>
            <View style={styles.innerFrameSize}>
              <Image
                source={{ uri: props.data.icon }}
                cachePolicy="memory-disk"
                style={styles.innerFrameSize}
                recyclingKey={props.data.icon}
              />
            </View>
          </View>

          <View style={styles.primaryStat}>
            <Text style={styles.primaryStatText}>{`+${props.data.primaryStat}`}</Text>
          </View>
        </View>
      </TouchableOpacity>
    </View>
  );
};

export default React.memo(DestinyCell);
