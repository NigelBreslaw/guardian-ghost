import { UISection, type UISections } from "@/app/inventory/logic/Helpers.ts";
import EngramsUI from "@/app/inventory/sections/EngramsUI.tsx";
import CharacterEquipmentUI from "@/app/inventory/sections/CharacterEquipmentUI.tsx";
import SeparatorUI from "@/app/inventory/sections/SeparatorUI.tsx";
import LostItemsUI from "@/app/inventory/sections/LostItemsUI.tsx";
import ArtifactUI from "@/app/inventory/sections/ArtifactUI.tsx";
import VaultSpacerUI from "@/app/inventory/sections/VaultSpacerUI.tsx";
import LootItemRow from "@/app/inventory/sections/LootItemRow.tsx";
import GuardianDetails from "@/app/inventory/sections/GuardianDetails.tsx";

type Props = {
  readonly item: UISections;
};

export const UiCellRenderItem = ({ item }: Props) => {
  switch (item.type) {
    case UISection.Separator:
      return <SeparatorUI label={item.label} />;
    case UISection.CharacterEquipment:
      return <CharacterEquipmentUI equipSection={item} />;
    case UISection.Engrams:
      return <EngramsUI items={item.inventory} />;
    case UISection.LostItems:
      return <LostItemsUI items={item.inventory} />;
    case UISection.Artifact:
      return <ArtifactUI item={item.equipped} />;
    case UISection.VaultSpacer:
      return <VaultSpacerUI size={item.size} />;
    case UISection.LootRow:
      return <LootItemRow items={item.inventory} />;
    case UISection.GuardianDetails:
      return <GuardianDetails characterIndex={item.characterIndex} />;
  }
};
