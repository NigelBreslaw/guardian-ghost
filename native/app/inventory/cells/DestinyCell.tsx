import { useNavigation } from "@react-navigation/native";
import { Text, View, TouchableOpacity } from "react-native";
import { Image } from "expo-image";

import { DestinyIconStyles } from "@/app/utilities/UISize.ts";
import { CRAFTED_OVERLAY, ENHANCED_OVERLAY } from "@/app/utilities/Constants.ts";
import type { DestinyIconData } from "@/app/inventory/logic/Types.ts";

type Props = {
  readonly iconData: DestinyIconData;
};

export default function DestinyCell({ iconData }: Props) {
  "use memo";

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
          {iconData.enhanced && (
            <Image source={ENHANCED_OVERLAY} cachePolicy="memory" style={DestinyIconStyles.innerFrameSize} />
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
