import { StyleSheet, View, Text } from "react-native";

import { SEPARATOR_HEIGHT, DEFAULT_MARGIN } from "@/app/utilities/UISize.ts";
import { useGGStore } from "@/app/store/GGStore.ts";
import { VAULT_CHARACTER_ID } from "@/app/utilities/Constants.ts";
import { BUCKET_SIZES } from "@/app/store/Definitions.ts";
import type { BucketHash, CharacterId } from "@/app/core/GetProfile.ts";
import { vaultItemBuckets } from "@/app/inventory/logic/Helpers.ts";
import { useEffect, useState } from "react";
import { SectionBuckets } from "@/app/bungie/Enums.ts";

type Props = {
  readonly label: string;
  readonly bucketHash?: BucketHash;
  readonly characterId?: CharacterId;
};

export default function SeparatorUI({ label, bucketHash, characterId }: Props) {
  "use memo";

  const [info, setInfo] = useState("");

  useEffect(() => {
    if (bucketHash && characterId === VAULT_CHARACTER_ID && vaultItemBuckets.includes(bucketHash)) {
      const unsubscribe = useGGStore.subscribe(
        (state) => state.ggVaultCount,
        (vaultCount, previousVaultCount) => {
          if (info === "" || vaultCount !== previousVaultCount) {
            const totalVaultItems = useGGStore.getState().ggVaultCount;
            setInfo(`${totalVaultItems}/${BUCKET_SIZES[SectionBuckets.Vault]}`);
          }
        },
        { fireImmediately: true },
      );

      return unsubscribe;
    }

    if (characterId && bucketHash === SectionBuckets.LostItem && characterId !== VAULT_CHARACTER_ID) {
      const characterIndex = useGGStore.getState().getCharacterIndex(characterId);
      const unsubscribe = useGGStore.subscribe(
        (state) => state.ggLostItemCount[characterIndex],
        (lostItemsCount, previousLostItemsCount) => {
          if (info === "" || lostItemsCount !== previousLostItemsCount) {
            setInfo(`${lostItemsCount}/${BUCKET_SIZES[SectionBuckets.LostItem]}`);
          }
        },
        { fireImmediately: true },
      );

      return unsubscribe;
    }

    if (characterId && bucketHash === SectionBuckets.Mods && characterId !== VAULT_CHARACTER_ID) {
      const unsubscribe = useGGStore.subscribe(
        (state) => state.ggModsCount,
        (modsCount, previousModsCount) => {
          if (info === "" || modsCount !== previousModsCount) {
            setInfo(`${modsCount}/${BUCKET_SIZES[SectionBuckets.Mods]}`);
          }
        },
        { fireImmediately: true },
      );

      return unsubscribe;
    }

    if (characterId && bucketHash === SectionBuckets.Consumables && characterId !== VAULT_CHARACTER_ID) {
      const unsubscribe = useGGStore.subscribe(
        (state) => state.ggConsumablesCount,
        (consumablesCount, previousConsumablesCount) => {
          if (info === "" || consumablesCount !== previousConsumablesCount) {
            setInfo(`${consumablesCount}/${BUCKET_SIZES[SectionBuckets.Consumables]}`);
          }
        },
        { fireImmediately: true },
      );

      return unsubscribe;
    }
  }, [bucketHash, characterId, info]);

  return (
    <View style={styles.root}>
      <View style={styles.spacer} />
      <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
        <Text style={styles.label}>{label}</Text>
        <Text style={styles.label}>{`${info}`}</Text>
      </View>
      <View style={styles.spacer2} />
      <View style={styles.bar} />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    height: SEPARATOR_HEIGHT,
    marginLeft: DEFAULT_MARGIN,
    marginRight: DEFAULT_MARGIN,
  },
  bar: {
    width: "auto",
    height: 1,
    backgroundColor: "#818181",
  },
  label: {
    color: "#D1D1D1",
    textAlign: "left",
    fontSize: 16,
  },
  spacer: {
    height: 20,
  },
  spacer2: {
    height: 2,
  },
});
