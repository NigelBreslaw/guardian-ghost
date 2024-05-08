import { StyleSheet, View } from "react-native";
import type { DestinyItem } from "@/app/inventory/logic/Types.ts";
import { createSockets } from "@/app/inventory/logic/Sockets.ts";
import ReusablePlugs from "@/app/stats/ReusablePlugs";

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

export default function Stats(props: StatsProps) {
  const sockets = createSockets(props.destinyItem);

  return (
    <View style={{ width: "100%" }}>
      {sockets?.socketCategories.map((category, _index) => {
        return <ReusablePlugs key={category.index} item={props.destinyItem} socketCategory={category} />;
      })}
    </View>
  );
}
