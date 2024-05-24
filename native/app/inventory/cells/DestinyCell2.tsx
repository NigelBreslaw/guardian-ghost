import { useNavigation } from "@react-navigation/native";
import { Text, View, TouchableOpacity, StyleSheet } from "react-native";
import { Image } from "expo-image";

import { DestinyIconStyles, ICON_SIZE } from "@/app/utilities/UISize.ts";
import { CRAFTED_OVERLAY } from "@/app/inventory/logic/Constants.ts";
import type { DestinyIconData } from "@/app/inventory/logic/Types.ts";
import EmptyCell from "@/app/inventory/cells/EmptyCell.tsx";

type Props = {
  readonly iconData: DestinyIconData | undefined;
};

export default function DestinyCell2({ iconData }: Props) {
  "use memo";

  if (iconData === undefined) {
    return (
      <View style={styles.container}>
        <EmptyCell />
      </View>
    );
  }

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
      <View style={DestinyIconStyles.container}>
        <View style={[DestinyIconStyles.icon, { borderColor: iconData.borderColor }]}>
          <Image
            source={{ uri: iconData.icon }}
            cachePolicy="memory-disk"
            style={DestinyIconStyles.innerFrameSize}
            recyclingKey={iconData.icon}
          />

          <Image
            source={{ uri: iconData.calculatedWaterMark }}
            cachePolicy="memory-disk"
            style={DestinyIconStyles.innerFrameSize}
            recyclingKey={iconData.calculatedWaterMark}
          />

          {iconData.crafted && (
            <Image source={CRAFTED_OVERLAY} cachePolicy="memory" style={DestinyIconStyles.innerFrameSize} />
          )}
        </View>
        {iconData.primaryStat > 0 && (
          <View style={DestinyIconStyles.primaryStat}>
            <Text style={DestinyIconStyles.primaryStatText}>{iconData.primaryStat}</Text>
          </View>
        )}
        {iconData.damageTypeIconUri && (
          <View style={DestinyIconStyles.miniIconBurn}>
            <Image
              style={DestinyIconStyles.miniIconBurnSize}
              source={iconData.damageTypeIconUri}
              cachePolicy="memory"
            />
          </View>
        )}
        {iconData.quantity > 1 && (
          <View style={iconData.stackSizeMaxed ? DestinyIconStyles.quantityMaxed : DestinyIconStyles.quantity}>
            <Text
              style={
                iconData.stackSizeMaxed ? DestinyIconStyles.quantityLevelTextMaxed : DestinyIconStyles.quantityLevelText
              }
            >
              {iconData.quantity}
            </Text>
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
});
