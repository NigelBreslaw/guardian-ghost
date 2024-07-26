// Temp hack for now to stop text scaling
import { Text as RNText } from "react-native";

type Props = React.ComponentProps<typeof RNText>;

export default function Text({ children, ...props }: Props) {
  return (
    <RNText allowFontScaling={false} {...props}>
      {children}
    </RNText>
  );
}
