import globals from "globals";
import pluginJs from "@eslint/js";
import tseslint from "typescript-eslint";
import comp from "eslint-plugin-react-compiler";

export default [
  { languageOptions: { globals: globals.browser } },
  pluginJs.configs.recommended,
  ...tseslint.configs.recommended,
  comp.configs,
];
