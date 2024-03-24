import InventoryPage from "@/app/screens/InventoryPage.tsx";
import { useGGStore } from "@/app/store/GGStore.ts";

export default function WeaponsPage() {
  const weaponsPageData = useGGStore((state) => state.weaponsPageData);
  return <InventoryPage inventoryPageData={weaponsPageData} />;
}
