import type { Config } from "tailwindcss";

export default {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        paper: "#FFFFFF",
        mist: "#F5F5F5",
        ink: "#111111",
        graphite: "#1A1A1C",
        stone: "#6B6B6B",
        line: "#D8D8D8",
      },
      fontFamily: {
        sans: ["var(--font-sans)", "ui-sans-serif", "system-ui", "sans-serif"],
        mono: ["var(--font-mono)", "ui-monospace", "monospace"],
      },
      letterSpacing: { tightest: "-0.045em" },
      maxWidth: { site: "1280px" },
    },
  },
  plugins: [],
} satisfies Config;
