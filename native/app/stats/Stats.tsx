import { StyleSheet, View } from "react-native";

import type { DestinyItem } from "@/app/inventory/logic/Types.ts";
import { CategoryStyle, createSockets } from "@/app/inventory/logic/Sockets.ts";
import { createStats } from "@/app/stats/Logic.ts";
import ReusablePlugs from "@/app/stats/ReusablePlugs.tsx";
import StatBars from "@/app/stats/StatBars.tsx";

type Props = {
  readonly destinyItem: DestinyItem;
};

export default function Stats({ destinyItem }: Props) {
  "use memo";
  const sockets = createSockets(destinyItem);
  if (!sockets) {
    return null;
  }
  const stats = createStats(destinyItem, sockets);

  return (
    <View style={{ width: "100%" }}>
      {stats && <StatBars stats={stats} destinyItem={destinyItem} />}
      {sockets?.socketCategories
        .filter((category) => category.categoryStyle === CategoryStyle.Reusable)
        .map((category, _index) => (
          <ReusablePlugs key={category.index} socketCategory={category} />
        ))}
    </View>
  );
}

const _styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
});
