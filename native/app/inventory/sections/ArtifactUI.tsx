import { View, StyleSheet } from "react-native";

import ArtifactCell from "@/app/inventory/cells/ArtifactCell.tsx";
import { DEFAULT_SECTION_4_WIDTH, ICON_MARGIN, ICON_SIZE } from "@/app/utilities/UISize.ts";
import type { DestinyItem } from "@/app/inventory/logic/Types.ts";

type Props = {
  readonly item: DestinyItem | undefined;
};

export default function ArtifactUI({ item }: Props) {
  "use memo";
  return (
    <View style={styles.container}>
      <ArtifactCell destinyItem={item} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: DEFAULT_SECTION_4_WIDTH,
    height: ICON_SIZE + ICON_MARGIN,
    alignSelf: "center",
  },
});
