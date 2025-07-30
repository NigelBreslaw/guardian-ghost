module.exports = function (api) {
  api.cache(true);
  return {
    presets: [["babel-preset-expo", { jsxImportSource: "nativewind" }], "nativewind/babel"],
    plugins: [
      [
        "babel-plugin-react-compiler",
        {
          compilationMode: "annotation",
          target: "19",
        },
      ],
      "react-native-worklets/plugin",
    ],
  };
};
