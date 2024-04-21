import type { DestinyIconData } from "@/app/inventory/Common.ts";
import { DEFAULT_MARGIN, FOOTER_HEIGHT, ICON_SIZE, ICON_VAULT_MARGIN } from "@/app/utilities/UISize.ts";
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

  const styles = useMemo(
    () =>
      StyleSheet.create({
        container: {
          height: minimumSpacerHeight,
          marginLeft: DEFAULT_MARGIN,
          marginRight: DEFAULT_MARGIN,
          flex: 5,
          flexDirection: "row",
          flexWrap: "wrap",
          justifyContent: "space-between",
          alignContent: "space-between",
        },
      }),
    [minimumSpacerHeight],
  );

  return (
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
  );
}

export default React.memo(VaultFlexUI);
