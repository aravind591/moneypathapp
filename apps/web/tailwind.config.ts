import type { Config } from "tailwindcss";

// MoneyPath theme — dark, green-tinted, derived from the dashboard mockup.
const config: Config = {
  darkMode: "class",
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Backgrounds, darkest to lightest.
        base: "#0a0e0c", // page background (near-black, green tint)
        surface: "#11150f", // card background
        "surface-2": "#161b14", // raised/hover card
        border: "#23291f", // subtle card borders
        // Brand green.
        brand: {
          DEFAULT: "#3ee27a",
          dark: "#2bbf63",
          light: "#5cf093",
          glow: "#3ee27a33",
        },
        // Status colors.
        warning: "#e0b341",
        danger: "#ef5350",
        info: "#4f9dff",
        // Text.
        "text-primary": "#f2f5f0",
        "text-muted": "#8a948280",
        "text-secondary": "#9aa596",
      },
      borderRadius: {
        card: "16px",
      },
      fontFamily: {
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
        // Monospace for IDs (MP-2025-00847) and ₹ amounts, matching the mockups.
        mono: ["ui-monospace", "Menlo", "Consolas", "SFMono-Regular", "monospace"],
      },
    },
  },
  plugins: [],
};

export default config;
