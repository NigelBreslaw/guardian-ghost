import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Platform, StyleSheet, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as Haptics from "expo-haptics";

import WeaponsPage from "@/app/inventory/pages/WeaponsPage.tsx";
import ArmorPage from "@/app/inventory/pages/ArmorPage.tsx";
import GeneralPage from "@/app/inventory/pages/GeneralPage.tsx";
import { InventoryPageEnums } from "@/app/inventory/logic/Helpers.ts";
import { useGGStore } from "@/app/store/GGStore.ts";
import type { TouchableOpacityProps } from "react-native-gesture-handler";

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

const Tab = createBottomTabNavigator();

export default function InventoryPages() {
  "use memo";
  const insets = useSafeAreaInsets();
  // The hack on height and marginBottom is because something is bugged with either this component
  // layout or the bottom tab bar. The height depends on the existence of a safeArea. Web, android and
  // older iOS devices with no bottom safeArea will size the bar differently to iOS devices with a safeArea.
  // So the height now depends on this safeArea being larger than zero.

  return (
    <View style={{ flex: 1, position: "relative" }}>
      <Tab.Navigator
        detachInactiveScreens={true}
        initialRouteName={pageEnumToPageName(useGGStore.getState().currentInventoryPage)}
        screenOptions={() => ({
          tabBarAllowFontScaling: false,
          lazy: false,
          tabBarActiveTintColor: "white",
          tabBarInactiveTintColor: "gray",
          tabBarStyle: {
            borderTopColor: "grey",
            borderTopWidth: StyleSheet.hairlineWidth,
            height: insets.bottom > 0 ? 70 : 50,
          },
          tabBarIconStyle: {
            display: "none",
          },
          tabBarLabelStyle: {
            fontSize: 13,
          },
        })}
      >
        <Tab.Screen
          name="tab-weapons"
          options={{
            tabBarLabel: "Weapons",
            tabBarButton: (props) => (
              <TouchableOpacity
                {...(props as TouchableOpacityProps)}
                style={[{ alignSelf: "center", justifyContent: "center", height: "100%" }]}
                onPressIn={() => {
                  if (Platform.OS !== "web") {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  }
                }}
              />
            ),
            headerStyle: {
              height: 0,
            },
          }}
          component={WeaponsPage}
        />
        <Tab.Screen
          name="tab-armor"
          options={{
            tabBarLabel: "Armor",
            tabBarButton: (props) => (
              <TouchableOpacity
                {...(props as TouchableOpacityProps)}
                style={[{ alignSelf: "center", justifyContent: "center", height: "100%" }]}
                onPressIn={() => {
                  if (Platform.OS !== "web") {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  }
                }}
              />
            ),
            headerStyle: {
              height: 0,
            },
          }}
          component={ArmorPage}
        />
        <Tab.Screen
          name="tab-inventory"
          options={{
            tabBarLabel: "Inventory",
            tabBarButton: (props) => (
              <TouchableOpacity
                {...(props as TouchableOpacityProps)}
                style={[{ alignSelf: "center", justifyContent: "center", height: "100%" }]}
                onPressIn={() => {
                  if (Platform.OS !== "web") {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  }
                }}
              />
            ),
            headerStyle: {
              height: 0,
            },
          }}
          component={GeneralPage}
        />
      </Tab.Navigator>
    </View>
  );
}
