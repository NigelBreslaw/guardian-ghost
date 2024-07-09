module.exports = function (api) {
  api.cache(true);
  return {
    presets: ["babel-preset-expo", "nativewind/babel"],
    plugins: [
      [
        "babel-plugin-react-compiler",
        {
          compilationMode: "annotation",
          runtimeModule: "react-compiler-runtime",
        },
      ],
      "react-native-reanimated/plugin",
    ],
  };
};
