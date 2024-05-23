import { useNavigation } from "@react-navigation/native";
import React from "react";
import { Image } from "expo-image";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

import { INNER_FRAME_SIZE, common } from "@/app/utilities/UISize.ts";
import { EMPTY_ENGRAM } from "@/app/inventory/logic/Constants.ts";
import type { DestinyIconData } from "@/app/inventory/logic/Types.ts";

const styles = StyleSheet.create({
  frameSize: {
    width: INNER_FRAME_SIZE,
    height: INNER_FRAME_SIZE,
    pointerEvents: "none",
  },
  primaryStat: {
    ...common.primaryStat,
    bottom: 0,
    right: -4,
  },
  powerLevelText: {
    ...common.primaryStatText,
  },
});

type DestinyCellProps = {
  readonly data: DestinyIconData;
};

const EngramCell = (props: DestinyCellProps) => {
  const navigation = useNavigation();

  const handlePress = () => {
    navigation.navigate("Details", {
      characterId: props.data.characterId,
      itemHash: props.data.itemHash,
      itemInstanceId: props.data.itemInstanceId,
      bucketHash: props.data.bucketHash,
    });
  };

  return (
    <TouchableOpacity onPress={handlePress}>
      <View style={styles.frameSize}>
        <Image
          source={props.data?.icon ? props.data.icon : EMPTY_ENGRAM}
          cachePolicy="memory"
          style={styles.frameSize}
          recyclingKey={props.data?.icon}
        />
        {props.data.primaryStat > 0 && (
          <View style={styles.primaryStat}>
            <Text style={styles.powerLevelText}>{props.data.primaryStat}</Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
};

export default React.memo(EngramCell);
