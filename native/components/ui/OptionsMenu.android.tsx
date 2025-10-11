import { View, StyleSheet } from "react-native";
import { Image } from "expo-image";
import { ContextMenu, Button } from "@expo/ui/jetpack-compose";
import { useGGStore } from "@/app/store/GGStore.ts";
import { getFullProfile } from "@/app/bungie/BungieApi.ts";
import { ArmorSort, WeaponsSort } from "@/app/store/Types.ts";
import { ELLIPSES_HORIZONTAL } from "@/app/utilities/Constants.ts";
import Spinner from "@/app/UI/Spinner.tsx";

export default function OptionsMenu() {
  "use memo";

  const refreshing = useGGStore((state) => state.refreshing);
  const weaponsSort = useGGStore((state) => state.weaponsSort);
  const setWeaponsSort = useGGStore((state) => state.setWeaponsSort);
  const armorSort = useGGStore((state) => state.armorSort);
  const setArmorSort = useGGStore((state) => state.setArmorSort);

  return (
    <ContextMenu>
      <ContextMenu.Trigger>
        {/* <View style={[styles.iconButton, { marginRight: 8 }]}>
          {refreshing && (
            <View style={styles.spinner}>
              <Spinner size={70} />
            </View>
          )}
          <Image 
            source={ELLIPSES_HORIZONTAL} 
            style={{ width: 24, height: 24 }}
          />
        </View> */}
        <Button variant="bordered">...</Button>
      </ContextMenu.Trigger>
      <ContextMenu.Items>
        <Button onPress={() => setWeaponsSort(WeaponsSort.Power)} color="#FFFFFF">
          {`Weapons: By Power${weaponsSort === WeaponsSort.Power ? " ✓" : ""}`}
        </Button>
        <Button onPress={() => setWeaponsSort(WeaponsSort.Type)} color="#FFFFFF">
          {`Weapons: By Type${weaponsSort === WeaponsSort.Type ? " ✓" : ""}`}
        </Button>
        <Button onPress={() => setWeaponsSort(WeaponsSort.TypeAndPower)} color="#FFFFFF">
          {`Weapons: By Type and Power${weaponsSort === WeaponsSort.TypeAndPower ? " ✓" : ""}`}
        </Button>
        <Button onPress={() => setArmorSort(ArmorSort.Power)} color="#FFFFFF">
          {`Armor: By Power${armorSort === ArmorSort.Power ? " ✓" : ""}`}
        </Button>
        <Button onPress={() => setArmorSort(ArmorSort.Type)} color="#FFFFFF">
          {`Armor: By Type${armorSort === ArmorSort.Type ? " ✓" : ""}`}
        </Button>
        <Button
          onPress={() => {
            getFullProfile();
          }}
          color="#FFFFFF"
        >
          Refresh
        </Button>
      </ContextMenu.Items>
    </ContextMenu>
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
