import { Drawer } from "expo-router/drawer";
import { View, ActivityIndicator, Platform, Pressable, StyleSheet } from "react-native";
import { Image } from "expo-image";
import { useGGStore } from "@/app/store/GGStore.ts";
import CustomDrawerContent from "./_drawer-content.tsx";
import CharacterHeaderButtons from "@/app/UI/CharacterHeaderButtons.tsx";
import ContextIosMenu from "@/components/ui/ContextIosMenu";
import InventoryHeader from "@/app/inventory/pages/InventoryHeader.tsx";
import Spinner from "@/app/UI/Spinner.tsx";
import { ELLIPSES_HORIZONTAL } from "@/app/utilities/Constants.ts";

function MenuButton() {
  "use memo";
  const refreshing = useGGStore((state) => state.refreshing);

  return (
    <Pressable
      style={({ pressed }) => (pressed ? headerStyles.highlight : headerStyles.pressable)}
      onPress={() => useGGStore.getState().showInventoryMenu(true)}
    >
      <View style={headerStyles.iconButton}>
        {refreshing && (
          <View style={headerStyles.spinner}>
            <Spinner size={70} />
          </View>
        )}
        <Image source={ELLIPSES_HORIZONTAL} style={{ width: 24, height: 24 }} />
      </View>
    </Pressable>
  );
}

export default function AuthenticatedLayout() {
  "use memo";

  const appReady = useGGStore((state) => state.appReady);

  console.log("[AuthenticatedLayout] Rendering, appReady:", appReady);

  if (!appReady) {
    console.log("[AuthenticatedLayout] Showing loading - waiting for appReady");
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#17101F" }}>
        <ActivityIndicator size="large" color="#ffffff" />
      </View>
    );
  }

  console.log("[AuthenticatedLayout] Rendering Drawer");
  return (
    <Drawer
      drawerContent={CustomDrawerContent}
      screenOptions={{
        swipeEdgeWidth: 0,
        drawerType: "front",
        // Don't set headerShown here - let it default so drawer toggle can appear
        // Individual screens will configure their own headers
      }}
    >
      <Drawer.Screen
        name="(tabs)"
        options={{
          drawerLabel: "Inventory",
          title: "Inventory",
          headerTintColor: "white",
          headerRight: () => (Platform.OS === "ios" ? <ContextIosMenu /> : <MenuButton />),
          headerTitle: () => <CharacterHeaderButtons />,
          headerBackground: () => <InventoryHeader />,
        }}
      />
      <Drawer.Screen
        name="search"
        options={{
          drawerLabel: "Search",
          title: "Search",
          // Don't explicitly hide header - stack screen will handle it
        }}
      />
      <Drawer.Screen
        name="settings"
        options={{
          drawerLabel: "Settings",
          title: "Settings",
          // Don't explicitly hide header - stack screen will handle it
        }}
      />
      <Drawer.Screen
        name="details"
        options={{
          drawerLabel: () => null, // Hide details from drawer
          drawerItemStyle: { display: "none" },
          headerShown: false, // Hide drawer header for details
        }}
      />
    </Drawer>
  );
}

const headerStyles = StyleSheet.create({
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

