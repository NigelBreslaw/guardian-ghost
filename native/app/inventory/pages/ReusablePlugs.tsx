import { CategoryStyle, type SocketCategory, type SocketEntry } from "@/app/inventory/logic/Sockets.ts";
import { View, Text, StyleSheet } from "react-native";
const styles = StyleSheet.create({
  container: {
    height: 100,
    width: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  text: {
    color: "white",
    fontSize: 15,
    fontWeight: "bold",
    includeFontPadding: false,
  },
});
type ReusablePlugsProps = {
  socketCategory: SocketCategory;
  socketEntries: SocketEntry[] | undefined;
};
export default function ReusablePlugs(props: ReusablePlugsProps) {
  if (props.socketCategory.categoryStyle !== CategoryStyle.Reusable) {
    return null;
  }
  for (const column of props.socketCategory.topLevelSockets) {
    for (const e of column) {
      console.log(e);
    }
  }
  switch (props.socketCategory.categoryStyle) {
    case CategoryStyle.Reusable: {
      return (
        <View style={styles.container}>
          <Text style={styles.text}>ReusablePlugs</Text>
        </View>
      );
    }
    default: {
      return null;
    }
  }
}
