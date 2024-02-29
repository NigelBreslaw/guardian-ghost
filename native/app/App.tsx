import { PaperProvider } from "react-native-paper";
import GlobalStateProvider from "@/state/GlobalState.tsx";
import { SafeAreaProvider, initialWindowMetrics } from "react-native-safe-area-context";
import RootScreen from "@/RootScreen.tsx";
import { NavigationContainer } from "@react-navigation/native";

export default function App() {
  return (
    <PaperProvider>
      <GlobalStateProvider>
        <SafeAreaProvider initialMetrics={initialWindowMetrics}>
          <NavigationContainer>
            <RootScreen />
          </NavigationContainer>
        </SafeAreaProvider>
      </GlobalStateProvider>
    </PaperProvider>
  );
}
