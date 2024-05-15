import WeaponsPage from "@/app/inventory/pages/WeaponsPage.tsx";
import ArmorPage from "@/app/inventory/pages/ArmorPage.tsx";
import GeneralPage from "@/app/inventory/pages/GeneralPage.tsx";
import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Image } from "expo-image";
import { StyleSheet, View } from "react-native";

const WEAPONS_TAB_ICON = require("../../../images/weapons_tab.webp");
const ARMOR_TAB_ICON = require("../../../images/armor_tab.webp");
const GENERAL_TAB_ICON = require("../../../images/general_tab.webp");

const Tab = createBottomTabNavigator();

function InventoryPages() {
  return (
    <View style={{ flex: 1 }}>
      <Tab.Navigator
        detachInactiveScreens={true}
        screenOptions={({ route }) => ({
          tabBarIcon: ({ focused }) => {
            switch (route.name) {
              case "tab-weapons":
                return (
                  <Image
                    source={WEAPONS_TAB_ICON}
                    cachePolicy="memory"
                    style={{ width: 20, height: 20, opacity: focused ? 1 : 0.4 }}
                  />
                );
              case "tab-armor":
                return (
                  <Image
                    source={ARMOR_TAB_ICON}
                    cachePolicy="memory"
                    style={{ width: 20, height: 20, opacity: focused ? 1 : 0.4 }}
                  />
                );
              case "tab-inventory":
                return (
                  <Image
                    source={GENERAL_TAB_ICON}
                    cachePolicy="memory"
                    style={{ width: 20, height: 20, opacity: focused ? 1 : 0.4 }}
                  />
                );
            }
          },
          tabBarActiveTintColor: "white",
          tabBarInactiveTintColor: "gray",
          tabBarStyle: {
            borderTopColor: "grey",
            borderTopWidth: StyleSheet.hairlineWidth,
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
