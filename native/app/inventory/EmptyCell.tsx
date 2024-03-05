import { StyleSheet, View } from "react-native";

const styles = StyleSheet.create({
  icon: {
    width: 68,
    height: 68,
    borderRadius: 10,
    borderWidth: 3,
    borderColor: "#555555",
  },
  frameSize: {
    width: 68,
    height: 68,
  },
});

export default function EmptyCell() {
  return (
    <View style={styles.frameSize}>
      <View style={styles.icon} />
    </View>
  );
}
