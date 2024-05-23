import { View, StyleSheet } from "react-native";

import ArtifactCell from "@/app/inventory/cells/ArtifactCell.tsx";
import EmptyCell from "@/app/inventory/cells/EmptyCell.tsx";
import { DEFAULT_SECTION_4_WIDTH, ICON_MARGIN, ICON_SIZE } from "@/app/utilities/UISize.ts";
import type { DestinyIconData } from "@/app/inventory/logic/Types.ts";

type Props = {
  readonly iconData: DestinyIconData | null;
};

export default function ArtifactUI({ iconData }: Props) {
  "use memo";
  return (
    <View style={styles.container}>{iconData !== null ? <ArtifactCell iconData={iconData} /> : <EmptyCell />}</View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: DEFAULT_SECTION_4_WIDTH,
    height: ICON_SIZE + ICON_MARGIN,
    alignSelf: "center",
  },
});
