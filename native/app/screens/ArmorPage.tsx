import { InventoryPageEnums } from "@/app/inventory/Common.ts";
import InventoryPage from "@/app/screens/InventoryPage.tsx";

export default function ArmorPage() {
  return <InventoryPage inventoryPages={InventoryPageEnums.Armor} />;
}
