import InventoryPage from "@/app/screens/InventoryPage.tsx";
import { useGGStore } from "@/app/store/GGStore.ts";

export default function GeneralPage() {
  const generalPageData = useGGStore((state) => state.generalPageData);
  return <InventoryPage inventoryPageData={generalPageData} />;
}
