import { StyleSheet, View } from "react-native";

import { ENGRAMS_SECTION_WIDTH, ENGRAMS_SECTION_HEIGHT, DEFAULT_MARGIN } from "@/app/utilities/UISize.ts";
import type { DestinyItem } from "@/app/inventory/logic/Types.ts";
import EngramCell from "@/app/inventory/cells/EngramCell.tsx";

const array10 = Array.from({ length: 10 });

type Props = {
  readonly items: DestinyItem[];
};

export default function EngramsUI({ items }: Props) {
  "use memo";
  return (
    <View style={styles.container}>
      {array10.map((_v, index) => {
        const item = items[index];
        return (
          // biome-ignore lint/suspicious/noArrayIndexKey: <explanation>
          <EngramCell key={index} destinyItem={item} />
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: ENGRAMS_SECTION_WIDTH,
    marginLeft: DEFAULT_MARGIN,
    marginRight: DEFAULT_MARGIN,
    height: ENGRAMS_SECTION_HEIGHT,
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    alignContent: "space-between",
    alignSelf: "center",
  },
});
