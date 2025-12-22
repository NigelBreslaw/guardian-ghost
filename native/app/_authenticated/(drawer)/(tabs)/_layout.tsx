import { NativeTabs } from "expo-router/unstable-native-tabs";
import { Platform, View } from "react-native";
import OptionsMenu from "@/components/ui/OptionsMenu.tsx";
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';

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
          <NativeTabs.Trigger.Label>Weapons</NativeTabs.Trigger.Label>
          <NativeTabs.Trigger.Icon src={<NativeTabs.Trigger.VectorIcon family={MaterialCommunityIcons} name="sword" />} />
        </NativeTabs.Trigger>
        <NativeTabs.Trigger name="armor">
          <NativeTabs.Trigger.Label>Armor</NativeTabs.Trigger.Label>
          <NativeTabs.Trigger.Icon src={<NativeTabs.Trigger.VectorIcon family={MaterialCommunityIcons} name="shield-half-full" />} />
        </NativeTabs.Trigger>
        <NativeTabs.Trigger name="inventory">
          <NativeTabs.Trigger.Label>Inventory</NativeTabs.Trigger.Label>
          <NativeTabs.Trigger.Icon src={<NativeTabs.Trigger.VectorIcon family={MaterialCommunityIcons} name="package-variant-closed" />} />
        </NativeTabs.Trigger>
      </NativeTabs>
    </View>
  );
}
