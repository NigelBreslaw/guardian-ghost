import { View } from "react-native";
import { Host, ContextMenu, Button, Picker } from "@expo/ui/swift-ui";
import { useGGStore } from "@/app/store/GGStore.ts";
import { getFullProfile } from "@/app/bungie/BungieApi.ts";
import { ArmorSort, WeaponsSort } from "@/app/store/Types.ts";

export default function OptionsMenu() {
  "use memo";

  const weaponsSort = useGGStore((state) => state.weaponsSort);
  const setWeaponsSort = useGGStore((state) => state.setWeaponsSort);
  const armorSort = useGGStore((state) => state.armorSort);
  const setArmorSort = useGGStore((state) => state.setArmorSort);

  const weaponsSortOptions = ["By Power", "By Type", "By Type and Power"];
  const weaponsSortIndex = weaponsSort === WeaponsSort.Power ? 0 : weaponsSort === WeaponsSort.Type ? 1 : 2;

  const armorSortOptions = ["By Power", "By Type"];
  const armorSortIndex = armorSort === ArmorSort.Power ? 0 : 1;

  return (
    <View className="absolute top-0 right-0 w-16 h-16 active:bg-primary/5">
      <Host style={{ position: 'absolute', width: 64, height: 64 }}>
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
            <Button variant="bordered">
              ⋯
            </Button>
          </ContextMenu.Trigger>
        </ContextMenu>
      </Host>
    </View>
  );
}

