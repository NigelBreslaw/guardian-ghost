import { createNativeStackNavigator } from "@react-navigation/native-stack";

import MainDrawer from "@/app/UI/MainDrawer.tsx";
import Login from "@/app/UI/Login.tsx";
import DetailsView from "@/app/inventory/pages/details/DetailsView.tsx";
import type { RootStackParamList } from "@/app/Root.tsx";

const RootStack = createNativeStackNavigator<RootStackParamList>();

function App() {
  return (
    <RootStack.Navigator>
      <RootStack.Group>
        <RootStack.Screen
          name="Root"
          component={MainDrawer}
          options={{
            headerShown: false,
          }}
        />
        <RootStack.Screen
          name="Details"
          component={DetailsView}
          options={{
            headerBackTitle: "Back",
            headerStyle: {
              backgroundColor: "#17101F",
            },
            headerTintColor: "white",
          }}
        />
      </RootStack.Group>
      <RootStack.Group screenOptions={{ presentation: "modal", gestureEnabled: false, headerShown: false }}>
        <RootStack.Screen name="Login" component={Login} options={{ title: "Login" }} />
      </RootStack.Group>
    </RootStack.Navigator>
  );
}

export default App;
