import InventoryPage from "@/app/screens/InventoryPage.tsx";
import { useGGStore } from "@/app/store/GGStore.ts";

export default function ArmorPage() {
  const armorPageData = useGGStore((state) => state.armorPageData);
  return <InventoryPage inventoryPageData={armorPageData} />;
}
