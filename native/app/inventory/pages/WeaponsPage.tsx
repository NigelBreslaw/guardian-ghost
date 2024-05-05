import { InventoryPageEnums } from "@/app/bungie/Common.ts";
import InventoryPage from "@/app/inventory/pages/InventoryPage.tsx";

export default function WeaponsPage() {
  return <InventoryPage inventoryPages={InventoryPageEnums.Weapons} />;
}
