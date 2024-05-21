import { DestinyIconStyles } from "@/app/utilities/UISize.ts";
import { Image } from "expo-image";
import React from "react";
import { Text, View, TouchableOpacity } from "react-native";
import { CRAFTED_OVERLAY } from "@/app/inventory/logic/Constants.ts";
import { useNavigation } from "@react-navigation/native";
import type { BucketHash, CharacterId, ItemHash, ItemInstanceId } from "@/app/core/GetProfile.ts";

type DestinyCellProps = {
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

const DestinyCell2 = (props: DestinyCellProps) => {
  const navigation = useNavigation();
  const handlePress = () => {
    navigation.navigate("Details", {
      characterId: props.characterId,
      itemHash: props.itemHash,
      itemInstanceId: props.itemInstanceId,
      bucketHash: props.bucketHash,
    });
  };

  return (
    <TouchableOpacity onPress={handlePress}>
      <View style={DestinyIconStyles.container}>
        <View style={[DestinyIconStyles.icon, { borderColor: props.borderColor }]}>
          <Image
            source={{ uri: props.icon }}
            cachePolicy="memory-disk"
            style={DestinyIconStyles.innerFrameSize}
            recyclingKey={props.icon}
          />

          <Image
            source={{ uri: props.calculatedWaterMark }}
            cachePolicy="memory-disk"
            style={DestinyIconStyles.innerFrameSize}
            recyclingKey={props.calculatedWaterMark}
          />

          {props.crafted && (
            <Image source={CRAFTED_OVERLAY} cachePolicy="memory" style={DestinyIconStyles.innerFrameSize} />
          )}
        </View>
        {props.primaryStat > 0 && (
          <View style={DestinyIconStyles.primaryStat}>
            <Text style={DestinyIconStyles.primaryStatText}>{props.primaryStat}</Text>
          </View>
        )}
        {props.damageTypeIconUri && (
          <View style={DestinyIconStyles.miniIconBurn}>
            <Image style={DestinyIconStyles.miniIconBurnSize} source={props.damageTypeIconUri} cachePolicy="memory" />
          </View>
        )}
        {props.quantity > 1 && (
          <View style={props.stackSizeMaxed ? DestinyIconStyles.quantityMaxed : DestinyIconStyles.quantity}>
            <Text
              style={
                props.stackSizeMaxed ? DestinyIconStyles.quantityLevelTextMaxed : DestinyIconStyles.quantityLevelText
              }
            >
              {props.quantity}
            </Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
};

export default React.memo(DestinyCell2);
