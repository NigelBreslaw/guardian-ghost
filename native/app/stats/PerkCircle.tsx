import { TouchableOpacity, View } from "react-native";
import { Image } from "expo-image";

import { ENHANCED_TRAIT } from "@/app/utilities/Constants.ts";

type Props = {
  readonly icon: string | undefined;
  readonly isEnabled: boolean;
  readonly isEnhanced: boolean;
  readonly onPress: () => void;
};

export default function PerkCircle({ icon, isEnabled, isEnhanced, onPress }: Props) {
  "use memo";
  return (
    <TouchableOpacity onPress={onPress}>
      <View
        style={{
          width: 40,
          height: 40,
          borderWidth: 1,
          borderColor: "white",
          borderRadius: 25,
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: isEnabled ? "#5791BD" : "transparent",
        }}
      >
        <Image source={icon} cachePolicy={"memory-disk"} style={{ width: 30, height: 30 }} />
        {isEnhanced && (
          <Image source={ENHANCED_TRAIT} tintColor="#F4D158" style={{ width: 51, height: 51, position: "absolute" }} />
        )}
      </View>
    </TouchableOpacity>
  );
}
