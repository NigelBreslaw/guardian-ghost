import { ICON_SIZE, INNER_FRAME_SIZE } from "@/app/utilities/UISize.ts";
import { Image } from "expo-image";
import React from "react";
import { StyleSheet, View, TouchableOpacity } from "react-native";
import { CRAFTED_OVERLAY } from "@/app/inventory/logic/Constants.ts";
import type { DestinyItem } from "@/app/inventory/logic/Types.ts";
import { returnBorderColor } from "@/app/store/AccountInventoryLogic.ts";

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
});

type IconCellProps = {
  readonly destinyItem: DestinyItem;
};

function IconCell(props: IconCellProps) {
  const borderColor = returnBorderColor(props.destinyItem);

  return (
    <TouchableOpacity>
      <View style={styles.container}>
        <View style={[styles.icon, { borderColor }]}>
          <Image
            source={{ uri: props.destinyItem.instance.icon }}
            cachePolicy="memory-disk"
            style={styles.innerFrameSize}
            recyclingKey={props.destinyItem.instance.icon}
          />

          <Image
            source={{ uri: props.destinyItem.instance.calculatedWaterMark }}
            cachePolicy="memory-disk"
            style={styles.innerFrameSize}
            recyclingKey={props.destinyItem.instance.calculatedWaterMark}
          />

          {props.destinyItem.instance.crafted && (
            <Image source={CRAFTED_OVERLAY} cachePolicy="memory" style={styles.innerFrameSize} />
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
}

export default React.memo(IconCell);
