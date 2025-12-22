import { NativeTabs } from "expo-router/unstable-native-tabs";
import { Platform, View } from "react-native";
import OptionsMenu from "@/components/ui/OptionsMenu.tsx";

export default function TabsLayout() {
  "use memo";

  return (
    <View style={{ flex: 1 }}>
      {Platform.OS !== "ios" && <OptionsMenu />}
      <NativeTabs
        backgroundColor="#17101F"
        iconColor={{
          default: "gray",
          selected: "orange",
        }}
        labelStyle={{
          default: { color: "gray" },
          selected: { color: "orange" },
        }}
      >
        <NativeTabs.Trigger name="weapons">
          <NativeTabs.Trigger.Icon
            src={require("../../../../images/sword.svg")}
            selectedColor="orange"
          />
          <NativeTabs.Trigger.Label>Weapons</NativeTabs.Trigger.Label>
        </NativeTabs.Trigger>
        <NativeTabs.Trigger name="armor">
          <NativeTabs.Trigger.Icon
            src={require("../../../../images/shield.svg")}
            selectedColor="orange"
          />
          <NativeTabs.Trigger.Label>Armor</NativeTabs.Trigger.Label>
        </NativeTabs.Trigger>
        <NativeTabs.Trigger name="inventory">
          <NativeTabs.Trigger.Icon
            src={require("../../../../images/package.svg")}
            selectedColor="orange"
          />
          <NativeTabs.Trigger.Label>Inventory</NativeTabs.Trigger.Label>
        </NativeTabs.Trigger>
      </NativeTabs>
    </View>
  );
}
