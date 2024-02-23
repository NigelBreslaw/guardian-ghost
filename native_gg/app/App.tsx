import { SafeAreaProvider, initialWindowMetrics } from "react-native-safe-area-context";
import GlobalStateProvider from "./state/GlobalState";
import RootScreen from "./RootScreen";
import { NavigationContainer } from "@react-navigation/native";

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
