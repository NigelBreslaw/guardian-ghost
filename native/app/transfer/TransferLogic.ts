import type { DestinyItem } from "@/app/bungie/Types.ts";
import { basePath } from "@/app/inventory/Common.ts";
import { itemsDefinition } from "@/app/store/Definitions.ts";
import { useGGStore } from "@/app/store/GGStore.ts";
import { VAULT_CHARACTER_ID } from "@/app/utilities/Constants.ts";
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

export type TransferItem = {
  destinyItem: DestinyItem;
  finalTargetId: string;
  quantityToMove: number;
  equipOnTarget: boolean;
};

export async function processTransferItem(
  toCharacterId: string,
  destinyItem: DestinyItem,
  quantityToMove = 1,
  equipOnTarget = false,
) {
  if (DEBUG_TRANSFER) {
    console.log("processTransferItem()", toCharacterId, destinyItem, quantityToMove, equipOnTarget);
  }

  const transferItem: TransferItem = {
    destinyItem,
    finalTargetId: toCharacterId,
    equipOnTarget,
    quantityToMove,
  };

  // Check if the item has successfully been transferred
  if (hasSuccessfullyTransferred(transferItem)) {
    const itemDefinition = itemsDefinition[transferItem.destinyItem.itemHash];
    const successMessage = `${itemDefinition?.n} has been transferred${
      transferItem.equipOnTarget ? " and equipped." : "."
    }`;
    console.info(successMessage);
    useGGStore.getState().showSnackBar(successMessage);
    return;
  }

  const reachedTarget = hasReachedTarget(transferItem);
  if (reachedTarget) {
    // This is only possible if the item needs to equipped
    try {
      if (DEBUG_TRANSFER) {
        console.log("equipItem");
      }
      const result = await equipItem(transferItem);
      const parsedResult = safeParse(responseSchema, result[0]);
      if (parsedResult.success) {
        if (parsedResult.output.ErrorStatus === "Success") {
          processTransferItem(toCharacterId, result[1], quantityToMove, equipOnTarget);
          useGGStore.getState().equipItem(result[1]);
          return;
        }
        console.error("Failed", parsedResult.output);
        useGGStore.getState().showSnackBar(`Failed to transfer item ${parsedResult.output.Message} `);
        return;
      }
      console.error("Failed to equip item and failed to parse response");
      useGGStore.getState().showSnackBar("Failed to equip item");
    } catch (e) {
      console.error("Failed to equip item", e);
      useGGStore.getState().showSnackBar("Failed to equip item");
    }
  } else {
    // lostItem?
    if (transferItem.destinyItem.bucketHash === 215593132) {
      // TODO: Handle postmaster items
      useGGStore.getState().showSnackBar("!!! Postmaster items have not been implemented yet !!!");
    } else {
      try {
        const result = await moveItem(transferItem);
        const parsedResult = safeParse(responseSchema, result[0]);

        if (parsedResult.success) {
          if (parsedResult.output.ErrorStatus === "Success") {
            processTransferItem(toCharacterId, result[1], quantityToMove, equipOnTarget);
            useGGStore.getState().moveItem(result[1]);
            return;
          }
          console.error("Failed", parsedResult.output);
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
  }

  if (DEBUG_TRANSFER) {
    console.log("transferItem got here...");
  }
}

function hasSuccessfullyTransferred(item: TransferItem) {
  const reachedTarget = item.destinyItem.characterId === item.finalTargetId;
  const inCorrectEquipState = item.destinyItem.equipped === item.equipOnTarget;
  const lostItem = item.destinyItem.bucketHash === 215593132;

  return reachedTarget && inCorrectEquipState && !lostItem;
}

function hasReachedTarget(item: TransferItem) {
  const reachedTarget = item.destinyItem.characterId === item.finalTargetId;
  const lostItem = item.destinyItem.bucketHash === 215593132;

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
    characterId = transferItem.destinyItem.characterId;
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
