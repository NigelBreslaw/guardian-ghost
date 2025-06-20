import { useNavigation } from "@react-navigation/native";
import { Image } from "expo-image";
import { StyleSheet, View, TouchableOpacity } from "react-native";

import Text from "@/app/UI/Text.tsx";
import type { DestinyItem } from "@/app/inventory/logic/Types.ts";
import { DEFAULT_OVERLAP_COLOR } from "@/app/utilities/Constants.ts";
import { ICON_SIZE, INNER_FRAME_SIZE } from "@/app/utilities/UISize.ts";
import EmptyCell from "@/app/inventory/cells/EmptyCell.tsx";
import { returnBorderColor } from "@/app/store/InventoryLogic.ts";

type Props = {
  readonly destinyItem: DestinyItem | undefined;
};

export default function ArtifactCell({ destinyItem }: Props) {
  "use memo";

  const navigation = useNavigation();

  if (destinyItem === undefined) {
    return (
      <View style={styles.container}>
        <EmptyCell />
      </View>
    );
  }
  const borderColor = returnBorderColor(destinyItem);

  const handlePress = () => {
    navigation.navigate("Details", {
      characterId: destinyItem.characterId,
      itemHash: destinyItem.itemHash,
      itemInstanceId: destinyItem.itemInstanceId,
      bucketHash: destinyItem.bucketHash,
    });
  };

  return (
    <TouchableOpacity onPress={handlePress}>
      <View style={styles.container}>
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
        </View>
        {destinyItem.instance.primaryStat > 0 && (
          <View style={styles.primaryStat}>
            <Text style={styles.primaryStatText}>{`+${destinyItem.instance.primaryStat}`}</Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
}

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
