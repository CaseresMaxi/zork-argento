import js from "@eslint/js";
import globals from "globals";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import tseslint from "typescript-eslint";
import { globalIgnores } from "eslint/config";

// Function to convert all error rules to warnings recursively
function convertErrorsToWarnings(config) {
  if (!config || typeof config !== "object") return config;

  if (Array.isArray(config)) {
    return config.map(convertErrorsToWarnings);
  }

  const converted = { ...config };

  if (converted.rules) {
    const newRules = {};
    Object.entries(converted.rules).forEach(([ruleName, ruleValue]) => {
      if (ruleValue === "error" || ruleValue === 2) {
        newRules[ruleName] = "warn";
      } else if (
        Array.isArray(ruleValue) &&
        (ruleValue[0] === "error" || ruleValue[0] === 2)
      ) {
        newRules[ruleName] = ["warn", ...ruleValue.slice(1)];
      } else {
        newRules[ruleName] = ruleValue;
      }
    });
    converted.rules = newRules;
  }

  return converted;
}

// Create base configuration with all errors converted to warnings
const baseConfig = tseslint.config([
  globalIgnores(["dist"]),
  {
    files: ["**/*.{ts,tsx}"],
    extends: [
      js.configs.recommended,
      tseslint.configs.recommended,
      reactHooks.configs["recommended-latest"],
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
  },
]);

// Convert the entire configuration to use warnings instead of errors
const configWithWarnings = convertErrorsToWarnings(baseConfig);

// Add explicit rule overrides to ensure all common rules are warnings
configWithWarnings[1].rules = {
  ...configWithWarnings[1].rules,
  // TypeScript rules
  "@typescript-eslint/no-unused-vars": "warn",
  "@typescript-eslint/no-explicit-any": "warn",
  "@typescript-eslint/ban-ts-comment": "warn",
  "@typescript-eslint/no-empty-function": "warn",
  "@typescript-eslint/no-inferrable-types": "warn",
  "@typescript-eslint/prefer-as-const": "warn",
  "@typescript-eslint/no-empty-interface": "warn",
  "@typescript-eslint/no-non-null-assertion": "warn",
  "@typescript-eslint/no-var-requires": "warn",
  "@typescript-eslint/ban-types": "warn",
  "@typescript-eslint/no-this-alias": "warn",
  "@typescript-eslint/no-namespace": "warn",
  "@typescript-eslint/triple-slash-reference": "warn",

  // React Hooks rules
  "react-hooks/rules-of-hooks": "warn",
  "react-hooks/exhaustive-deps": "warn",

  // React Refresh rules
  "react-refresh/only-export-components": "warn",

  // JavaScript rules
  "no-unused-vars": "warn",
  "no-console": "warn",
  "no-debugger": "warn",
  "no-empty": "warn",
  "no-constant-condition": "warn",
  "no-undef": "warn",
  "prefer-const": "warn",
  "no-var": "warn",
  "no-unreachable": "warn",
  "no-redeclare": "warn",
  "no-dupe-keys": "warn",
  "no-duplicate-case": "warn",
  "no-empty-character-class": "warn",
  "no-ex-assign": "warn",
  "no-extra-boolean-cast": "warn",
  "no-func-assign": "warn",
  "no-inner-declarations": "warn",
  "no-invalid-regexp": "warn",
  "no-irregular-whitespace": "warn",
  "no-obj-calls": "warn",
  "no-prototype-builtins": "warn",
  "no-regex-spaces": "warn",
  "no-sparse-arrays": "warn",
  "no-unexpected-multiline": "warn",
  "use-isnan": "warn",
  "valid-typeof": "warn",
};

export default configWithWarnings;
