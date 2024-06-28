import { useGGStore } from "@/app/store/GGStore.ts";
import { StyleSheet, View, Text } from "react-native";

type Props = {
  readonly characterIndex: number;
};

export default function GuardianDetails({ characterIndex }: Props) {
  "use memo";

  const styles = StyleSheet.create({
    root: {
      height: 50,
    },
    primaryStatText: {
      color: "white",
    },
  });

  const characterId = useGGStore.getState().ggCharacters[characterIndex]?.characterId;

  return (
    <View style={styles.root}>
      <Text style={styles.primaryStatText}>{`Guardian ${characterId}`}</Text>
    </View>
  );
}
