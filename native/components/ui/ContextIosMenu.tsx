import { View, StyleSheet } from "react-native";
import { Image } from "expo-image";
import { Host, ContextMenu, Button, Picker } from "@expo/ui/swift-ui";
import { useGGStore } from "@/app/store/GGStore.ts";
import { getFullProfile } from "@/app/bungie/BungieApi.ts";
import { ArmorSort, WeaponsSort } from "@/app/store/Types.ts";
import { ELLIPSES_HORIZONTAL } from "@/app/utilities/Constants.ts";
import Spinner from "@/app/UI/Spinner.tsx";

export default function ContextIosMenu() {
  "use memo";

  const refreshing = useGGStore((state) => state.refreshing);
  const weaponsSort = useGGStore((state) => state.weaponsSort);
  const setWeaponsSort = useGGStore((state) => state.setWeaponsSort);
  const armorSort = useGGStore((state) => state.armorSort);
  const setArmorSort = useGGStore((state) => state.setArmorSort);

  const weaponsSortOptions = ["By Power", "By Type", "By Type and Power"];
  const weaponsSortIndex = weaponsSort === WeaponsSort.Power ? 0 : weaponsSort === WeaponsSort.Type ? 1 : 2;

  const armorSortOptions = ["By Power", "By Type"];
  const armorSortIndex = armorSort === ArmorSort.Power ? 0 : 1;

  return (
    <Host style={{ width: 48, height: 48, marginRight: 8 }}>
      <ContextMenu>
        <ContextMenu.Items>
          <Picker
            label="Weapons sort"
            options={weaponsSortOptions}
            variant="menu"
            selectedIndex={weaponsSortIndex}
            onOptionSelected={({ nativeEvent: { index } }) => {
              if (index === 0) setWeaponsSort(WeaponsSort.Power);
              else if (index === 1) setWeaponsSort(WeaponsSort.Type);
              else setWeaponsSort(WeaponsSort.TypeAndPower);
            }}
          />
          <Picker
            label="Armor sort"
            options={armorSortOptions}
            variant="menu"
            selectedIndex={armorSortIndex}
            onOptionSelected={({ nativeEvent: { index } }) => {
              if (index === 0) setArmorSort(ArmorSort.Power);
              else setArmorSort(ArmorSort.Type);
            }}
          />
          <Button
            variant="bordered"
            onPress={() => {
              getFullProfile();
            }}
          >
            Refresh
          </Button>
        </ContextMenu.Items>
        <ContextMenu.Trigger>
          <View style={styles.iconButton}>
            {refreshing && (
              <View style={styles.spinner}>
                <Spinner size={70} />
              </View>
            )}
            <Image source={ELLIPSES_HORIZONTAL} style={{ width: 24, height: 24 }} />
          </View>
        </ContextMenu.Trigger>
      </ContextMenu>
    </Host>
  );
}

const styles = StyleSheet.create({
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
