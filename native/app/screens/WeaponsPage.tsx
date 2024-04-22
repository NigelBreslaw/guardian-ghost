import { InventoryPageEnums } from "@/app/bungie/Common";
import InventoryPage from "@/app/screens/InventoryPage.tsx";

export default function WeaponsPage() {
  return <InventoryPage inventoryPages={InventoryPageEnums.Weapons} />;
}
