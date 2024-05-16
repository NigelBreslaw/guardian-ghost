import {
  ICON_SIZE,
  INNER_FRAME_SIZE,
  MINI_ICON_SIZE,
  MINI_BURN_SIZE,
  PRIMARY_STAT_FONT_SIZE,
  RIGHT_ALIGNMENT,
} from "@/app/utilities/UISize.ts";
import { Image } from "expo-image";
import React from "react";
import { StyleSheet, Text, View, TouchableOpacity } from "react-native";
import { CRAFTED_OVERLAY, DEFAULT_OVERLAP_COLOR } from "@/app/inventory/logic/Constants.ts";
import { useNavigation } from "@react-navigation/native";

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
    fontSize: PRIMARY_STAT_FONT_SIZE,
    alignContent: "center",
    includeFontPadding: false,
    pointerEvents: "none",
  },
  quantityLevelTextMaxed: {
    color: "#F7F8E3",
    fontSize: PRIMARY_STAT_FONT_SIZE,
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
    fontSize: PRIMARY_STAT_FONT_SIZE,
    fontWeight: "bold",
    alignContent: "center",
    includeFontPadding: false,
    pointerEvents: "none",
  },
  miniIconBurnSize: {
    width: MINI_BURN_SIZE,
    height: MINI_BURN_SIZE,
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
  readonly characterId: string;
  readonly itemHash: number;
  readonly itemInstanceId: string | undefined;
  readonly bucketHash: number;
  readonly icon: string;
  readonly calculatedWaterMark: string;
  readonly crafted: boolean;
  readonly damageTypeIconUri: number | null;
  readonly borderColor: string;
  readonly stackSizeMaxed: boolean;
  readonly primaryStat: number;
  readonly quantity: number;
};

const DestinyCell2 = (props: DestinyCellProps) => {
  const navigation = useNavigation();
  const handlePress = () => {
    navigation.navigate("Details", {
      characterId: props.characterId,
      itemHash: props.itemHash,
      itemInstanceId: props.itemInstanceId,
      bucketHash: props.bucketHash,
    });
  };

  return (
    <TouchableOpacity onPress={handlePress}>
      <View style={styles.container}>
        <View style={[styles.icon, { borderColor: props.borderColor }]}>
          <Image
            source={{ uri: props.icon }}
            cachePolicy="memory-disk"
            style={styles.innerFrameSize}
            recyclingKey={props.icon}
          />

          <Image
            source={{ uri: props.calculatedWaterMark }}
            cachePolicy="memory-disk"
            style={styles.innerFrameSize}
            recyclingKey={props.calculatedWaterMark}
          />

          {props.crafted && <Image source={CRAFTED_OVERLAY} cachePolicy="memory" style={styles.innerFrameSize} />}
        </View>
        {props.primaryStat > 0 && (
          <View style={styles.primaryStat}>
            <Text style={styles.primaryStatText}>{props.primaryStat}</Text>
          </View>
        )}
        {props.damageTypeIconUri && (
          <View style={styles.miniIconBurn}>
            <Image style={styles.miniIconBurnSize} source={props.damageTypeIconUri} cachePolicy="memory" />
          </View>
        )}
        {props.quantity > 1 && (
          <View style={props.stackSizeMaxed ? styles.quantityMaxed : styles.quantity}>
            <Text style={props.stackSizeMaxed ? styles.quantityLevelTextMaxed : styles.quantityLevelText}>
              {props.quantity}
            </Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
};

export default React.memo(DestinyCell2);
