import InventoryPage from "@/app/screens/InventoryPage.tsx";
import { useGGStore } from "@/app/store/GGStore.ts";

export default function GeneralPage() {
  const inventoryPageData = useGGStore((state) => state.inventoryPageData);
  return <InventoryPage inventoryPageData={inventoryPageData} />;
}
