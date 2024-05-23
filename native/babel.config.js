module.exports = function (api) {
  api.cache(true);
  return {
    presets: ["babel-preset-expo"],
    env: {
      production: {
        plugins: [
          "babel-plugin-react-compiler",
          {
            runtimeModule: "react-compiler-runtime",
          },
          "react-native-reanimated/plugin",
        ],
      },
    },
  };
};
