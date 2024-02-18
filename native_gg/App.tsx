import { NavigationContainer } from "@react-navigation/native";
import { clientID } from "./src/constants/env.ts";
import Director from "./src/views/Director.tsx";

export default function App() {
  if (process.env.NODE_ENV === "development" && clientID === undefined) {
    console.warn("No .ENV file found. Please create one.");
  }

  return (
    <NavigationContainer>
      <Director />
    </NavigationContainer>
  );
}
