export type TransferItem = {
  itemInstanceId: string | undefined;
  itemHash: number;
  currentCharacterId: string;
  currentlyEquipped: boolean;
  finalTargetId: string;
  inventorySection: number;
  quantity: number;
  equipOnTarget: boolean;
};
