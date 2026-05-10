import type { Config } from "tailwindcss";

export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter", "ui-sans-serif", "system-ui"]
      },
      colors: {
        lagoon: "#0f766e",
        coral: "#f97361",
        saffron: "#f59e0b",
        skyglass: "#e0f2fe"
      },
      boxShadow: {
        soft: "0 22px 70px rgba(15, 23, 42, 0.12)"
      }
    }
  },
  plugins: []
} satisfies Config;
