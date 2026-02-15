import { View, StyleSheet } from "react-native";
import { Image } from "expo-image";
import { Host, Menu, Button, Picker, Text } from "@expo/ui/swift-ui";
import { buttonStyle, pickerStyle, tag } from "@expo/ui/swift-ui/modifiers";
import { useGGStore } from "@/app/store/GGStore.ts";
import { getFullProfile } from "@/app/bungie/BungieApi.ts";
import { ArmorSort, WeaponsSort } from "@/app/store/Types.ts";
import { ELLIPSES_HORIZONTAL } from "@/app/utilities/Constants.ts";
import Spinner from "@/app/UI/Spinner.tsx";
const WEAPONS_SORT_OPTIONS = ["By Power", "By Type", "By Type and Power"] as const;
const ARMOR_SORT_OPTIONS = ["By Power", "By Type"] as const;

export default function ContextIosMenu() {
  "use memo";

  const refreshing = useGGStore((state) => state.refreshing);
  const weaponsSort = useGGStore((state) => state.weaponsSort);
  const setWeaponsSort = useGGStore((state) => state.setWeaponsSort);
  const armorSort = useGGStore((state) => state.armorSort);
  const setArmorSort = useGGStore((state) => state.setArmorSort);

  const weaponsSortSelection =
    weaponsSort === WeaponsSort.Power
      ? WEAPONS_SORT_OPTIONS[0]
      : weaponsSort === WeaponsSort.Type
        ? WEAPONS_SORT_OPTIONS[1]
        : WEAPONS_SORT_OPTIONS[2];
  const armorSortSelection = armorSort === ArmorSort.Power ? ARMOR_SORT_OPTIONS[0] : ARMOR_SORT_OPTIONS[1];

  return (
    <View style={styles.wrapper}>
      <Host style={styles.host}>
        <Menu
          label={
            <View style={styles.iconButton}>
              <Image source={ELLIPSES_HORIZONTAL} style={{ width: 24, height: 24 }} />
            </View>
          }
        >
          <Picker
            label="Weapons sort"
            modifiers={[pickerStyle("menu")]}
            selection={weaponsSortSelection}
            onSelectionChange={(selection: string) => {
              if (selection === WEAPONS_SORT_OPTIONS[0]) setWeaponsSort(WeaponsSort.Power);
              else if (selection === WEAPONS_SORT_OPTIONS[1]) setWeaponsSort(WeaponsSort.Type);
              else setWeaponsSort(WeaponsSort.TypeAndPower);
            }}
          >
            {WEAPONS_SORT_OPTIONS.map((opt) => (
              <Text key={opt} modifiers={[tag(opt)]}>
                {opt}
              </Text>
            ))}
          </Picker>
          <Picker
            label="Armor sort"
            modifiers={[pickerStyle("menu")]}
            selection={armorSortSelection}
            onSelectionChange={(selection: string) => {
              if (selection === ARMOR_SORT_OPTIONS[0]) setArmorSort(ArmorSort.Power);
              else setArmorSort(ArmorSort.Type);
            }}
          >
            {ARMOR_SORT_OPTIONS.map((opt) => (
              <Text key={opt} modifiers={[tag(opt)]}>
                {opt}
              </Text>
            ))}
          </Picker>
          <Button
            label="Refresh"
            onPress={() => {
              getFullProfile();
            }}
            modifiers={[buttonStyle("bordered")]}
          />
        </Menu>
      </Host>
      {refreshing && (
        <View style={styles.spinner} pointerEvents="none">
          <Spinner size={70} />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    width: 48,
    height: 48,
    marginRight: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  host: {
    width: 48,
    height: 48,
  },
  iconButton: {
    width: 48,
    height: 48,
    justifyContent: "center",
    alignItems: "center",
  },
  spinner: {
    position: "absolute",
    top: -11,
    right: -11,
  },
});
