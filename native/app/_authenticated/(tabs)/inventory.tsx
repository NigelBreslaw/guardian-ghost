import { InventoryPageEnums } from "@/app/inventory/logic/Helpers.ts";
import InventoryPage from "@/app/inventory/pages/InventoryPage.tsx";

export default function InventoryPageRoute() {
  "use memo";
  return <InventoryPage inventoryPageEnum={InventoryPageEnums.General} />;
}

