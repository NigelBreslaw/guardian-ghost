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

  return (
    <View className="absolute top-0 right-0 w-16 h-16 active:bg-primary/5">
      <DropdownMenu>
        <DropdownMenuTrigger ref={triggerRef} />
        <DropdownMenuContent className="w-64 native:w-72">
          <DropdownMenuLabel>Options</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuGroup>
            <DropdownMenuSub>
              <DropdownMenuSubTrigger>
                <Swords className="text-foreground" size={14} />
                <Text>Weapons sort</Text>
              </DropdownMenuSubTrigger>
              <DropdownMenuSubContent>
                <Animated.View entering={FadeIn.duration(70)}>
                  <DropdownMenuCheckboxItem checked={false} onCheckedChange={() => {}}>
                    <Text>By Power</Text>
                  </DropdownMenuCheckboxItem>
                  <DropdownMenuCheckboxItem checked={true} onCheckedChange={() => {}}>
                    <Text>By Type</Text>
                  </DropdownMenuCheckboxItem>
                  <DropdownMenuCheckboxItem checked={false} onCheckedChange={() => {}}>
                    <Text>By Type and Power</Text>
                  </DropdownMenuCheckboxItem>
                </Animated.View>
              </DropdownMenuSubContent>
            </DropdownMenuSub>
            <DropdownMenuSub>
              <DropdownMenuSubTrigger>
                <Shield className="text-foreground" size={14} />
                <Text>Armor sort</Text>
              </DropdownMenuSubTrigger>
              <DropdownMenuSubContent>
                <Animated.View entering={FadeIn.duration(70)}>
                  <DropdownMenuCheckboxItem checked={true} onCheckedChange={() => {}}>
                    <Text>By Power</Text>
                  </DropdownMenuCheckboxItem>
                  <DropdownMenuCheckboxItem checked={false} onCheckedChange={() => {}}>
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
