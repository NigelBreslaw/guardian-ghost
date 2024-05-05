import InventoryPage from "@/app/inventory/pages/InventoryPage.tsx";
import { InventoryPageEnums } from "@/app/bungie/Common.ts";

export default function GeneralPage() {
  return <InventoryPage inventoryPages={InventoryPageEnums.General} />;
}
