const { getSentryExpoConfig } = require("@sentry/react-native/metro");
const { withNativeWind } = require("nativewind/metro");
const config = getSentryExpoConfig(__dirname);

config.resolver.assetExts = config.resolver.assetExts.filter((ext) => ext !== "svg");
config.resolver.sourceExts.push("svg");
config.transformer.babelTransformerPath = require.resolve("react-native-svg-transformer");

module.exports = withNativeWind(config, { input: "./global.css" });
