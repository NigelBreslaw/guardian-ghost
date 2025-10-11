import { View } from "react-native";
import { ContextMenu, Button } from "@expo/ui/jetpack-compose";
import { useGGStore } from "@/app/store/GGStore.ts";
import { getFullProfile } from "@/app/bungie/BungieApi.ts";
import { ArmorSort, WeaponsSort } from "@/app/store/Types.ts";

export default function OptionsMenu() {
  "use memo";

  const weaponsSort = useGGStore((state) => state.weaponsSort);
  const setWeaponsSort = useGGStore((state) => state.setWeaponsSort);
  const armorSort = useGGStore((state) => state.armorSort);
  const setArmorSort = useGGStore((state) => state.setArmorSort);

  return (
    <View className="absolute top-0 right-0 w-16 h-16 active:bg-primary/5">
      <View style={{ position: 'absolute', width: 64, height: 64 }}>
        <ContextMenu>
          <ContextMenu.Items>
            <Button
              variant="default"
              onPress={() => setWeaponsSort(WeaponsSort.Power)}
            >
              {`Weapons: By Power${weaponsSort === WeaponsSort.Power ? " ✓" : ""}`}
            </Button>
            <Button
              variant="default"
              onPress={() => setWeaponsSort(WeaponsSort.Type)}
            >
              {`Weapons: By Type${weaponsSort === WeaponsSort.Type ? " ✓" : ""}`}
            </Button>
            <Button
              variant="default"
              onPress={() => setWeaponsSort(WeaponsSort.TypeAndPower)}
            >
              {`Weapons: By Type and Power${weaponsSort === WeaponsSort.TypeAndPower ? " ✓" : ""}`}
            </Button>
            <Button
              variant="default"
              onPress={() => setArmorSort(ArmorSort.Power)}
            >
              {`Armor: By Power${armorSort === ArmorSort.Power ? " ✓" : ""}`}
            </Button>
            <Button
              variant="default"
              onPress={() => setArmorSort(ArmorSort.Type)}
            >
              {`Armor: By Type${armorSort === ArmorSort.Type ? " ✓" : ""}`}
            </Button>
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
      </View>
    </View>
  );
}

