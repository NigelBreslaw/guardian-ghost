import { UISection, type UISections } from "@/app/inventory/logic/Helpers.ts";
import EngramsUI from "@/app/inventory/sections/EngramsUI.tsx";
import CharacterEquipmentUI from "@/app/inventory/sections/CharacterEquipmentUI.tsx";
import SeparatorUI from "@/app/inventory/sections/SeparatorUI.tsx";
import VaultFlexUI from "@/app/inventory/sections/VaultFlexUI.tsx";
import LostItemsUI from "@/app/inventory/sections/LostItemsUI.tsx";
import ArtifactUI from "@/app/inventory/sections/ArtifactUI.tsx";
import VaultSpacerUI from "@/app/inventory/sections/VaultSpacerUI.tsx";
import LootItemRow from "@/app/inventory/sections/LootItemRow.tsx";

type Props = {
  readonly item: UISections;
};

export const UiCellRenderItem = ({ item }: Props) => {
  switch (item.type) {
    case UISection.Separator:
      return <SeparatorUI label={item.label} info={item.info} />;
    case UISection.CharacterEquipment:
      return <CharacterEquipmentUI equipSection={item} />;
    case UISection.VaultFlex:
      return <VaultFlexUI iconData={item.inventory} minimumSpacerHeight={item.minimumSpacerHeight} />;
    case UISection.Engrams:
      return <EngramsUI iconData={item.inventory} />;
    case UISection.LostItems:
      return <LostItemsUI iconsData={item.inventory} />;
    case UISection.Artifact:
      return <ArtifactUI iconData={item.equipped} />;
    case UISection.VaultSpacer:
      return <VaultSpacerUI size={item.size} />;
    case UISection.LootIconRow:
      return <LootItemRow iconData={item.inventory} />;
  }
};
