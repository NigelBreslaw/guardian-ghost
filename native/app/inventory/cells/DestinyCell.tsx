import React from "react";
import { useNavigation } from "@react-navigation/native";
import { Text, View, TouchableOpacity } from "react-native";
import { Image } from "expo-image";

import { DestinyIconStyles } from "@/app/utilities/UISize.ts";
import { CRAFTED_OVERLAY } from "@/app/inventory/logic/Constants.ts";
import type { DestinyIconData } from "@/app/inventory/logic/Types.ts";

type DestinyCellProps = {
  readonly data: DestinyIconData;
};

const DestinyCell = (props: DestinyCellProps) => {
  const navigation = useNavigation();
  const handlePress = () => {
    navigation.navigate("Details", {
      characterId: props.data.characterId,
      itemHash: props.data.itemHash,
      itemInstanceId: props.data.itemInstanceId,
      bucketHash: props.data.bucketHash,
    });
  };

  return (
    <TouchableOpacity onPress={handlePress}>
      <View style={DestinyIconStyles.container}>
        <View style={[DestinyIconStyles.icon, { borderColor: props.data.borderColor }]}>
          <Image
            source={{ uri: props.data.icon }}
            cachePolicy="memory-disk"
            style={DestinyIconStyles.innerFrameSize}
            recyclingKey={props.data.icon}
          />

          <Image
            source={{ uri: props.data.calculatedWaterMark }}
            cachePolicy="memory-disk"
            style={DestinyIconStyles.innerFrameSize}
            recyclingKey={props.data.calculatedWaterMark}
          />

          {props.data.crafted && (
            <Image source={CRAFTED_OVERLAY} cachePolicy="memory" style={DestinyIconStyles.innerFrameSize} />
          )}
        </View>
        {props.data.primaryStat > 0 && (
          <View style={DestinyIconStyles.primaryStat}>
            <Text style={DestinyIconStyles.primaryStatText}>{props.data.primaryStat}</Text>
          </View>
        )}
        {props.data.damageTypeIconUri && (
          <View style={DestinyIconStyles.miniIconBurn}>
            <Image
              style={DestinyIconStyles.miniIconBurnSize}
              source={props.data.damageTypeIconUri}
              cachePolicy="memory"
            />
          </View>
        )}
        {props.data.quantity > 1 && (
          <View style={props.data.stackSizeMaxed ? DestinyIconStyles.quantityMaxed : DestinyIconStyles.quantity}>
            <Text
              style={
                props.data.stackSizeMaxed
                  ? DestinyIconStyles.quantityLevelTextMaxed
                  : DestinyIconStyles.quantityLevelText
              }
            >
              {props.data.quantity}
            </Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
};

export default React.memo(DestinyCell);
