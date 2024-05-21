import WeaponsPage from "@/app/inventory/pages/WeaponsPage.tsx";
import ArmorPage from "@/app/inventory/pages/ArmorPage.tsx";
import GeneralPage from "@/app/inventory/pages/GeneralPage.tsx";
import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { StyleSheet, View } from "react-native";

const Tab = createBottomTabNavigator();

function InventoryPages() {
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
            height: 60,
          },
          tabBarIconStyle: {
            display: "none",
          },
          tabBarLabelStyle: {
            alignSelf: "center",
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
