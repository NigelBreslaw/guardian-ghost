const { getSentryExpoConfig } = require("@sentry/react-native/metro");

const config = getSentryExpoConfig(__dirname);

config.resolver.sourceExts.push("svg");

config.transformer.babelTransformerPath = require.resolve("react-native-svg-transformer");

module.exports = config;
