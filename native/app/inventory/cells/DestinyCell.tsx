import { useNavigation } from "@react-navigation/native";
import { Image } from "expo-image";
import { View, TouchableOpacity, StyleSheet } from "react-native";

import Text from "@/app/UI/Text.tsx";
import { DestinyIconStyles, ICON_SIZE } from "@/app/utilities/UISize.ts";
import { CRAFTED_OVERLAY, ENHANCED_OVERLAY, getDamageTypeIconUri } from "@/app/utilities/Constants.ts";
import type { DestinyItem } from "@/app/inventory/logic/Types.ts";
import { returnBorderColor } from "@/app/store/InventoryLogic.ts";
import EmptyCell from "@/app/inventory/cells/EmptyCell.tsx";
import { LinearGradient } from "expo-linear-gradient";

type Props = {
  readonly destinyItem: DestinyItem | undefined;
};

export default function DestinyCell({ destinyItem }: Props) {
  "use memo";

  const navigation = useNavigation();

  if (destinyItem === undefined) {
    return (
      <View style={styles.container}>
        <EmptyCell />
      </View>
    );
  }
  const { characterId, itemHash, itemInstanceId, bucketHash, quantity, separatorIcon } = destinyItem;
  const { icon, calculatedWaterMark, crafted, enhanced, primaryStat } = destinyItem.instance;
  const damageTypeIconUri = getDamageTypeIconUri(destinyItem.instance.damageType);
  const stackSizeMaxed = destinyItem.quantity === destinyItem.def.maxStackSize;
  const isFeatured = destinyItem.def.isFeatured;
  const borderColor = returnBorderColor(destinyItem);

  const handlePress = () => {
    navigation.navigate("Details", {
      characterId,
      itemHash,
      itemInstanceId,
      bucketHash,
    });
  };

  return (
    <TouchableOpacity disabled={separatorIcon !== undefined} onPress={handlePress}>
      <View style={DestinyIconStyles.container}>
        {separatorIcon && (
          <View style={styles.separator}>
            <LinearGradient
              start={{ x: -1, y: 0 }}
              end={{ x: 1, y: 0 }}
              colors={["#000000", "#1C1C1C", "#313131"]}
              style={styles.separatorInner}
            />
            <Image contentFit="contain" source={separatorIcon} style={styles.separatorIcon} cachePolicy={"memory"} />
          </View>
        )}
        <View style={[DestinyIconStyles.icon, { borderColor: borderColor }]}>
          <Image
            source={{ uri: icon }}
            cachePolicy="memory-disk"
            style={DestinyIconStyles.innerFrameSize}
            recyclingKey={icon}
          />

          {calculatedWaterMark && !isFeatured && (
            <Image
              source={{ uri: calculatedWaterMark }}
              cachePolicy="memory-disk"
              style={DestinyIconStyles.iconWatermark}
              recyclingKey={calculatedWaterMark}
            />
          )}

          {crafted && <Image source={CRAFTED_OVERLAY} cachePolicy="memory" style={DestinyIconStyles.innerFrameSize} />}
          {enhanced && (
            <Image source={ENHANCED_OVERLAY} cachePolicy="memory" style={DestinyIconStyles.innerFrameSize} />
          )}
        </View>
        {calculatedWaterMark && isFeatured && (
          <Image
            source={{ uri: calculatedWaterMark }}
            cachePolicy="memory-disk"
            style={DestinyIconStyles.iconWatermarkFeatured}
            recyclingKey={calculatedWaterMark}
          />
        )}
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
  separator: {
    width: ICON_SIZE,
    height: ICON_SIZE,
    position: "absolute",
    justifyContent: "center",
    alignContent: "center",
  },
  separatorInner: {
    width: ICON_SIZE,
    height: ICON_SIZE,
    borderRadius: 12,
  },
  separatorIcon: {
    position: "absolute",
    alignSelf: "center",
    flex: 1,
    width: "60%",
    height: "60%",
  },
});
