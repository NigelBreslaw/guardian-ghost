import ArtifactCell from "@/app/inventory/ArtifactCell.tsx";
import { ITEM_SIZE, type DestinyIconData } from "@/app/inventory/Common.ts";
import EmptyCell from "@/app/inventory/EmptyCell.tsx";
import { useGGStore } from "@/app/store/GGStore.ts";
import React from "react";
import { View } from "react-native";

type ArtifactProps = {
  equipped: DestinyIconData | null;
};

function ArtifactUI(props: ArtifactProps) {
  const inventorySectionWidth = useGGStore.getState().inventorySectionWidth;
  const dynamicStyles = {
    width: inventorySectionWidth,
    height: ITEM_SIZE,
  };

  return (
    <View style={dynamicStyles}>
      <View style={{ flex: 1, flexDirection: "row", justifyContent: "space-between" }}>
        <View style={{ flex: 1 }}>
          {props.equipped !== null ? <ArtifactCell data={props.equipped} /> : <EmptyCell />}
        </View>
        <View style={{ flex: 3 }} />
      </View>
    </View>
  );
}

export default React.memo(ArtifactUI);
