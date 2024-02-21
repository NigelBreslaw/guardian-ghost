import { StyleSheet } from "react-native";
import Director from "./screens/Director";
import { DirectorProps } from "./screens/types";

export default function AuthScreen(props: DirectorProps) {
  return <Director state={props.state} />;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
  },
  separator: {
    marginVertical: 30,
    height: 1,
    width: "80%",
  },
});
