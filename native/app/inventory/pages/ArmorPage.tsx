import { InventoryPageEnums } from "@/app/inventory/logic/Helpers.ts";
import InventoryPage from "@/app/inventory/pages/InventoryPage.tsx";

export default function ArmorPage() {
  "use memo";
  return (
    <InventoryPage inventoryPages={InventoryPageEnums.Armor} pageEstimatedFlashListItemSize={[150, 150, 150, 92]} />
  );
}
