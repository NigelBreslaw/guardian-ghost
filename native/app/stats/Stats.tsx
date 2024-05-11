import { StyleSheet, View } from "react-native";
import type { DestinyItem } from "@/app/inventory/logic/Types.ts";
import { createSockets } from "@/app/inventory/logic/Sockets.ts";
import ReusablePlugs from "@/app/stats/ReusablePlugs";
import { createWeaponStats } from "@/app/stats/Logic.ts";
import StatBars from "@/app/stats/StatBars.tsx";
import { useMemo } from "react";
import React from "react";

const _styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
});

type StatsProps = {
  destinyItem: DestinyItem;
};

function Stats(props: StatsProps) {
  const sockets = useMemo(() => createSockets(props.destinyItem), [props.destinyItem]);
  if (!sockets) {
    return null;
  }
  const stats = createWeaponStats(props.destinyItem, sockets);

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
