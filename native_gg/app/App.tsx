import { SafeAreaProvider, initialWindowMetrics } from "react-native-safe-area-context";
import Director from "./screens/Director";

export default function App() {
  return (
    <SafeAreaProvider initialMetrics={initialWindowMetrics}>
      <Director />
    </SafeAreaProvider>
  );
}
