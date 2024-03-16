import BlankCell from "@/app/inventory/BlankCell.tsx";
import { type UiCell, UiCellType } from "@/app/inventory/Common.ts";
import DestinyCell from "@/app/inventory/DestinyCell.tsx";
import EmptyCell from "@/app/inventory/EmptyCell.tsx";
import SeparatorCell from "@/app/inventory/SeparatorCell.tsx";
import { TouchableOpacity } from "react-native";

export const UiCellRenderItem = (
  { item }: { item: UiCell },
  handlePress: (itemInstanceId: string, itemHash: number) => void,
) => {
  return (
    <TouchableOpacity
      onPress={() => {
        if (item.itemInstanceId && item.itemHash) {
          handlePress(item.itemInstanceId, item.itemHash);
        }
      }}
    >
      {(() => {
        switch (item.type) {
          case UiCellType.Separator:
            return <SeparatorCell />;
          case UiCellType.EmptyCell:
            return <EmptyCell />;
          case UiCellType.BlankCell:
            return <BlankCell />;
          case UiCellType.DestinyCell:
            return (
              <DestinyCell
                iconUri={item.icon}
                primaryStat={item.primaryStat}
                calculatedWaterMark={item.calculatedWaterMark}
                damageTypeIconUri={item.damageTypeIconUri}
              />
            );
        }
      })()}
    </TouchableOpacity>
  );
};
