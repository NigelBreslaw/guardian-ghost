import { InventoryPageEnums } from "@/app/bungie/Common.ts";
import InventoryPage from "@/app/inventory/pages/InventoryPage.tsx";

export default function ArmorPage() {
  return <InventoryPage inventoryPages={InventoryPageEnums.Armor} />;
}
