import { useNavigation } from "@react-navigation/native";
import { Image } from "expo-image";
import { Text, View, TouchableOpacity, StyleSheet } from "react-native";

import { DestinyIconStyles, ICON_SIZE } from "@/app/utilities/UISize.ts";
import { CRAFTED_OVERLAY, getDamageTypeIconUri } from "@/app/utilities/Constants.ts";
import type { DestinyItem } from "@/app/inventory/logic/Types.ts";
import { returnBorderColor } from "@/app/store/AccountInventoryLogic.ts";
import EmptyCell from "@/app/inventory/cells/EmptyCell.tsx";

type Props = {
  readonly destinyItem: DestinyItem | undefined;
};

export default function DestinyCell3({ destinyItem }: Props) {
  "use memo";

  if (destinyItem === undefined) {
    return (
      <View style={styles.container}>
        <EmptyCell />
      </View>
    );
  }
  const { characterId, itemHash, itemInstanceId, bucketHash, quantity } = destinyItem;

  const icon = destinyItem.instance.icon;
  const calculatedWaterMark = destinyItem.instance.calculatedWaterMark ?? "";
  const damageTypeIconUri = getDamageTypeIconUri(destinyItem.instance.damageType);
  const crafted = destinyItem.instance.crafted ?? false;
  const stackSizeMaxed = destinyItem.quantity === destinyItem.def.maxStackSize;
  const primaryStat = destinyItem.instance.primaryStat;
  const borderColor = returnBorderColor(destinyItem);

  const navigation = useNavigation();
  const handlePress = () => {
    navigation.navigate("Details", {
      characterId,
      itemHash,
      itemInstanceId,
      bucketHash,
    });
  };

  return (
    <TouchableOpacity onPress={handlePress}>
      <View style={DestinyIconStyles.container}>
        <View style={[DestinyIconStyles.icon, { borderColor: borderColor }]}>
          <Image
            source={{ uri: icon }}
            cachePolicy="memory-disk"
            style={DestinyIconStyles.innerFrameSize}
            recyclingKey={icon}
          />

          <Image
            source={{ uri: calculatedWaterMark }}
            cachePolicy="memory-disk"
            style={DestinyIconStyles.innerFrameSize}
            recyclingKey={calculatedWaterMark}
          />

          {crafted && <Image source={CRAFTED_OVERLAY} cachePolicy="memory" style={DestinyIconStyles.innerFrameSize} />}
        </View>
        {primaryStat > 0 && (
          <View style={DestinyIconStyles.primaryStat}>
            <Text style={DestinyIconStyles.primaryStatText}>{primaryStat}</Text>
          </View>
        )}
        {damageTypeIconUri && (
          <View style={DestinyIconStyles.miniIconBurn}>
            <Image style={DestinyIconStyles.miniIconBurnSize} source={damageTypeIconUri} cachePolicy="memory" />
          </View>
        )}
        {quantity > 1 && (
          <View style={stackSizeMaxed ? DestinyIconStyles.quantityMaxed : DestinyIconStyles.quantity}>
            <Text
              style={stackSizeMaxed ? DestinyIconStyles.quantityLevelTextMaxed : DestinyIconStyles.quantityLevelText}
            >
              {quantity}
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
