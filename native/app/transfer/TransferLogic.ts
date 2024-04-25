import { TierType, type DestinyItem } from "@/app/bungie/Types.ts";
import {
  SectionBuckets,
  armorBuckets,
  basePath,
  sectionSupportsBlockingExotic,
  weaponBuckets,
  DestinyClass,
  ItemType,
} from "@/app/bungie/Common";
import { itemsDefinition } from "@/app/store/Definitions.ts";
import { useGGStore } from "@/app/store/GGStore.ts";
import { GLOBAL_INVENTORY_NAMES, VAULT_CHARACTER_ID } from "@/app/utilities/Constants.ts";
import { bitmaskContains } from "@/app/utilities/Helpers.ts";
import { apiKey } from "@/constants/env.ts";
import { number, object, optional, safeParse, string } from "valibot";

const DEBUG_TRANSFER = false;

const responseSchema = object({
  ErrorCode: number(),
  ErrorStatus: string(),
  Message: string(),
  MessageData: object({}),
  Response: number(),
  ThrottleSeconds: optional(number()),
});

export type TransferBundle = {
  // The main item to be transferred
  primaryItem: TransferItem;
  // Other items that first need transferring e.g. unquip items
  unequipItem: TransferItem | null;
  // Track failed transfers to see if the transfer should be retried.
  fails: number;
  // Changed to true when all transfers have been completed
  completed: boolean;
};

export type TransferItem = {
  destinyItem: DestinyItem;
  finalTargetId: string;
  quantityToMove: number;
  equipOnTarget: boolean;
};

function createTransferBundle(
  toCharacterId: string,
  destinyItem: DestinyItem,
  quantityToMove = 1,
  equipOnTarget = false,
): TransferBundle {
  return {
    primaryItem: {
      destinyItem,
      finalTargetId: toCharacterId,
      quantityToMove,
      equipOnTarget,
    },
    unequipItem: null,
    fails: 0,
    completed: false,
  };
}

export function startTransfer(
  toCharacterId: string,
  destinyItem: DestinyItem,
  quantityToMove = 1,
  equipOnTarget = false,
) {
  const transferBundle = createTransferBundle(toCharacterId, destinyItem, quantityToMove, equipOnTarget);
  processTransfer(transferBundle);
}

function showTransferSuccess(transferBundle: TransferBundle) {
  const itemDefinition = itemsDefinition[transferBundle.primaryItem.destinyItem.itemHash];
  const successMessage = `${itemDefinition?.n} has been transferred${
    transferBundle.primaryItem.equipOnTarget ? " and equipped." : "."
  }`;
  console.info(successMessage);
  useGGStore.getState().showSnackBar(successMessage);
}

export async function processTransfer(transferBundle: TransferBundle) {
  if (DEBUG_TRANSFER) {
    console.log("processTransferItem()", transferBundle);
  }

  // Reset the auto refresh timer to ensure auto refresh doesn't happen mid transfer and confuse the system.
  useGGStore.getState().setLastRefreshTime();

  // Is transfer complete?
  const checkedPackage = hasSuccessfullyTransferred(transferBundle);
  if (checkedPackage.completed) {
    showTransferSuccess(transferBundle);
    return;
  }

  let transferItem: TransferItem;

  // Is there other items to transfer first?
  if (transferBundle.unequipItem) {
    transferItem = transferBundle.unequipItem;
  } else {
    transferItem = transferBundle.primaryItem;
  }

  // Is the item currently in lost items?
  if (transferItem.destinyItem.bucketHash === SectionBuckets.LostItem) {
    lostItemLogic(transferBundle, transferItem);
    return;
  }

  const reachedTarget = hasReachedTarget(transferItem);
  if (reachedTarget) {
    // This is only possible if the item needs to equipped
    equipItemLogic(transferBundle, transferItem);
  } else {
    if (transferItem.destinyItem.equipped) {
      unequipItemLogic(transferBundle, transferItem);
    } else {
      // Move the item
      moveItemLogic(transferBundle, transferItem);
    }
  }
}

async function lostItemLogic(transferBundle: TransferBundle, transferItem: TransferItem) {
  const result = await pullFromPostmaster(transferItem);
  const parsedResult = safeParse(responseSchema, result[0]);
  if (parsedResult.success) {
    if (parsedResult.output.ErrorStatus === "Success") {
      // Update the UI and get a transformed item to continue the transfer
      const transformedItem = useGGStore.getState().pullFromPostmaster(result[1], transferItem.quantityToMove);
      // spread transformedItem into transferItem.destinyItem
      transferItem.destinyItem = { ...transformedItem };
      // Send the item on its way
      processTransfer(transferBundle);
      return;
    }

    console.log("Failed 2", parsedResult.output);
    useGGStore.getState().showSnackBar(`Failed to transfer item ${parsedResult.output.Message} `);
    return;
  }
  useGGStore.getState().showSnackBar("Failed to transfer item from the postmaster %^");
}

async function moveItemLogic(transferBundle: TransferBundle, transferItem: TransferItem) {
  try {
    const result = await moveItem(transferItem);
    const parsedResult = safeParse(responseSchema, result[0]);

    if (parsedResult.success) {
      if (parsedResult.output.ErrorStatus === "Success") {
        transferItem.destinyItem = { ...result[1] };
        processTransfer(transferBundle);
        useGGStore.getState().moveItem(result[1], transferItem.quantityToMove);
        return;
      }
      console.error("Failed 3", parsedResult.output);
      useGGStore.getState().showSnackBar(`Failed to transfer item ${parsedResult.output.Message} `);
      return;
    }
    console.error("Failed to parse response", result[0]);
    useGGStore.getState().showSnackBar("Failed to move item and Failed to parse response");
  } catch (e) {
    console.error("Failed to move item", e);
    useGGStore.getState().showSnackBar("Failed to move item");
  }
}

async function equipItemLogic(transferBundle: TransferBundle, transferItem: TransferItem) {
  const blockingExotic = hasBlockingExotic(transferItem.destinyItem);

  if (blockingExotic) {
    // is there an unequip item for the other exotic?
    const itemToUnequip = returnBlockingExotic(transferItem.destinyItem);
    if (itemToUnequip) {
      const sectionItems =
        useGGStore.getState().guardians[itemToUnequip.characterId]?.items[itemToUnequip.bucketHash]?.inventory;

      if (sectionItems && sectionItems.length > 0) {
        const unequipItem = getUnequipItem(sectionItems, false);
        if (unequipItem) {
          const name = itemsDefinition[unequipItem.itemHash]?.n;
          console.log("unequipItem", name);
          // create a transferItem for it and set it on the transferBundle otherItem
          const unequipTransferItem: TransferItem = {
            destinyItem: unequipItem,
            finalTargetId: transferItem.destinyItem.characterId,
            quantityToMove: 1,
            equipOnTarget: true,
          };
          transferBundle.unequipItem = unequipTransferItem;
          processTransfer(transferBundle);
          return;
        }
      }
    }
    console.error("Cannot equip more than one exotic");
    useGGStore.getState().showSnackBar("Cannot equip more than one exotic");
  }

  try {
    if (DEBUG_TRANSFER) {
      console.log("equipItem");
    }

    // Is the item to be equipped an exotic? If its a secondary item can it be equipped
    // here without having to unequip another exotic? If so equip it. Otherwise fail
    const result = await equipItem(transferItem);
    const parsedResult = safeParse(responseSchema, result[0]);
    if (parsedResult.success) {
      if (parsedResult.output.ErrorStatus === "Success") {
        transferItem.destinyItem = { ...result[1] };
        // If the bundle has an unequipItem then check if the primary would have been replaced by it. If so mark the primary destinyItem as equipped: false
        useGGStore.getState().equipItem(result[1]);
        // TODO: Investigate why this needs to be copied as otherwise the bundle is not mutated.
        // I'm not understanding something to do with accessing objects by reference.
        const transferBundleCopy = JSON.parse(JSON.stringify(transferBundle)) as TransferBundle;
        if (transferBundleCopy.unequipItem) {
          const primaryItem = transferBundle.primaryItem.destinyItem;
          const unequipItem = transferBundleCopy.unequipItem.destinyItem;
          if (
            primaryItem.equipped &&
            primaryItem.characterId === unequipItem.characterId &&
            primaryItem.bucketHash === unequipItem.bucketHash
          ) {
            transferBundleCopy.primaryItem.destinyItem.equipped = false;
          }
        }
        processTransfer(transferBundleCopy);

        return;
      }
      console.error("Failed 1", parsedResult.output);
      useGGStore.getState().showSnackBar(`Failed to equip item ${parsedResult.output.Message} `);
      return;
    }
    console.error("Failed to equip item and failed to parse response");
    useGGStore.getState().showSnackBar("Failed to equip item");
  } catch (e) {
    console.error("Failed to equip item", e);
    useGGStore.getState().showSnackBar("Failed to equip item");
  }
}

function returnBlockingExotic(destinyItem: DestinyItem): DestinyItem | null {
  let searchBuckets: SectionBuckets[];

  if (destinyItem.itemType === ItemType.Armor) {
    searchBuckets = armorBuckets;
  } else if (destinyItem.itemType === ItemType.Weapon) {
    searchBuckets = weaponBuckets;
  } else {
    console.error("returnBlockingExotic: Unknown item type");
    return null;
  }

  const characterId = destinyItem.characterId;
  const guardiansItems = useGGStore.getState().guardians[characterId]?.items;

  if (!guardiansItems) {
    return null;
  }

  for (const bucket of searchBuckets) {
    const equippedItem = guardiansItems[bucket]?.equipped;
    if (equippedItem && equippedItem?.tierType === TierType.Exotic) {
      return equippedItem;
    }
  }

  return null;
}

function getUnequipItem(sectionItems: DestinyItem[], allowExotics = false): DestinyItem | null {
  let unequipItem: DestinyItem | null = null;
  for (const item of sectionItems) {
    if (sectionSupportsBlockingExotic.includes(item.bucketHash) && !allowExotics) {
      if (item.tierType !== TierType.Exotic) {
        unequipItem = item;
        break;
      }
    } else {
      unequipItem = item;
      break;
    }
  }
  return unequipItem;
}

function unequipItemLogic(transferBundle: TransferBundle, transferItem: TransferItem) {
  try {
    // Bail if the section has no items
    const sectionItems =
      useGGStore.getState().guardians[transferItem.destinyItem.characterId]?.items[transferItem.destinyItem.bucketHash]
        ?.inventory;
    if (!sectionItems || sectionItems.length === 0) {
      console.error("Failed to unquip item as section has no items");
      const name = itemsDefinition[transferItem.destinyItem.itemHash]?.n;
      useGGStore
        .getState()
        .showSnackBar(`Unable to unequip ${name}. There needs to be another item that can be equipped.`);
      return;
    }
    // is there an item that isn't Exotic in the section items? Find the first one
    let unequipItem: DestinyItem | null = null;
    unequipItem = getUnequipItem(sectionItems, false);

    if (unequipItem) {
      const name = itemsDefinition[unequipItem.itemHash]?.n;
      console.log("unequipItem", name);
      // create a transferItem for it and set it on the transferBundle otherItem
      const unequipTransferItem: TransferItem = {
        destinyItem: unequipItem,
        finalTargetId: transferItem.destinyItem.characterId,
        quantityToMove: 1,
        equipOnTarget: true,
      };
      transferBundle.unequipItem = unequipTransferItem;
      processTransfer(transferBundle);
      return;
    }

    unequipItem = getUnequipItem(sectionItems, true);
    // Can an exotic be equipped? If the currently equipped item is an exotic there is no issue
    const currentEquippedItem =
      useGGStore.getState().guardians[transferItem.destinyItem.characterId]?.items[transferItem.destinyItem.bucketHash]
        ?.equipped;

    if (currentEquippedItem?.tierType === TierType.Exotic && unequipItem) {
      const name = itemsDefinition[unequipItem.itemHash]?.n;
      console.log("unequipItem", name);
      // create a transferItem for it and set it on the transferBundle otherItem
      const unequipTransferItem: TransferItem = {
        destinyItem: unequipItem,
        finalTargetId: transferItem.destinyItem.characterId,
        quantityToMove: 1,
        equipOnTarget: true,
      };
      transferBundle.unequipItem = unequipTransferItem;
      processTransfer(transferBundle);
      return;
    }
  } catch {
    console.error("Failed to unequip item");
  }
}

function hasBlockingExotic(destinyItem: DestinyItem): boolean {
  if (destinyItem.tierType !== TierType.Exotic) {
    return false;
  }

  let searchBuckets: SectionBuckets[];

  if (destinyItem.itemType === ItemType.Armor) {
    searchBuckets = armorBuckets;
  } else if (destinyItem.itemType === ItemType.Weapon) {
    searchBuckets = weaponBuckets;
  } else {
    return false;
  }

  const characterId = destinyItem.characterId;
  const guardiansItems = useGGStore.getState().guardians[characterId]?.items;

  if (!guardiansItems) {
    return false;
  }
  const currentEquippedItem = guardiansItems[destinyItem.bucketHash]?.equipped;
  if (currentEquippedItem && currentEquippedItem.tierType === TierType.Exotic) {
    return false;
  }

  // If the currently equipped item in this section is an exotic then its fine to equip another
  for (const bucket of searchBuckets) {
    if (guardiansItems[bucket]?.equipped?.tierType === TierType.Exotic) {
      return true;
    }
  }
  return false;
}

function hasSuccessfullyTransferred(transferBundle: TransferBundle) {
  if (transferBundle.unequipItem) {
    console.log("hasSuccessfullyTransferred unequipItem detected");
    if (itemSuccessfullyTransferred(transferBundle.unequipItem)) {
      transferBundle.unequipItem = null;
    }
  }

  // if the array is not empty then return false
  if (transferBundle.unequipItem) {
    return transferBundle;
  }

  if (itemSuccessfullyTransferred(transferBundle.primaryItem)) {
    transferBundle.completed = true;
    return transferBundle;
  }

  return transferBundle;
}

function itemSuccessfullyTransferred(item: TransferItem) {
  const reachedTarget = item.destinyItem.characterId === item.finalTargetId;
  const inCorrectEquipState = item.destinyItem.equipped === item.equipOnTarget;
  const lostItem = item.destinyItem.bucketHash === SectionBuckets.LostItem;

  return reachedTarget && inCorrectEquipState && !lostItem;
}

function hasReachedTarget(item: TransferItem) {
  const reachedTarget = item.destinyItem.characterId === item.finalTargetId;
  const lostItem = item.destinyItem.bucketHash === SectionBuckets.LostItem;

  return reachedTarget && !lostItem;
}

type TransferItemData = {
  membershipType: number;
  itemReferenceHash: number;
  itemId: string;
  stackSize: number;
  characterId: string;
  transferToVault: boolean;
};

async function moveItem(transferItem: TransferItem): Promise<[JSON, DestinyItem]> {
  if (DEBUG_TRANSFER) {
    const itemDefinition = itemsDefinition[transferItem.destinyItem.itemHash];
    console.log("move", itemDefinition?.n);
  }

  let toVault: boolean;
  let characterId = "";

  if (transferItem.destinyItem.characterId !== VAULT_CHARACTER_ID) {
    toVault = true;
    if (GLOBAL_INVENTORY_NAMES.includes(transferItem.destinyItem.characterId)) {
      const characterId1 = useGGStore.getState().ggCharacters[0]?.characterId;
      if (!characterId1) {
        console.error("No characterId1");
        throw new Error("Impossible situation. No characterId1");
      }
      characterId = characterId1;
    } else {
      characterId = transferItem.destinyItem.characterId;
    }
  } else {
    toVault = false;
    characterId = transferItem.finalTargetId;
  }

  const membershipType = useGGStore.getState().bungieUser.profile.membershipType;

  const data: TransferItemData = {
    membershipType,
    itemReferenceHash: transferItem.destinyItem.itemHash,
    itemId: transferItem.destinyItem.itemInstanceId ? transferItem.destinyItem.itemInstanceId : "0",
    stackSize: transferItem.quantityToMove,
    characterId,
    transferToVault: toVault,
  };

  const authToken = await useGGStore.getState().getTokenAsync("getProfile");
  if (authToken) {
    const headers = new Headers();
    headers.append("Authorization", `Bearer ${authToken.access_token}`);
    headers.append("X-API-Key", apiKey);

    const requestOptions: RequestInit = {
      method: "POST",
      headers: headers,
      body: JSON.stringify(data),
    };

    //TODO: Currently hardcode to en. This should be a parameter
    const endPoint = `${basePath}/Destiny2/Actions/Items/TransferItem/?&lc=en`;
    return new Promise((resolve, reject) => {
      fetch(endPoint, requestOptions)
        .then((response) => {
          return response.json();
        })
        .then((data) => {
          const previousCharacterId = transferItem.destinyItem.characterId;
          const updatedCharacterId = toVault ? VAULT_CHARACTER_ID : transferItem.finalTargetId;
          const updatedDestinyItem: DestinyItem = {
            ...transferItem.destinyItem,
            characterId: updatedCharacterId,
            previousCharacterId,
          };
          resolve([data as JSON, updatedDestinyItem]);
        })
        .catch((error) => {
          console.error("moveItem()", error);
          reject(error);
        });
    });
  }
  throw new Error("No auth token");
}

type EquipItemData = {
  membershipType: number;
  itemId: string;
  itemReferenceHash: number;
  characterId: string;
};

async function equipItem(transferItem: TransferItem): Promise<[JSON, DestinyItem]> {
  const membershipType = useGGStore.getState().bungieUser.profile.membershipType;

  const data: EquipItemData = {
    membershipType,
    itemId: transferItem.destinyItem.itemInstanceId ? transferItem.destinyItem.itemInstanceId : "0",
    itemReferenceHash: transferItem.destinyItem.itemHash,
    characterId: transferItem.finalTargetId,
  };

  const authToken = await useGGStore.getState().getTokenAsync("equipItem");
  if (authToken) {
    const headers = new Headers();
    headers.append("Authorization", `Bearer ${authToken.access_token}`);
    headers.append("X-API-Key", apiKey);

    const requestOptions: RequestInit = {
      method: "POST",
      headers: headers,
      body: JSON.stringify(data),
    };

    //TODO: Currently hardcode to en. This should be a parameter
    const endPoint = `${basePath}/Destiny2/Actions/Items/EquipItem/?&lc=en`;
    return new Promise((resolve, reject) => {
      fetch(endPoint, requestOptions)
        .then((response) => {
          return response.json();
        })
        .then((data) => {
          const updatedDestinyItem: DestinyItem = {
            ...transferItem.destinyItem,
            equipped: true,
          };
          resolve([data as JSON, updatedDestinyItem]);
        })
        .catch((error) => {
          console.error("equipItem()", error);
          reject(error);
        });
    });
  }
  throw new Error("No auth token");
}

type PostmasterItemData = {
  membershipType: number;
  itemReferenceHash: number;
  itemId: string;
  stackSize: number;
  characterId: string;
};

async function pullFromPostmaster(transferItem: TransferItem): Promise<[JSON, DestinyItem]> {
  const membershipType = useGGStore.getState().bungieUser.profile.membershipType;

  const data: PostmasterItemData = {
    membershipType,
    itemReferenceHash: transferItem.destinyItem.itemHash,
    itemId: transferItem.destinyItem?.itemInstanceId ? transferItem.destinyItem.itemInstanceId : "0",
    // TODO: If the quantity is larger than can be moved should there be some logic to set it to the max possible?
    stackSize: transferItem.destinyItem.quantity,
    characterId: transferItem.destinyItem.characterId,
  };

  const authToken = await useGGStore.getState().getTokenAsync("equipItem");
  if (authToken) {
    const headers = new Headers();
    headers.append("Authorization", `Bearer ${authToken.access_token}`);
    headers.append("X-API-Key", apiKey);

    const requestOptions: RequestInit = {
      method: "POST",
      headers: headers,
      body: JSON.stringify(data),
    };
    //TODO: Currently hardcode to en. This should be a parameter
    const endPoint = `${basePath}/Destiny2/Actions/Items/PullFromPostmaster/`;
    return new Promise((resolve, reject) => {
      fetch(endPoint, requestOptions)
        .then((response) => {
          return response.json();
        })
        .then((data) => {
          // The UI remove system relies on the previousCharacterId to delete items.
          const previousCharacterId = transferItem.destinyItem.characterId;
          const updatedDestinyItem: DestinyItem = {
            ...transferItem.destinyItem,
            previousCharacterId,
          };
          resolve([data as JSON, updatedDestinyItem]);
        })
        .catch((error) => {
          console.error("PullFromPostmaster()", error);
          reject(error);
        });
    });
  }
  throw new Error("No auth token");
}

function _getUnequipItem(itemToUnequip: DestinyItem): DestinyItem {
  const guardians = useGGStore.getState().guardians;
  // DestinyItem unequipItem
  let unequipItem: DestinyItem;

  // var itemToUnequip = package.inventoryItem
  // var itemToUnequipDef = DestinyItem.Def.definitions[itemToUnequip.itemHash]
  /// Can the unequip item be an exotic? Yes if this item is an exotic or in a slot where it does not matter
  const doNotIncludeExotics =
    sectionSupportsBlockingExotic.includes(itemToUnequip.bucketHash) && itemToUnequip.tierType !== TierType.Exotic;
  console.log("do not include exotics", doNotIncludeExotics);

  /// Is there an item in this section that can unequip the item?
  let itemsInSection = guardians[itemToUnequip.characterId]?.items[itemToUnequip.bucketHash]?.inventory;
  if (!itemsInSection) {
    throw new Error("No items in section");
  }

  let ignoreLocked = false;

  try {
    unequipItem = returnNonBusyUnequipItem(itemToUnequip, itemsInSection, doNotIncludeExotics, ignoreLocked);
  } catch (e) {
    console.error("getUnequipItem", e);
    throw new Error("Failed to get unequip item");
  }

  if (!unequipItem) {
    console.log("now trying vault");
    /// failed to find any on that character so now lets try the vault
    itemsInSection = guardians[VAULT_CHARACTER_ID]?.items[itemToUnequip.bucketHash]?.inventory;
    if (!itemsInSection) {
      throw new Error("No items in section");
    }
    ignoreLocked = true;
    unequipItem = returnNonBusyUnequipItem(itemToUnequip, itemsInSection, doNotIncludeExotics, ignoreLocked);

    if (!unequipItem) {
      console.log("now trying locked items in the vault");
      /// one last try with locked items
      ignoreLocked = false;
      try {
        unequipItem = returnNonBusyUnequipItem(itemToUnequip, itemsInSection, doNotIncludeExotics, ignoreLocked);
      } catch (e) {
        console.error("getUnequipItem", e);
        throw new Error("Failed to get unequip item");
      }
    }
  }
  const itemDefinition = itemsDefinition[unequipItem.itemHash];
  console.log("getUnequipItem returns", itemDefinition?.n);
  return unequipItem;
}

/// Character is used to identify the character this item would be equipped on and used to ignore underleveled or wrong class items
function returnNonBusyUnequipItem(
  itemToUnequip: DestinyItem,
  items: DestinyItem[],
  ignoreExotics: boolean,
  ignoreLocked: boolean,
): DestinyItem {
  // let nonBusyItem: DestinyItem
  for (const item of items) {
    if (item.destinyClass !== DestinyClass.Unknown && item.destinyClass !== itemToUnequip.destinyClass) {
      continue;
    }

    if (ignoreLocked) {
      if (isLocked(item)) {
        continue;
      }
    }

    //TODO: If the system that marks items for transfer is added back this will need to be changed
    // if !TransferLogic.itemsMarkedForTransfer.contains(item.itemInstanceId) {
    if (ignoreExotics) {
      if (item.tierType !== TierType.Exotic) {
        return item;
      }
    } else {
      return item;
    }
    // }
  }

  throw new Error("No unequip item");
  // return nonBusyItem
}

function isLocked(item: DestinyItem): boolean {
  return bitmaskContains(item.state, 1);
}
