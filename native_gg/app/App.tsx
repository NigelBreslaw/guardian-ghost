import { SafeAreaProvider, initialWindowMetrics } from "react-native-safe-area-context";
import Director from "./screens/Director";
import GlobalStateProvider from "./state/GlobalState";

export default function App() {
  return (
    <GlobalStateProvider>
      <SafeAreaProvider initialMetrics={initialWindowMetrics}>
        <Director />
      </SafeAreaProvider>
    </GlobalStateProvider>
  );
}
