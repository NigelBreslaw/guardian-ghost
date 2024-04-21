import InventoryPage from "@/app/screens/InventoryPage.tsx";
import { InventoryPageEnums } from "@/app/inventory/Common.ts";

export default function GeneralPage() {
  return <InventoryPage inventoryPages={InventoryPageEnums.General} />;
}
