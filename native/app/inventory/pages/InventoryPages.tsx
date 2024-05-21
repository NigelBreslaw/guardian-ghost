import WeaponsPage from "@/app/inventory/pages/WeaponsPage.tsx";
import ArmorPage from "@/app/inventory/pages/ArmorPage.tsx";
import GeneralPage from "@/app/inventory/pages/GeneralPage.tsx";
import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const Tab = createBottomTabNavigator();

function InventoryPages() {
  const insets = useSafeAreaInsets();

  // The hack on height and marginBottom is because something is bugged with either this component
  // layout or the bottom tab bar. The height depends on the existence of a safeArea. Web, android and
  // older iOS devices with no bottom safeArea will size the bar differently to iOS devices with a safeArea.
  // So the height now depends on this safeArea being larger than zero.
  return (
    <View style={{ flex: 1 }}>
      <Tab.Navigator
        detachInactiveScreens={true}
        screenOptions={() => ({
          tabBarActiveTintColor: "white",
          tabBarInactiveTintColor: "gray",
          tabBarStyle: {
            borderTopColor: "grey",
            borderTopWidth: StyleSheet.hairlineWidth,
            height: insets.bottom > 0 ? 60 : 30,
            marginBottom: insets.bottom > 0 ? 10 : 15,
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

export default React.memo(InventoryPages);
