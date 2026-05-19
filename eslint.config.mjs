import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";
import { defineConfig, globalIgnores } from "eslint/config";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // ESLint 10: eslint-plugin-react auto React version detection calls removed
  // context APIs — explicit version avoids that path (see vercel/next.js#89764).
  {
    settings: {
      react: { version: "19" },
    },
  },
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    // Node CLI (tsx); not a React module — avoids react plugin edge cases on this file.
    "scripts/**",
  ]),
]);

export default eslintConfig;
