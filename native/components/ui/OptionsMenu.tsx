import { View } from "react-native";
import { useEffect, useRef } from "react";

import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuGroup,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
  DropdownMenuCheckboxItem,
} from "@/components/ui/dropdown-menu.tsx";
import { Text } from "@/components/ui/text.tsx";
import { Shield } from "@/lib/icons/Shield.tsx";
import { Swords } from "@/lib/icons/Swords.tsx";
import { RefreshCcw } from "@/lib/icons/Refresh-ccw.tsx";
import Animated, { FadeIn } from "react-native-reanimated";
import { useGGStore } from "@/app/store/GGStore.ts";
import { getFullProfile } from "@/app/bungie/BungieApi.ts";
import { ArmorSort, WeaponsSort } from "@/app/store/Types.ts";

export default function OptionsMenu() {
  "use memo";
  const triggerRef = useRef<React.ElementRef<typeof DropdownMenuTrigger>>(null);
  const activateInventoryMenu = useGGStore((state) => state.activateInventoryMenu);
  useEffect(() => {
    if (activateInventoryMenu) {
      triggerRef.current?.open();
      useGGStore.getState().showInventoryMenu(false);
    }
  }, [activateInventoryMenu]);

  const weaponsSort = useGGStore((state) => state.weaponsSort);
  const setWeaponsSort = useGGStore((state) => state.setWeaponsSort);
  const armorSort = useGGStore((state) => state.armorSort);
  const setArmorSort = useGGStore((state) => state.setArmorSort);

  const weaponsSubmenuOpen = useGGStore((state) => state.weaponsSortSubmenuOpen);
  const setWeaponsSubmenuOpen = useGGStore((state) => state.setWeaponsSubmenuOpen);
  const armorSubmenuOpen = useGGStore((state) => state.armorSortSubmenuOpen);
  const setArmorSubmenuOpen = useGGStore((state) => state.setArmorSubmenuOpen);

  return (
    <View className="absolute top-0 right-0 w-16 h-16 active:bg-primary/5">
      <DropdownMenu>
        <DropdownMenuTrigger ref={triggerRef} />
        <DropdownMenuContent className="w-64 native:w-72">
          <DropdownMenuLabel>Options</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuGroup>
            <DropdownMenuSub open={weaponsSubmenuOpen} onOpenChange={setWeaponsSubmenuOpen}>
              <DropdownMenuSubTrigger>
                <Swords className="text-foreground" size={14} />
                <Text>Weapons sort</Text>
              </DropdownMenuSubTrigger>
              <DropdownMenuSubContent>
                <Animated.View entering={FadeIn.duration(70)}>
                  <DropdownMenuCheckboxItem
                    checked={weaponsSort === WeaponsSort.Power}
                    onCheckedChange={() => setWeaponsSort(WeaponsSort.Power)}
                  >
                    <Text>By Power</Text>
                  </DropdownMenuCheckboxItem>
                  <DropdownMenuCheckboxItem
                    checked={weaponsSort === WeaponsSort.Type}
                    onCheckedChange={() => setWeaponsSort(WeaponsSort.Type)}
                  >
                    <Text>By Type</Text>
                  </DropdownMenuCheckboxItem>
                  <DropdownMenuCheckboxItem
                    checked={weaponsSort === WeaponsSort.TypeAndPower}
                    onCheckedChange={() => setWeaponsSort(WeaponsSort.TypeAndPower)}
                  >
                    <Text>By Type and Power</Text>
                  </DropdownMenuCheckboxItem>
                </Animated.View>
              </DropdownMenuSubContent>
            </DropdownMenuSub>
            <DropdownMenuSub open={armorSubmenuOpen} onOpenChange={setArmorSubmenuOpen}>
              <DropdownMenuSubTrigger>
                <Shield className="text-foreground" size={14} />
                <Text>Armor sort</Text>
              </DropdownMenuSubTrigger>
              <DropdownMenuSubContent>
                <Animated.View entering={FadeIn.duration(70)}>
                  <DropdownMenuCheckboxItem
                    checked={armorSort === ArmorSort.Power}
                    onCheckedChange={() => setArmorSort(ArmorSort.Power)}
                  >
                    <Text>By Power</Text>
                  </DropdownMenuCheckboxItem>
                  <DropdownMenuCheckboxItem
                    checked={armorSort === ArmorSort.Type}
                    onCheckedChange={() => setArmorSort(ArmorSort.Type)}
                  >
                    <Text>By Type</Text>
                  </DropdownMenuCheckboxItem>
                </Animated.View>
              </DropdownMenuSubContent>
            </DropdownMenuSub>
          </DropdownMenuGroup>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onPress={() => {
              getFullProfile();
            }}
          >
            <RefreshCcw className="text-foreground" size={14} />
            <Text>Refresh</Text>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </View>
  );
}
