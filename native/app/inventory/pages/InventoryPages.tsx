import { createNativeBottomTabNavigator } from "@bottom-tabs/react-navigation";
import { Platform, View } from "react-native";
import * as Haptics from "expo-haptics";

import WeaponsPage from "@/app/inventory/pages/WeaponsPage.tsx";
import ArmorPage from "@/app/inventory/pages/ArmorPage.tsx";
import GeneralPage from "@/app/inventory/pages/GeneralPage.tsx";
import { InventoryPageEnums } from "@/app/inventory/logic/Helpers.ts";
import { useGGStore } from "@/app/store/GGStore.ts";
import OptionsMenu from "@/components/ui/OptionsMenu.tsx";

function pageEnumToPageName(pageEnum: InventoryPageEnums): string {
  switch (pageEnum) {
    case InventoryPageEnums.Armor:
      return "tab-armor";
    case InventoryPageEnums.General:
      return "tab-inventory";
    case InventoryPageEnums.Weapons:
      return "tab-weapons";
  }
  return "tab-weapons";
}

const Tab = createNativeBottomTabNavigator();

export default function InventoryPages() {
  "use memo";

  return (
    <View style={{ flex: 1 }}>
      <OptionsMenu />
      <Tab.Navigator
        initialRouteName={pageEnumToPageName(useGGStore.getState().currentInventoryPage)}
        tabBarActiveTintColor="white"
        tabBarInactiveTintColor="gray"
        tabBarStyle={{
          backgroundColor: "#17101F",
        }}
        screenListeners={{
          tabPress: () => {
            if (Platform.OS !== "web") {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            }
          },
        }}
      >
        <Tab.Screen
          name="tab-weapons"
          component={WeaponsPage}
          options={{
            title: "Weapons",
          }}
        />
        <Tab.Screen
          name="tab-armor"
          component={ArmorPage}
          options={{
            title: "Armor",
          }}
        />
        <Tab.Screen
          name="tab-inventory"
          component={GeneralPage}
          options={{
            title: "Inventory",
          }}
        />
      </Tab.Navigator>
    </View>
  );
}
