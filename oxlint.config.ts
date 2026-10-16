import { defineConfig } from "oxlint";
import core from "ultracite/oxlint/core";
import next from "ultracite/oxlint/next";
import react from "ultracite/oxlint/react";

export default defineConfig({
  extends: [core, react, next],
  ignorePatterns: [
    ...(core.ignorePatterns ?? []),
    ".agents/**",
    ".claude/**",
    "tools/oxlint/anti-slop/**",
  ],
  jsPlugins: [
    { name: "anti-slop", specifier: "./tools/oxlint/anti-slop/index.ts" },
    { name: "convex", specifier: "@convex-dev/eslint-plugin" },
    { name: "no-comments", specifier: "./tools/oxlint/no-comments.ts" },
  ],
  options: { typeAware: true, typeCheck: true },
  overrides: [
    // WORKAROUND: Convex's ConvexProviderWithAuth takes the auth hook as a prop: https://docs.convex.dev/auth/advanced/custom-auth
    {
      files: ["app/dashboard/providers.tsx"],
      rules: { "react/hooks": "off" },
    },
    {
      files: ["convex/**/*.ts"],
      rules: {
        "convex/explicit-table-ids": "error",
        "convex/import-wrong-runtime": "error",
        "convex/no-collect-in-query": "error",
        "convex/no-duplicate-indexes": "error",
        "convex/no-filter-in-query": "error",
        "convex/no-old-registered-function-syntax": "error",
        "convex/no-process-env": "error",
        "convex/no-schema-import-cycle": "error",
        "convex/require-args-validator": "error",
      },
    },
  ],
  rules: {
    "anti-slop/no-array-filter-map": "error",
    "anti-slop/no-chained-type-assertions": "error",
    "anti-slop/no-conditional-empty-object-spread": "error",
    "anti-slop/no-known-value-widening": "error",
    "anti-slop/no-module-mocking": "error",
    "anti-slop/no-object-parameters": "error",
    "anti-slop/no-reduce-accumulator-copy": "error",
    "anti-slop/no-reflect-apply": "error",
    "anti-slop/no-reflect-get": "error",
    "anti-slop/no-runtime-typeof": "error",
    "anti-slop/no-shape-in-symbol-names": "error",
    "anti-slop/no-unknown-parameters": "error",
    "anti-slop/no-unknown-returns": "error",
    "anti-slop/no-unknown-type-aliases": "error",
    "anti-slop/no-unsafe-dictionary-type": "error",
    "anti-slop/no-widen-then-assert": "error",
    "anti-slop/require-readable-spacing": "error",
    "anti-slop/require-safety-comment-for-type-assertion": "error",
    "no-comments/no-comments": "error",
    "oxc/no-accumulating-spread": "error",
    "typescript/consistent-indexed-object-style": "off",
    "unicorn/no-immediate-mutation": "off",
    "unicorn/prefer-reflect-apply": "off",
  },
});
