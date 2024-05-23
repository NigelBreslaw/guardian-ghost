import { useNavigation } from "@react-navigation/native";
import { Image } from "expo-image";
import React from "react";
import { Text, View, TouchableOpacity } from "react-native";

import { DestinyIconStyles } from "@/app/utilities/UISize.ts";
import { CRAFTED_OVERLAY } from "@/app/inventory/logic/Constants.ts";
import type { BucketHash, CharacterId, ItemHash, ItemInstanceId } from "@/app/core/GetProfile.ts";

type Props = {
  readonly characterId: CharacterId;
  readonly itemHash: ItemHash;
  readonly itemInstanceId: ItemInstanceId | undefined;
  readonly bucketHash: BucketHash;
  readonly icon: string;
  readonly calculatedWaterMark: string;
  readonly crafted: boolean;
  readonly damageTypeIconUri: number | null;
  readonly borderColor: string;
  readonly stackSizeMaxed: boolean;
  readonly primaryStat: number;
  readonly quantity: number;
};

const DestinyCell2 = ({
  characterId,
  itemHash,
  itemInstanceId,
  bucketHash,
  icon,
  calculatedWaterMark,
  crafted,
  damageTypeIconUri,
  borderColor,
  stackSizeMaxed,
  primaryStat,
  quantity,
}: Props) => {
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
};

export default React.memo(DestinyCell2);
