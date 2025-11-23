import type { KnipConfig } from "knip";

const config: KnipConfig = {
  entry: [
    // Expo Router entry point - expo-router/entry handles routing
    // Route files in app/ are automatically entry points
  ],
  project: [
    // All TypeScript/TSX files in app directory
    "app/**/*.{ts,tsx}",
    // Component files
    "components/**/*.{ts,tsx}",
    // Library files
    "lib/**/*.{ts,tsx}",
  ],
  ignore: [
    // Native platform code
    "android/**",
    "ios/**",
    // Dependencies
    "node_modules/**",
    // Build outputs
    "**/build/**",
    "**/dist/**",
    // Test files (if any)
    "**/*.test.{ts,tsx}",
    "**/*.spec.{ts,tsx}",
    // Config files
    "**/*.config.{js,ts}",
    "babel.config.js",
    "metro.config.js",
    "tailwind.config.js",
    // Public assets
    "public/**",
    "assets/**",
    "images/**",
    // Generated files
    "app/core/generated/**",
  ],
};

export default config;

