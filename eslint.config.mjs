import nextConfig from "eslint-config-next";

export default [
  ...nextConfig,
  {
    ignores: [".e2e-site/**", "coverage/**", "playwright-report/**", "test-results/**"],
  },
  {
    rules: {
      "react-hooks/set-state-in-effect": "off",
      "react-hooks/purity": "off",
      "react-hooks/immutability": "off",
      "react-hooks/static-components": "off",
      "import/no-anonymous-default-export": "off",
      "@next/next/no-img-element": "off",
    }
  },
  {
    files: ["lib/application/**/*.{ts,tsx}"],
    rules: {
      "no-restricted-imports": ["error", {
        patterns: [{
          group: ["@/lib/infrastructure/*", "@/lib/infrastructure/**"],
          message: "La capa application no debe depender de infrastructure. Invierte la dependencia mediante un puerto o mueve la lógica pura a application."
        }]
      }]
    }
  }
];
