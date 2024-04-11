import { EMPTY_ENGRAM, ITEM_SIZE, type DestinyIconData } from "@/app/inventory/Common.ts";
import { useGGStore } from "@/app/store/GGStore.ts";
import { Image } from "expo-image";
import React, { useCallback } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

const DEFAULT_BORDER_COLOR = "#3E3D45";

const styles = StyleSheet.create({
  container: {
    width: ITEM_SIZE,
    height: ITEM_SIZE,
    justifyContent: "center",
    alignItems: "center",
  },
  powerLevelText: {
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
  primaryStat: {
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
});

type DestinyCellProps = {
  data?: DestinyIconData;
};

const EngramCell = (props: DestinyCellProps) => {
  const handlePress = useCallback(() => {
    if (props.data) {
      useGGStore.getState().setSelectedItem({
        itemInstanceId: props.data.itemInstanceId,
        itemHash: props.data.itemHash,
        characterId: props.data.characterId,
      });
    }
  }, [props.data]);

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={handlePress}>
        <View style={styles.frameSize}>
          <Image
            source={props.data?.icon ? props.data.icon : EMPTY_ENGRAM}
            cachePolicy="memory-disk"
            style={styles.frameSize}
            recyclingKey={props.data?.icon}
          />
          {props.data?.primaryStat !== "" && props.data?.primaryStat && (
            <View style={styles.primaryStat}>
              <Text style={styles.powerLevelText}>{props.data?.primaryStat}</Text>
            </View>
          )}
        </View>
      </TouchableOpacity>
    </View>
  );
};

export default React.memo(EngramCell);
