import { useNavigation } from "@react-navigation/native";
import { Image } from "expo-image";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

import { INNER_FRAME_SIZE, common } from "@/app/utilities/UISize.ts";
import { EMPTY_ENGRAM } from "@/app/utilities/Constants.ts";
import type { DestinyItem } from "@/app/inventory/logic/Types.ts";

type Props = {
  readonly destinyItem: DestinyItem | undefined;
};

export default function EngramCell({ destinyItem }: Props) {
  "use memo";

  if (destinyItem === undefined) {
    return (
      <View style={styles.frameSize}>
        <Image source={EMPTY_ENGRAM} cachePolicy="memory" style={styles.frameSize} />
      </View>
    );
  }
  const navigation = useNavigation();

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
      <View style={styles.frameSize}>
        <Image
          source={destinyItem.instance.icon}
          cachePolicy="memory"
          style={styles.frameSize}
          recyclingKey={destinyItem.instance.icon}
        />
        {destinyItem.instance.primaryStat > 0 && (
          <View style={styles.primaryStat}>
            <Text style={styles.powerLevelText}>{destinyItem.instance.primaryStat}</Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
}

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
