const { defineConfig } = require("eslint/config");
const path = require("path");

module.exports = defineConfig({
  parser: "@typescript-eslint/parser",
  plugins: [path.resolve(__dirname, "node_modules/@typescript-eslint")],
  extends: ["plugin:@typescript-eslint/recommended"],
  parserOptions: {
    project: "./tsconfig.json",
    sourceType: "module",
  },
  rules: {
    // Add custom rules here
  },
  ignores: ["node_modules/", "dist/", "public/"],
});
