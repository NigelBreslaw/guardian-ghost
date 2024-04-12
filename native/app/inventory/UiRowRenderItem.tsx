import { type UISections, UISection } from "@/app/inventory/Common.ts";
import EngramsSection from "@/app/inventory/EngramsSection.tsx";
import EquipSection from "@/app/inventory/EquipSection.tsx";
import SeparatorRow from "@/app/inventory/SeparatorRow";
import Vault5x5Cell from "@/app/inventory/VaultSection5x5.tsx";
import VaultSectionFlex from "@/app/inventory/VaultSectionFlex.tsx";

export const UiCellRenderItem = ({ item }: { item: UISections }) => {
  switch (item.type) {
    case UISection.Separator:
      return <SeparatorRow />;
    case UISection.CharacterEquipment:
      return <EquipSection data={item} />;
    case UISection.Vault5x5:
      return <Vault5x5Cell data={item.inventory} />;
    case UISection.VaultFlex:
      return <VaultSectionFlex data={item.inventory} />;
    case UISection.Engrams:
      return <EngramsSection data={item.inventory} />;
  }
};
