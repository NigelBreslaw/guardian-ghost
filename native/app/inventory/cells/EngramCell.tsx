import { INNER_FRAME_SIZE, PRIMARY_STAT_FONT_SIZE } from "@/app/utilities/UISize.ts";
import { Image } from "expo-image";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { EMPTY_ENGRAM } from "@/app/inventory/logic/Constants.ts";
import type { DestinyIconData } from "@/app/inventory/logic/Types.ts";
import { useNavigation } from "@react-navigation/native";
import React from "react";

const DEFAULT_BORDER_COLOR = "#303036";

const styles = StyleSheet.create({
  frameSize: {
    width: INNER_FRAME_SIZE,
    height: INNER_FRAME_SIZE,
    pointerEvents: "none",
  },
  primaryStat: {
    paddingLeft: 2,
    paddingRight: 2,
    paddingTop: 1,
    paddingBottom: 1,
    borderRadius: 4,
    backgroundColor: DEFAULT_BORDER_COLOR,
    position: "absolute",
    bottom: 0,
    right: -4,
    justifyContent: "center",
    alignItems: "center",
  },
  powerLevelText: {
    color: "white",
    fontSize: PRIMARY_STAT_FONT_SIZE,
    fontWeight: "bold",
    alignContent: "center",
    includeFontPadding: false,
    pointerEvents: "none",
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
