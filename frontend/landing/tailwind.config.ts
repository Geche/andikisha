import type { Config } from "tailwindcss";
import typography from "@tailwindcss/typography";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./content/**/*.mdx",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          950: "#071e13",
          900: "#0b3d2e",
          800: "#0f5040",
          700: "#166a50",
          500: "#27a870",
          100: "#d1f5e6",
          50: "#e8f5f0",
        },
        amber: {
          DEFAULT: "#e8a020",
          dark: "#c98510",
          light: "#fef3dc",
        },
        surface: {
          DEFAULT: "#ffffff",
          alt: "#f8f7f4",
        },
        ink: {
          900: "#02110c",
          700: "#374151",
          600: "#4b5563",
          400: "#9ca3af",
          200: "#e5e7eb",
          100: "#f3f4f6",
        },
        error: "#ef4444",
        info: "#60a5fa",
      },
      fontFamily: {
        display: ["var(--font-roboto)", "Roboto", "sans-serif"],
        body: ["var(--font-roboto)", "Roboto", "sans-serif"],
        mono: ["var(--font-dm-mono)", "monospace"],
      },
      fontSize: {
        "h1-display": ["clamp(3.5rem,6.5vw,5.5rem)", { lineHeight: "0.98", letterSpacing: "-0.02em" }],
        "h2-display": ["clamp(2.25rem,4vw,3.5rem)", { lineHeight: "1.05", letterSpacing: "-0.015em" }],
      },
      animation: {
        float: "float 4s ease-in-out infinite",
        "pulse-dot": "pulseDot 2s ease-in-out infinite",
        "fade-up": "fadeUp 0.6s ease forwards",
      },
      keyframes: {
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-8px)" },
        },
        pulseDot: {
          "0%, 100%": { opacity: "1", transform: "scale(1)" },
          "50%": { opacity: "0.6", transform: "scale(1.3)" },
        },
        fadeUp: {
          from: { opacity: "0", transform: "translateY(20px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
      },
      backgroundImage: {
        "hero-gradient":
          "linear-gradient(135deg, #071e13 0%, #0b3d2e 45%, #0f5040 100%)",
      },
      typography: {
        DEFAULT: {
          css: {
            maxWidth: "none",
            color: "#4b5563",
            lineHeight: "1.85",
            p: { marginBottom: "1.25rem" },
            h2: { fontFamily: "var(--font-roboto), sans-serif", fontWeight: "700", color: "#02110c" },
            h3: { fontFamily: "var(--font-roboto), sans-serif", fontWeight: "600", color: "#02110c" },
            strong: { color: "#02110c" },
            a: { color: "#0b3d2e", textDecoration: "underline" },
            "ul > li::marker": { color: "#27a870" },
            "ol > li::marker": { color: "#27a870" },
          },
        },
      },
    },
  },
  plugins: [typography],
};

export default config;
