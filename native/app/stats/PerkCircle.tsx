import { View } from "react-native";
import { Image } from "expo-image";
import { ENHANCED_TRAIT } from "@/app/inventory/logic/Constants.ts";

type PerkCircleProps = {
  icon: string | undefined;
  isEnabled: boolean;
  isEnhanced: boolean;
};

export default function PerkCircle(props: PerkCircleProps) {
  return (
    <View
      style={{
        width: 40,
        height: 40,
        borderWidth: 1,
        borderColor: "white",
        borderRadius: 25,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: props.isEnabled ? "#5791BD" : "transparent",
      }}
    >
      <Image source={props.icon} transition={200} style={{ width: 30, height: 30 }} />
      {props.isEnhanced && (
        <Image source={ENHANCED_TRAIT} tintColor="#F4D158" style={{ width: 51, height: 51, position: "absolute" }} />
      )}
    </View>
  );
}
