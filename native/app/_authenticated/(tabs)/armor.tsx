import { InventoryPageEnums } from "@/app/inventory/logic/Helpers.ts";
import InventoryPage from "@/app/inventory/pages/InventoryPage.tsx";
import { Stack } from "expo-router";
import { Platform } from "react-native";
import CharacterHeaderButtons from "@/app/UI/CharacterHeaderButtons.tsx";
import ContextIosMenu from "@/components/ui/ContextIosMenu";
import InventoryHeader from "@/app/inventory/pages/InventoryHeader.tsx";
import { Pressable, View } from "react-native";
import { Image } from "expo-image";
import { useGGStore } from "@/app/store/GGStore.ts";
import Spinner from "@/app/UI/Spinner.tsx";
import { ELLIPSES_HORIZONTAL } from "@/app/utilities/Constants.ts";
import { StyleSheet } from "react-native";

function MenuButton() {
  "use memo";
  const refreshing = useGGStore((state) => state.refreshing);

  return (
    <Pressable
      style={({ pressed }) => (pressed ? styles.highlight : styles.pressable)}
      onPress={() => useGGStore.getState().showInventoryMenu(true)}
    >
      <View style={styles.iconButton}>
        {refreshing && (
          <View style={styles.spinner}>
            <Spinner size={70} />
          </View>
        )}
        <Image source={ELLIPSES_HORIZONTAL} style={{ width: 24, height: 24 }} />
      </View>
    </Pressable>
  );
}

export default function ArmorPage() {
  "use memo";
  return (
    <>
      <Stack.Screen
        options={{
          headerTintColor: "white",
          headerRight: () => (Platform.OS === "ios" ? <ContextIosMenu /> : <MenuButton />),
          headerTitle: () => <CharacterHeaderButtons />,
          headerBackground: () => <InventoryHeader />,
        }}
      />
      <InventoryPage inventoryPageEnum={InventoryPageEnums.Armor} />
    </>
  );
}

const styles = StyleSheet.create({
  pressable: {
    borderWidth: StyleSheet.hairlineWidth,
  },
  highlight: {
    opacity: 0.5,
    borderWidth: StyleSheet.hairlineWidth,
  },
  iconButton: {
    width: 30,
    height: 30,
    marginRight: 10,
    justifyContent: "center",
    alignContent: "center",
  },
  spinner: {
    alignSelf: "center",
    position: "absolute",
    opacity: 0.4,
  },
});

