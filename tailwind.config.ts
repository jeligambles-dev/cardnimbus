import type { Config } from "tailwindcss";

// Tailwind v4 uses CSS @theme for design tokens (see src/app/globals.css).
// This file exists for editor tooling / explicit configuration.
const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  darkMode: "class",
  theme: {
    extend: {},
  },
  plugins: [],
};

export default config;
