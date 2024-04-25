import type { DestinyItem } from "@/app/bungie/Types.ts";
import { useGGStore } from "@/app/store/GGStore.ts";
import {
  GLOBAL_CONSUMABLES_CHARACTER_ID,
  GLOBAL_INVENTORY_NAMES,
  GLOBAL_MODS_CHARACTER_ID,
  VAULT_CHARACTER_ID,
} from "@/app/utilities/Constants.ts";
import { View, StyleSheet, Text } from "react-native";
import { Gesture, GestureDetector, GestureHandlerRootView } from "react-native-gesture-handler";
import { runOnJS } from "react-native-reanimated";
import { Image } from "expo-image";
import { GLOBAL_SPACE_EMBLEM, SectionBuckets } from "@/app/bungie/Common.ts";

type TransferEquipButtonsProps = {
  currentCharacterId: string;
  destinyItem: DestinyItem;
  close: () => void;
  startTransfer: (toCharacterId: string, equipOnTarget: boolean) => void;
};

export default function TransferEquipButtons(props: TransferEquipButtonsProps) {
  const rectangles = [];

  const scale = 0.6;
  const originalWidth = 350;
  const originalHeight = 96;
  const transferWidth = originalWidth * scale;
  const transferHeight = originalHeight * scale;
  const borderRadius = 15;

  // is this a vault item that will be transferred to the Mods or Consumables page section?
  if (
    (props.currentCharacterId === VAULT_CHARACTER_ID &&
      props.destinyItem.recoveryBucketHash === SectionBuckets.Consumables) ||
    props.destinyItem.recoveryBucketHash === SectionBuckets.Mods
  ) {
    const ggCharacterId =
      props.destinyItem.recoveryBucketHash === SectionBuckets.Mods
        ? GLOBAL_MODS_CHARACTER_ID
        : GLOBAL_CONSUMABLES_CHARACTER_ID;
    const transferTap = Gesture.Tap().onBegin(() => {
      runOnJS(props.startTransfer)(ggCharacterId, false);
      runOnJS(props.close)();
    });
    const globalButton = (
      <GestureHandlerRootView style={{ flexDirection: "row", gap: 5 }}>
        <GestureDetector gesture={transferTap}>
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
              <View style={[StyleSheet.absoluteFillObject, { flex: 1, alignContent: "center" }]}>
                <Text>Character: {ggCharacterId}</Text>
              </View>
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
        </GestureDetector>
      </GestureHandlerRootView>
    );
    return <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 5, padding: 15 }}>{globalButton}</View>;
  }
  const ggCharacters = useGGStore((state) => state.ggCharacters);

  function calcEquipOpacity(buttonCharacterId: string): number {
    if (buttonCharacterId === VAULT_CHARACTER_ID) {
      return 0;
    }
    if (!props.destinyItem.equippable) {
      return 0;
    }
    if (calcEquipButtonDisabled(buttonCharacterId)) {
      return 0.2;
    }
    return 1;
  }

  function calcTransferOpacity(buttonCharacterId: string): number {
    if (props.destinyItem.nonTransferrable) {
      return 0;
    }
    if (calcTransferButtonDisabled(buttonCharacterId)) {
      return 0.2;
    }
    return 1;
  }

  // only call this if you already checked the item is equippable
  function calcEquipButtonDisabled(buttonCharacterId: string): boolean {
    // is this item already on the character, but not in the postmaster?
    if (buttonCharacterId === props.currentCharacterId && props.destinyItem.bucketHash !== 215593132) {
      if (props.destinyItem.equipped) {
        return true;
      }
      return false;
    }
    return false;
  }

  function calcTransferButtonDisabled(buttonCharacterId: string): boolean {
    // is this item already on the character, but not in the postmaster?
    if (buttonCharacterId === props.currentCharacterId && props.destinyItem.bucketHash !== 215593132) {
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

    if (props.destinyItem.nonTransferrable && ggCharacter.characterId !== props.currentCharacterId) {
      continue;
    }

    const transferTap = Gesture.Tap().onBegin(() => {
      if (isTransferDisabled) {
        return;
      }
      runOnJS(props.startTransfer)(ggCharacter.characterId, false);
      runOnJS(props.close)();
    });
    const transferAndEquipTap = Gesture.Tap().onBegin(() => {
      if (isEquipDisabled) {
        return;
      }
      runOnJS(props.startTransfer)(ggCharacter.characterId, true);
      runOnJS(props.close)();
    });

    rectangles.push(
      <GestureHandlerRootView key={ggCharacter.characterId} style={{ flexDirection: "row", gap: 5 }}>
        <GestureDetector gesture={transferTap}>
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
              <Image source={ggCharacter.emblemBackgroundPath} style={{ width: 474, height: 96 }} />
              <View style={[StyleSheet.absoluteFillObject, { flex: 1, alignContent: "center" }]}>
                <Text>Character: {ggCharacter.characterId}</Text>
              </View>
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
        </GestureDetector>
        <GestureDetector gesture={transferAndEquipTap}>
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
              <Image source={ggCharacter.emblemPath} style={{ width: 96, height: 96 }} />
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
        </GestureDetector>
      </GestureHandlerRootView>,
    );
  }

  return <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 5, padding: 15 }}>{rectangles}</View>;
}
