import type { CharacterId } from "@/app/core/GetProfile.ts";
import { StyleSheet, View, Text } from "react-native";

type Props = {
  readonly characterId?: CharacterId;
};

export default function GuardianDetails({ characterId }: Props) {
  "use memo";

  const styles = StyleSheet.create({
    root: {
      height: 50,
    },
    primaryStatText: {
      color: "white",
    },
  });

  return (
    <View style={styles.root}>
      <Text style={styles.primaryStatText}>{`Guardian ${characterId}`}</Text>
    </View>
  );
}
