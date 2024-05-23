import React, { useMemo } from "react";
import { StyleSheet, View } from "react-native";

import type { DestinyItem } from "@/app/inventory/logic/Types.ts";
import { createSockets } from "@/app/inventory/logic/Sockets.ts";
import { createStats } from "@/app/stats/Logic.ts";
import ReusablePlugs from "@/app/stats/ReusablePlugs.tsx";
import StatBars from "@/app/stats/StatBars.tsx";

type StatsProps = {
  readonly destinyItem: DestinyItem;
};

function Stats(props: StatsProps) {
  const sockets = useMemo(() => createSockets(props.destinyItem), [props.destinyItem]);
  if (!sockets) {
    return null;
  }
  const stats = createStats(props.destinyItem, sockets);

  return (
    <View style={{ width: "100%" }}>
      {stats && <StatBars stats={stats} destinyItem={props.destinyItem} />}
      {sockets?.socketCategories.map((category, _index) => {
        return <ReusablePlugs key={category.index} item={props.destinyItem} socketCategory={category} />;
      })}
    </View>
  );
}

export default React.memo(Stats);

const _styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
});
