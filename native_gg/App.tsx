import { NavigationContainer } from "@react-navigation/native";
import { clientID } from "./src/constants/env.ts";
import Director from "./src/screens/Director.tsx";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { SafeAreaProvider, initialWindowMetrics } from "react-native-safe-area-context";

const Stack = createNativeStackNavigator();

export default function App() {
  if (process.env.NODE_ENV === "development" && clientID === undefined) {
    console.warn("No .ENV file found. Please create one.");
  }

  return (
    <SafeAreaProvider initialMetrics={initialWindowMetrics}>
      <NavigationContainer>
        <Stack.Navigator>
          <Stack.Screen
            name="Director"
            component={Director}
            options={{
              title: "",
              headerTransparent: true,
              headerStyle: {
                // backgroundColor: "#f4511e",
              },
              headerTitleStyle: {
                fontWeight: "bold",
              },
            }}
          />
        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}
