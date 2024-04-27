import WeaponsPage from "@/app/screens/WeaponsPage.tsx";
import ArmorPage from "@/app/screens/ArmorPage.tsx";
import GeneralPage from "@/app/screens/GeneralPage.tsx";
import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Image } from "expo-image";
import { StyleSheet } from "react-native";

const WEAPONS_TAB_ICON = require("../../images/weapons_tab.webp");
const ARMOR_TAB_ICON = require("../../images/armor_tab.webp");
const GENERAL_TAB_ICON = require("../../images/general_tab.webp");

const Tab = createBottomTabNavigator();

function InventoryPages() {
  return (
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
  );
}

export default React.memo(InventoryPages);
