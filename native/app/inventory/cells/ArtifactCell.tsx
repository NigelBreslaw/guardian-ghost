import React from "react";
import { useNavigation } from "@react-navigation/native";
import { Image } from "expo-image";
import { StyleSheet, Text, View, TouchableOpacity } from "react-native";

import type { DestinyIconData } from "@/app/inventory/logic/Types.ts";
import { DEFAULT_OVERLAP_COLOR } from "@/app/inventory/logic/Constants.ts";
import { ICON_SIZE, INNER_FRAME_SIZE } from "@/app/utilities/UISize.ts";

type Props = {
  readonly iconData: DestinyIconData;
};

const ArtifactCell = ({ iconData }: Props) => {
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
      <View style={styles.container}>
        <View style={[styles.icon, { borderColor: iconData.borderColor }]}>
          <Image
            source={{ uri: iconData.icon }}
            cachePolicy="memory-disk"
            style={styles.innerFrameSize}
            recyclingKey={iconData.icon}
          />

          <Image
            source={{ uri: iconData.calculatedWaterMark }}
            cachePolicy="memory-disk"
            style={styles.innerFrameSize}
            recyclingKey={iconData.calculatedWaterMark}
          />
        </View>
        {iconData.primaryStat > 0 && (
          <View style={styles.primaryStat}>
            <Text style={styles.primaryStatText}>{`+${iconData.primaryStat}`}</Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
};

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
    color: "#56B1B7",
    fontSize: 14,
    fontWeight: "bold",
    alignContent: "center",
    includeFontPadding: false,
    pointerEvents: "none",
  },
});

export default React.memo(ArtifactCell);
