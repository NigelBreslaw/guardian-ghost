import InventoryPage from "@/app/screens/InventoryPage.tsx";
import { InventoryPageEnums } from "@/app/bungie/Common";

export default function GeneralPage() {
  return <InventoryPage inventoryPages={InventoryPageEnums.General} />;
}
