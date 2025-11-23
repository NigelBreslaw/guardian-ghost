import { Tabs } from "expo-router";
import { Platform, View } from "react-native";
import { Image } from "expo-image";
import { InventoryPageEnums } from "@/app/inventory/logic/Helpers.ts";
import { useGGStore } from "@/app/store/GGStore.ts";
import OptionsMenu from "@/components/ui/OptionsMenu.tsx";

function pageEnumToPageName(pageEnum: InventoryPageEnums): string {
  switch (pageEnum) {
    case InventoryPageEnums.Armor:
      return "armor";
    case InventoryPageEnums.General:
      return "inventory";
    case InventoryPageEnums.Weapons:
      return "weapons";
  }
  return "weapons";
}

export default function TabsLayout() {
  "use memo";

  const initialRouteName = pageEnumToPageName(useGGStore.getState().currentInventoryPage);

  return (
    <View style={{ flex: 1 }}>
      {Platform.OS !== "ios" && <OptionsMenu />}
      <Tabs
        initialRouteName={initialRouteName}
        screenOptions={{
          tabBarActiveTintColor: "orange",
          tabBarInactiveTintColor: "gray",
          tabBarStyle: {
            backgroundColor: "#17101F",
          },
          headerShown: false, // Headers are now handled by drawer
        }}
      >
        <Tabs.Screen
          name="weapons"
          options={{
            title: "Weapons",
            tabBarIcon: ({ color, size }) => {
              // eslint-disable-next-line @typescript-eslint/no-require-imports
              return <Image source={require("../../../images/sword.svg")} style={{ width: size || 24, height: size || 24, tintColor: color }} />;
            },
          }}
        />
        <Tabs.Screen
          name="armor"
          options={{
            title: "Armor",
            tabBarIcon: ({ color, size }) => {
              // eslint-disable-next-line @typescript-eslint/no-require-imports
              return <Image source={require("../../../images/shield.svg")} style={{ width: size || 24, height: size || 24, tintColor: color }} />;
            },
          }}
        />
        <Tabs.Screen
          name="inventory"
          options={{
            title: "Inventory",
            tabBarIcon: ({ color, size }) => {
              // eslint-disable-next-line @typescript-eslint/no-require-imports
              return <Image source={require("../../../images/package.svg")} style={{ width: size || 24, height: size || 24, tintColor: color }} />;
            },
          }}
        />
      </Tabs>
    </View>
  );
}

