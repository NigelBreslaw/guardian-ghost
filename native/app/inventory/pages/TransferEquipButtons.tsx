import { View, StyleSheet, Text, TouchableOpacity } from "react-native";
import { Image } from "expo-image";

import type { DestinyItem } from "@/app/inventory/logic/Types.ts";
import { useGGStore } from "@/app/store/GGStore.ts";
import {
  GLOBAL_CONSUMABLES_CHARACTER_ID,
  GLOBAL_INVENTORY_NAMES,
  GLOBAL_MODS_CHARACTER_ID,
  VAULT_CHARACTER_ID,
} from "@/app/utilities/Constants.ts";
import { getGuardianRaceType, getGuardianClassType } from "@/app/utilities/Helpers.ts";
import { GLOBAL_SPACE_EMBLEM } from "@/app/inventory/logic/Constants.ts";
import { SectionBuckets } from "@/app/bungie/Enums.ts";
import type { CharacterId } from "@/app/core/GetProfile.ts";

type TransferEquipButtonsProps = {
  readonly destinyItem: DestinyItem;
  close: () => void;
  startTransfer: (toCharacterId: CharacterId, equipOnTarget: boolean) => void;
};

export default function TransferEquipButtons(props: TransferEquipButtonsProps) {
  const rectangles = [];

  const scale = 0.55;
  const originalWidth = 350;
  const originalHeight = 96;
  const transferWidth = originalWidth * scale;
  const transferHeight = originalHeight * scale;
  const borderRadius = 10;

  const ggCharacters = useGGStore.getState().ggCharacters;

  const styles = StyleSheet.create({
    transferToText: {
      fontSize: 16,
      color: "white",
      fontFamily: "Helvetica",
      includeFontPadding: false,
      width: transferWidth,
    },
    transferToInventory: {
      fontSize: 16,
      color: "white",
      fontFamily: "Helvetica",
      includeFontPadding: false,
      width: "100%",
    },
    equipOnText: {
      fontSize: 16,
      color: "white",
      fontFamily: "Helvetica",
      includeFontPadding: false,
    },
    transferClassName: {
      fontSize: 25,
      fontWeight: "bold",
      color: "white",
      fontFamily: "Helvetica",
      includeFontPadding: false,
      position: "absolute",
      top: 10,
      left: 85,
      textShadowColor: "black",
      textShadowOffset: { width: 1, height: 1 },
      textShadowRadius: 1,
    },
    transferRaceName: {
      fontSize: 20,
      color: "grey",
      fontFamily: "Helvetica",
      includeFontPadding: false,
      position: "absolute",
      top: 40,
      left: 85,
      textShadowColor: "#000000DD",
      textShadowOffset: { width: 0.5, height: 0.5 },
      textShadowRadius: 1,
    },
    InventoryName: {
      fontSize: 25,
      fontWeight: "bold",
      color: "white",
      fontFamily: "Helvetica",
      includeFontPadding: false,
      position: "absolute",
      top: 10,
      left: 90,
    },
  });

  // is this a vault item that will be transferred to the Mods or Consumables page section?
  if (
    (props.destinyItem.characterId === VAULT_CHARACTER_ID &&
      props.destinyItem.def.recoveryBucketHash === SectionBuckets.Consumables) ||
    props.destinyItem.def.recoveryBucketHash === SectionBuckets.Mods
  ) {
    const ggCharacterId =
      props.destinyItem.def.recoveryBucketHash === SectionBuckets.Mods
        ? GLOBAL_MODS_CHARACTER_ID
        : GLOBAL_CONSUMABLES_CHARACTER_ID;

    const globalButton = (
      <TouchableOpacity
        onPress={() => {
          props.startTransfer(ggCharacterId, false);
          props.close();
        }}
      >
        <View
          style={{
            width: transferWidth,
            height: transferHeight,
            borderRadius,
            overflow: "hidden",
          }}
        >
          <View
            style={{
              width: originalWidth,
              overflow: "hidden",
              transformOrigin: "top left",
              transform: [{ scale: scale }],
            }}
          >
            <Image source={GLOBAL_SPACE_EMBLEM} cachePolicy={"memory"} style={{ width: 474, height: 96 }} />
            <Text style={styles.InventoryName}>{"Inventory"}</Text>
          </View>
          <View
            style={{
              position: "absolute",
              top: 0,
              bottom: 0,
              left: 0,
              right: 0,
              borderRadius,
              borderWidth: 1,
              borderColor: "grey",
            }}
          />
        </View>
      </TouchableOpacity>
    );
    return (
      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 5, padding: 15 }}>
        <Text style={styles.transferToInventory}>Transfer to</Text>
        {globalButton}
      </View>
    );
  }

  function calcEquipOpacity(buttonCharacterId: CharacterId): number {
    if (buttonCharacterId === VAULT_CHARACTER_ID) {
      return 0;
    }
    if (!props.destinyItem.def.equippable) {
      return 0;
    }
    if (calcEquipButtonDisabled(buttonCharacterId)) {
      return 0.2;
    }
    return 1;
  }

  function calcTransferOpacity(buttonCharacterId: CharacterId): number {
    if (props.destinyItem.def.nonTransferrable) {
      return 0;
    }
    if (calcTransferButtonDisabled(buttonCharacterId)) {
      return 0.2;
    }
    return 1;
  }

  // only call this if you already checked the item is equippable
  function calcEquipButtonDisabled(buttonCharacterId: CharacterId): boolean {
    // is this item already on the character, but not in the postmaster?
    if (buttonCharacterId === props.destinyItem.characterId && props.destinyItem.bucketHash !== 215593132) {
      if (props.destinyItem.equipped) {
        return true;
      }
      return false;
    }
    return false;
  }

  function calcTransferButtonDisabled(buttonCharacterId: CharacterId): boolean {
    // is this item already on the character, but not in the postmaster?
    if (buttonCharacterId === props.destinyItem.characterId && props.destinyItem.bucketHash !== 215593132) {
      return true;
    }
    return false;
  }

  for (const ggCharacter of ggCharacters) {
    // Global items can only be transferred to the vault
    if (GLOBAL_INVENTORY_NAMES.includes(props.destinyItem.characterId)) {
      if (ggCharacter.characterId !== VAULT_CHARACTER_ID) {
        continue;
      }
    }

    const isTransferDisabled = calcTransferButtonDisabled(ggCharacter.characterId);
    const isEquipDisabled = calcEquipButtonDisabled(ggCharacter.characterId);

    if (props.destinyItem.def.nonTransferrable && ggCharacter.characterId !== props.destinyItem.characterId) {
      continue;
    }

    rectangles.push(
      <View key={ggCharacter.characterId} style={{ flexDirection: "row", gap: 5 }}>
        <TouchableOpacity
          disabled={isTransferDisabled}
          onPress={() => {
            props.startTransfer(ggCharacter.characterId, false);
            props.close();
          }}
        >
          <View
            style={{
              width: transferWidth,
              height: transferHeight,
              borderRadius,
              overflow: "hidden",
              opacity: calcTransferOpacity(ggCharacter.characterId),
              display: calcTransferOpacity(ggCharacter.characterId) === 0 ? "none" : "flex",
            }}
          >
            <View
              style={{
                width: originalWidth,

                overflow: "hidden",
                transformOrigin: "top left",
                transform: [{ scale: scale }],
              }}
            >
              <Image
                source={ggCharacter.emblemBackgroundPath}
                cachePolicy="memory"
                style={{ width: 474, height: 96 }}
              />

              <Text style={styles.transferClassName}>{`${getGuardianClassType(ggCharacter.guardianClassType)}`}</Text>
              <Text style={styles.transferRaceName}>{`${getGuardianRaceType(ggCharacter.raceType)}`}</Text>
            </View>
            <View
              style={{
                position: "absolute",
                top: 0,
                bottom: 0,
                left: 0,
                right: 0,
                borderRadius,
                borderWidth: 1,
                borderColor: "grey",
              }}
            />
          </View>
        </TouchableOpacity>
        <TouchableOpacity
          disabled={isEquipDisabled}
          onPress={() => {
            props.startTransfer(ggCharacter.characterId, true);
            props.close();
          }}
        >
          <View
            style={{
              width: transferHeight,
              height: transferHeight,
              borderRadius,
              overflow: "hidden",
              opacity: calcEquipOpacity(ggCharacter.characterId),
              display: calcTransferOpacity(ggCharacter.characterId) === 0 ? "none" : "flex",
            }}
          >
            <View
              style={{
                transformOrigin: "top left",
                transform: [{ scale: scale }],
              }}
            >
              <Image source={ggCharacter.emblemPath} cachePolicy={"memory"} style={{ width: 96, height: 96 }} />
            </View>
            <View
              style={{
                position: "absolute",
                top: 0,
                bottom: 0,
                left: 0,
                right: 0,
                borderRadius,
                borderWidth: 1,
                borderColor: "grey",
              }}
            />
          </View>
        </TouchableOpacity>
      </View>,
    );
  }

  if (rectangles.length === 0) {
    return null;
  }

  return (
    <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 5, padding: 15 }}>
      <Text style={styles.transferToText}>Transfer to</Text>
      <Text style={[styles.equipOnText, { display: props.destinyItem.def.equippable ? "flex" : "none" }]}>
        Equip on
      </Text>

      {rectangles}
    </View>
  );
}
