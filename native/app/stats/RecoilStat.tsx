import { View, StyleSheet, Text } from "react-native";
import Svg, { Circle, Line, Path } from "react-native-svg";

/**
 * A value from 100 to -100 where positive is right and negative is left and zero is straight up
 * See https://imgur.com/LKwWUNV
 */
function recoilDirection(value: number) {
  return Math.sin((value + 5) * (Math.PI / 10)) * (100 - value);
}

/**
 * A value from 0 to 100 describing how straight up and down the recoil is, for sorting
 */
export function recoilValue(value: number) {
  const deviation = Math.abs(recoilDirection(value));
  return 100 - deviation + value / 100000;
}

// How much to bias the direction towards the center - at 1.0 this would mean recoil would swing ±90°
const verticalScale = 0.8;
// The maximum angle of the pie, where zero recoil is the widest and 100 recoil is the narrowest
const maxSpread = 180; // degrees

type Props = {
  value: number;
};

export default function RecoilStat({ value }: Props) {
  "use memo";
  const direction = recoilDirection(value) * verticalScale * (Math.PI / 180); // Convert to radians
  const x = Math.sin(direction);
  const y = Math.cos(direction);

  const spread =
    // Higher value means less spread
    ((100 - value) / 100) *
    // scaled by the spread factor (halved since we expand to either side)
    (maxSpread / 2) *
    // in radians
    (Math.PI / 180) *
    // flipped for negative
    Math.sign(direction);
  const xSpreadMore = Math.sin(direction + spread);
  const ySpreadMore = Math.cos(direction + spread);
  const xSpreadLess = Math.sin(direction - spread);
  const ySpreadLess = Math.cos(direction - spread);

  const HEIGHT = 18;
  return (
    <View style={{ height: HEIGHT, flexDirection: "row", gap: 5 }}>
      <Text style={styles.valueText}>{value}</Text>
      <Svg height="15" width="30" viewBox="0 0 2 1">
        <Circle r={1} cx={1} cy={1} fill="#666" />
        {value >= 95 ? (
          <Line x1={1 - x} y1={1 + y} x2={1 + x} y2={1 - y} stroke="white" strokeWidth="0.1" />
        ) : (
          <Path
            d={`M1,1 L${1 + xSpreadMore},${1 - ySpreadMore} A1,1 0 0,${direction < 0 ? "1" : "0"} ${1 + xSpreadLess},${
              1 - ySpreadLess
            } Z`}
            fill="#FFF"
          />
        )}
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  valueText: {
    color: "white",
    fontSize: 14,
    fontWeight: "bold",
    includeFontPadding: false,
    paddingLeft: 10,
  },
});
