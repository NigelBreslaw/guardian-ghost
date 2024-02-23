import { NavigationContainer } from "@react-navigation/native";
import { SafeAreaProvider, initialWindowMetrics } from "react-native-safe-area-context";
import Director from "./screens/Director";
import GlobalStateProvider from "./state/GlobalState";
import { View, Text, Button } from "react-native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

// biome-ignore lint/suspicious/noExplicitAny: <explanation>
function HomeScreen({ navigation }: { navigation: any }) {
  return (
    <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
      <Text>Home Screen</Text>
      <Button title="Go to Director" onPress={() => navigation.navigate("Director")} />
    </View>
  );
}

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <GlobalStateProvider>
      <SafeAreaProvider initialMetrics={initialWindowMetrics}>
        <NavigationContainer>
          <Stack.Navigator>
            <Stack.Screen name="Home" component={HomeScreen} />
            <Stack.Screen name="Director" component={Director} />
          </Stack.Navigator>
        </NavigationContainer>
      </SafeAreaProvider>
    </GlobalStateProvider>
  );
}
