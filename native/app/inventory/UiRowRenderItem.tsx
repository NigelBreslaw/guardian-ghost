import EngramsUI from "@/app/inventory/sections/EngramsUI.tsx";
import EquipUI from "@/app/inventory/sections/CharacterEquipmentUI.tsx";
import SeparatorUI from "@/app/inventory/sections/SeparatorUI.tsx";
import Vault5x5UI from "@/app/inventory/sections/Vault5x5UI.tsx";
import VaultFlexUI from "@/app/inventory/sections/VaultFlexUI.tsx";
import LostItemsUI from "@/app/inventory/sections/LostItemsUI.tsx";
import ArtifactUI from "@/app/inventory/sections/ArtifactUI.tsx";
import VaultSpacerUI from "@/app/inventory/sections/VaultSpacerUI.tsx";
import { UISection, type UISections } from "@/app/inventory/logic/Helpers.ts";

export const UiCellRenderItem = ({ item }: { item: UISections }) => {
  switch (item.type) {
    case UISection.Separator:
      return <SeparatorUI label={item.label} info={item.info} />;
    case UISection.CharacterEquipment:
      return <EquipUI data={item} />;
    case UISection.Vault5x5:
      return <Vault5x5UI data={item.inventory} />;
    case UISection.VaultFlex:
      return <VaultFlexUI data={item.inventory} minimumSpacerHeight={item.minimumSpacerHeight} />;
    case UISection.Engrams:
      return <EngramsUI data={item.inventory} />;
    case UISection.LostItems:
      return <LostItemsUI data={item.inventory} />;
    case UISection.Artifact:
      return <ArtifactUI equipped={item.equipped} />;
    case UISection.VaultSpacer:
      return <VaultSpacerUI size={item.size} />;
  }
};
