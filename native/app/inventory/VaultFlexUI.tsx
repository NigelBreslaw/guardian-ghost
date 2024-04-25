import type { DestinyIconData } from "@/app/bungie/Common";
import { DEFAULT_MARGIN, ICON_SIZE, ICON_VAULT_MARGIN } from "@/app/utilities/UISize.ts";
import DestinyCell from "@/app/inventory/DestinyCell.tsx";
import EmptyCell from "@/app/inventory/EmptyCell.tsx";
import React, { useMemo } from "react";
import { StyleSheet, View } from "react-native";

type VaultFlexProps = {
  data: DestinyIconData[];
  minimumSpacerHeight?: number;
};

function VaultFlexUI(props: VaultFlexProps) {
  const sectionRows = Math.ceil(props.data.length / 5);
  const totalItems = sectionRows * 5;
  const minimumSpacerHeight = Math.max(
    props.minimumSpacerHeight ?? 0,
    ICON_SIZE * sectionRows + ICON_VAULT_MARGIN * (sectionRows - 1),
  );
  const normalHeight = ICON_SIZE * sectionRows + ICON_VAULT_MARGIN * (sectionRows - 1);

  const styles = useMemo(
    () =>
      StyleSheet.create({
        root: {
          height: minimumSpacerHeight,
        },
        container: {
          maxHeight: normalHeight,
          marginLeft: DEFAULT_MARGIN,
          marginRight: DEFAULT_MARGIN,
          flex: 5,
          flexDirection: "row",
          flexWrap: "wrap",
          justifyContent: "space-between",
          alignContent: "space-between",
        },
      }),
    [minimumSpacerHeight, normalHeight],
  );

  return (
    <View style={styles.root}>
      <View style={styles.container}>
        {Array.from({ length: totalItems }).map((_v, index) => {
          const item = props.data[index];
          if (item) {
            return (
              // biome-ignore lint/suspicious/noArrayIndexKey: <explanation>
              <DestinyCell key={index} data={item} />
            );
          }
          return (
            // biome-ignore lint/suspicious/noArrayIndexKey: <explanation>
            <EmptyCell key={index} />
          );
        })}
      </View>
    </View>
  );
}

export default React.memo(VaultFlexUI);
