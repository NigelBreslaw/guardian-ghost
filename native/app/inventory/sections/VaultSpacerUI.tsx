import { View } from "react-native";

type VaultSpacerProps = {
  readonly size: number;
};

function VaultSpacer(props: VaultSpacerProps) {
  return <View style={{ height: props.size }} />;
}

export default VaultSpacer;
