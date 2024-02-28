import GlobalStateProvider from "@/state/GlobalState.tsx";
import { NavigationContainer } from "@react-navigation/native";
import { SafeAreaProvider, initialWindowMetrics } from "react-native-safe-area-context";
import RootScreen from "./RootScreen.tsx";

export default function App() {
  return (
    <GlobalStateProvider>
      <SafeAreaProvider initialMetrics={initialWindowMetrics}>
        <NavigationContainer>
          <RootScreen />
        </NavigationContainer>
      </SafeAreaProvider>
    </GlobalStateProvider>
  );
}
