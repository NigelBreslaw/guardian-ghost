import { ErrorBoundaryProps } from "expo-router";
import { View, Text } from "react-native";

export function ErrorBoundary(props: ErrorBoundaryProps) {
  return (
    <View style={{ flex: 1, backgroundColor: "red" }}>
      <Text>{props.error.message}</Text>
      <Text onPress={props.retry}>Try Agains?</Text>
    </View>
  );
}
