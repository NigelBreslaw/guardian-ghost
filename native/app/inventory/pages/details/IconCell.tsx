import { Image } from "expo-image";
import React from "react";
import { StyleSheet, View } from "react-native";

import { ICON_SIZE, INNER_FRAME_SIZE } from "@/app/utilities/UISize.ts";
import { CRAFTED_OVERLAY } from "@/app/inventory/logic/Constants.ts";
import type { DestinyItem } from "@/app/inventory/logic/Types.ts";
import { returnBorderColor } from "@/app/store/AccountInventoryLogic.ts";

type IconCellProps = {
  readonly destinyItem: DestinyItem;
};

function IconCell({ destinyItem }: IconCellProps) {
  const borderColor = returnBorderColor(destinyItem);

  return (
    <View style={styles.container}>
      <View style={styles.innerContainer} />
      <View style={[styles.icon, { borderColor }]}>
        <Image
          source={{ uri: destinyItem.instance.icon }}
          cachePolicy="memory-disk"
          style={styles.innerFrameSize}
          recyclingKey={destinyItem.instance.icon}
        />

        <Image
          source={{ uri: destinyItem.instance.calculatedWaterMark }}
          cachePolicy="memory-disk"
          style={styles.innerFrameSize}
          recyclingKey={destinyItem.instance.calculatedWaterMark}
        />

        {destinyItem.instance.crafted && (
          <Image source={CRAFTED_OVERLAY} cachePolicy="memory" style={styles.innerFrameSize} />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: ICON_SIZE,
    height: ICON_SIZE,
  },
  innerContainer: {
    width: ICON_SIZE,
    height: ICON_SIZE,
    position: "absolute",
    top: 2,
    left: 2,
    pointerEvents: "none",
    backgroundColor: "#313131",
    borderRadius: 12,
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

export default React.memo(IconCell);
