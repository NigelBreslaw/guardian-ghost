import BlankCell from "@/app/inventory/BlankCell.tsx";
import { type UiCell, UiCellType } from "@/app/inventory/Common.ts";
import EmptyCell from "@/app/inventory/EmptyCell.tsx";
import EquipSection from "@/app/inventory/EquipSection.tsx";
import SeparatorRow from "@/app/inventory/SeparatorRow";
import Vault5x5Cell from "@/app/inventory/VaultSection5x5.tsx";
import VaultSectionFlex from "@/app/inventory/VaultSectionFlex.tsx";

export const UiCellRenderItem = ({ item }: { item: UiCell }) => {
  switch (item.type) {
    case UiCellType.Separator:
      return <SeparatorRow />;
    case UiCellType.EmptyCell:
      return <EmptyCell />;
    case UiCellType.BlankCell:
      return <BlankCell />;
    case UiCellType.DestinyCell:
      return <BlankCell />;
    case UiCellType.EquipSectionCell:
      return <EquipSection data={item} />;
    case UiCellType.Vault5x5Cell:
      return <Vault5x5Cell data={item.inventory} />;
    case UiCellType.VaultFlexCell:
      return <VaultSectionFlex data={item.inventory} />;
  }
};
