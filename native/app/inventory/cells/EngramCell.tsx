import { useNavigation } from "@react-navigation/native";
import React from "react";
import { Image } from "expo-image";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

import { INNER_FRAME_SIZE, common } from "@/app/utilities/UISize.ts";
import { EMPTY_ENGRAM } from "@/app/inventory/logic/Constants.ts";
import type { DestinyIconData } from "@/app/inventory/logic/Types.ts";

type Props = {
  readonly iconData: DestinyIconData;
};

const EngramCell = ({ iconData }: Props) => {
  const navigation = useNavigation();

  const handlePress = () => {
    navigation.navigate("Details", {
      characterId: iconData.characterId,
      itemHash: iconData.itemHash,
      itemInstanceId: iconData.itemInstanceId,
      bucketHash: iconData.bucketHash,
    });
  };

  return (
    <TouchableOpacity onPress={handlePress}>
      <View style={styles.frameSize}>
        <Image
          source={iconData?.icon ? iconData.icon : EMPTY_ENGRAM}
          cachePolicy="memory"
          style={styles.frameSize}
          recyclingKey={iconData?.icon}
        />
        {iconData.primaryStat > 0 && (
          <View style={styles.primaryStat}>
            <Text style={styles.powerLevelText}>{iconData.primaryStat}</Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
};

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

export default React.memo(EngramCell);
