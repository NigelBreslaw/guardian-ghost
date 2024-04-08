import { StyleSheet } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Platform } from "react-native";
import WeaponsPage from "@/app/screens/WeaponsPage.tsx";
import ArmorPage from "@/app/screens/ArmorPage.tsx";
import GeneralPage from "@/app/screens/GeneralPage.tsx";
import { createMaterialBottomTabNavigator } from "@react-navigation/material-bottom-tabs";
import React from "react";

const Tab = createMaterialBottomTabNavigator();

const styles = StyleSheet.create({
  bar: {
    backgroundColor: "black",
    borderTopColor: "#2A1D38",
    borderTopWidth: StyleSheet.hairlineWidth,
  },
});

function InventoryPages() {
  const insets = useSafeAreaInsets();

  const barStyle = {
    ...styles.bar,
    height: insets.bottom + (Platform.OS === "ios" ? 50 : 70),
  };

  return (
    <Tab.Navigator
      shifting={true}
      activeColor="white"
      activeIndicatorStyle={{ backgroundColor: "#303030", borderRadius: 5 }}
      inactiveColor="grey"
      barStyle={barStyle}
    >
      <Tab.Screen
        name="tab-weapons"
        options={{
          tabBarLabel: "Weapons",
          tabBarIcon: "pistol",
        }}
        component={WeaponsPage}
      />
      <Tab.Screen
        name="tab-armor"
        options={{
          tabBarLabel: "Armor",
          tabBarIcon: "tshirt-crew-outline",
        }}
        component={ArmorPage}
      />
      <Tab.Screen
        name="tab-inventory"
        options={{
          tabBarLabel: "Inventory",
          tabBarIcon: "diamond-stone",
        }}
        component={GeneralPage}
      />
    </Tab.Navigator>
  );
}

export default React.memo(InventoryPages);
