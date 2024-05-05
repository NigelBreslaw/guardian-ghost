import { InventoryPageEnums } from "@/app/inventory/logic/Helpers.ts";
import InventoryPage from "@/app/inventory/pages/InventoryPage.tsx";

export default function ArmorPage() {
  return <InventoryPage inventoryPages={InventoryPageEnums.Armor} />;
}
