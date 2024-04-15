import { View } from "react-native";
import { Image } from "expo-image";
import { useGGStore } from "@/app/store/GGStore.ts";

function InventoryHeader() {
  const currentListIndex = useGGStore((state) => state.currentListIndex);
  const characterBackgroundEmblem = useGGStore((state) => state.ggCharacters[currentListIndex]?.secondarySpecial);

  return (
    <View style={{ flex: 1 }}>
      <Image style={{ flex: 1 }} transition={150} source={characterBackgroundEmblem} />
    </View>
  );
}

export default InventoryHeader;
