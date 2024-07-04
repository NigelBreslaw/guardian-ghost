import { View } from "react-native";
import { Image } from "expo-image";

import { useGGStore } from "@/app/store/GGStore.ts";

export default function InventoryHeader() {
  "use memo";
  const totalCharacters = useGGStore((state) => state.ggCharacters.length);
  const currentListIndex = useGGStore((state) => state.currentListIndex);
  const characterBackgroundEmblem = useGGStore((state) => state.ggCharacters[currentListIndex]?.secondarySpecial);

  if (totalCharacters === 0) {
    return null;
  }

  return (
    <View style={{ flex: 1 }}>
      <Image style={{ flex: 1 }} transition={150} source={characterBackgroundEmblem} />
    </View>
  );
}
