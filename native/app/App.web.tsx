import { createStackNavigator } from "@react-navigation/stack";

import MainDrawer from "@/app/UI/MainDrawer.tsx";
import Login from "@/app/UI/Login.tsx";
import DetailsView from "@/app/inventory/pages/details/DetailsView.tsx";
import type { RootStackParamList } from "@/app/Root.tsx";

// Native app uses a native stack navigator which has no animations on web.
// so this is a workaround to get the animations working.
const RootStack = createStackNavigator<RootStackParamList>();

// Injects a style tag to remove the ugly focus outline on web TextInput
export const injectWebCss = () => {
  const style = document.createElement("style");
  // biome-ignore lint/style/noUnusedTemplateLiteral: <explanation>
  style.textContent = `textarea, select, input, button { outline: none!important; }`;
  return document.head.append(style);
};

function App() {
  "use memo";

  injectWebCss();

  return (
    <RootStack.Navigator screenOptions={{ animationEnabled: true }}>
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
            cardStyle: {
              flex: 1,
            },
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
