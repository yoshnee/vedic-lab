// Flat config. eslint-config-next v16 exports flat configs directly,
// so we spread them (no FlatCompat needed).
import coreWebVitals from "eslint-config-next/core-web-vitals";
import typescript from "eslint-config-next/typescript";

const eslintConfig = [
  {
    ignores: [
      ".next/**",
      "node_modules/**",
      "out/**",
      "design-reference/**", // read-only design-tool prototypes
    ],
  },
  ...coreWebVitals,
  ...typescript,
];

export default eslintConfig;
