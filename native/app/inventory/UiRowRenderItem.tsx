import { type UISections, UISection } from "@/app/bungie/Common";
import EngramsUI from "@/app/inventory/EngramsUI";
import EquipUI from "@/app/inventory/CharacterEquipmentUI";
import SeparatorUI from "@/app/inventory/SeparatorUI";
import Vault5x5UI from "@/app/inventory/Vault5x5UI";
import VaultFlexUI from "@/app/inventory/VaultFlexUI";
import LostItemsUI from "@/app/inventory/LostItemsUI";
import ArtifactUI from "@/app/inventory/ArtifactUI.tsx";
import VaultSpacerUI from "@/app/inventory/VaultSpacerUI.tsx";

export const UiCellRenderItem = ({ item }: { item: UISections }) => {
  switch (item.type) {
    case UISection.Separator:
      return <SeparatorUI label={item.label} />;
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
