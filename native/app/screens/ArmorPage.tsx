import { InventoryPageEnums } from "@/app/bungie/Common";
import InventoryPage from "@/app/screens/InventoryPage.tsx";

export default function ArmorPage() {
  return <InventoryPage inventoryPages={InventoryPageEnums.Armor} />;
}
