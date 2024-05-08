import { View } from "react-native";
import { Image } from "expo-image";

type PerkCircleProps = {
  icon: string | undefined;
  isEnabled: boolean;
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
      <Image source={props.icon} style={{ width: 30, height: 30 }} />
    </View>
  );
}
