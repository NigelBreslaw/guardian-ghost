import { InventoryPageEnums } from "@/app/inventory/logic/Helpers.ts";
import InventoryPage from "@/app/inventory/pages/InventoryPage.tsx";

export default function WeaponsPage() {
  "use memo";
  return (
    <InventoryPage inventoryPages={InventoryPageEnums.Weapons} pageEstimatedFlashListItemSize={[150, 150, 150, 82]} />
  );
}
