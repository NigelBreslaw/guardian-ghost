import { useEffect } from "react";
import { View } from "react-native";
import Animated, {
  Easing,
  useAnimatedProps,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from "react-native-reanimated";
import Svg, { Circle, G } from "react-native-svg";

type SpinnerProps = {
  color?: string;
};

export default function Spinner(props: SpinnerProps) {
  const AnimatedCircle = Animated.createAnimatedComponent(Circle);
  const CIRCUMFERENCE = 50;
  const R = CIRCUMFERENCE / (2 * Math.PI);
  const STROKE_WIDTH = 3;
  const HALF_CIRCLE = R + STROKE_WIDTH;
  const DIAMETER = 2 * HALF_CIRCLE;

  const progress = useSharedValue(0);
  const rotation = useSharedValue(0);

  useEffect(() => {
    startAnimation();
  }, []);

  function startAnimation() {
    progress.value = withTiming(0.6, { duration: 1000 });

    progress.value = withRepeat(
      withSequence(withTiming(0.7, { duration: 800 }), withTiming(0.1, { duration: 2000 })),
      -1,
      true,
    );

    rotation.value = withRepeat(withTiming(360, { duration: 900, easing: Easing.linear }), -1, false);
  }

  const animatedCircleProps = useAnimatedProps(() => {
    return {
      strokeDashoffset: CIRCUMFERENCE * (1 - progress.value),
    };
  }, []);

  const animatedViewStyle = useAnimatedStyle(() => {
    return {
      // biome-ignore lint/style/useTemplate: <explanation>
      transform: [{ rotate: rotation.value + "deg" }],
    };
  }, []);
  return (
    <View style={{ justifyContent: "center", alignItems: "center" }}>
      <Animated.View style={animatedViewStyle}>
        <Svg width={DIAMETER} height={DIAMETER} viewBox={`0 0 ${DIAMETER} ${DIAMETER}`}>
          <G origin={`${HALF_CIRCLE}, ${HALF_CIRCLE}`} rotation={"-90"}>
            <AnimatedCircle
              cx={"50%"}
              cy={"50%"}
              r={R}
              animatedProps={animatedCircleProps}
              strokeWidth={STROKE_WIDTH}
              stroke={props.color ?? "white"}
              fill={"transparent"}
              strokeDasharray={CIRCUMFERENCE}
            />
          </G>
        </Svg>
      </Animated.View>
    </View>
  );
}
