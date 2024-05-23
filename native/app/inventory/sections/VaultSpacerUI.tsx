import { View } from "react-native";

type Props = {
  readonly size: number;
};

export default function VaultSpacer({ size }: Props) {
  "use memo";
  return <View style={{ height: size }} />;
}
