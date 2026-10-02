import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#fffbeb",
          100: "#fef3c7",
          200: "#fde68a",
          300: "#fcd34d",
          400: "#fbbf24",
          500: "#f59e0b", // Saffron / Warm Amber
          600: "#d97706",
          700: "#b45309",
          800: "#92400e", // Espresso Bronze
          900: "#78350f",
          950: "#451a03",
        },
        surface: {
          light: "#faf9f6",
          card: "#ffffff",
          dark: "#0d0e12",
          cardDark: "#16171d",
        },
        neutral: {
          850: "#1a1b22",
        },
      },
      fontFamily: {
        display: ["Outfit", "sans-serif"],
        sans: ["Inter", "system-ui", "sans-serif"],
      },
      boxShadow: {
        warm: "0 10px 25px -5px rgba(245, 158, 11, 0.15), 0 8px 10px -6px rgba(245, 158, 11, 0.1)",
        elevated: "0 14px 34px -10px rgba(0, 0, 0, 0.08)",
        "warm-glow": "0 0 25px -5px rgba(245, 158, 11, 0.25)",
        "dark-card": "0 10px 30px -10px rgba(0, 0, 0, 0.5)",
      },
    },
  },
  plugins: [],
};

export default config;

