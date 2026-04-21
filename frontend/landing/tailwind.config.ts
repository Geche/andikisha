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
      },
      fontFamily: {
        display: ["var(--font-bricolage)", "sans-serif"],
        body: ["var(--font-dm-sans)", "sans-serif"],
        mono: ["var(--font-dm-mono)", "monospace"],
      },
      animation: {
        float: "float 4s ease-in-out infinite",
        "pulse-dot": "pulseDot 2s ease-in-out infinite",
        "fade-up": "fadeUp 0.6s ease forwards",
        "slide-in-right": "slideInRight 0.5s ease forwards",
      },
      keyframes: {
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-10px)" },
        },
        pulseDot: {
          "0%, 100%": { opacity: "1", transform: "scale(1)" },
          "50%": { opacity: "0.6", transform: "scale(1.3)" },
        },
        fadeUp: {
          from: { opacity: "0", transform: "translateY(24px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        slideInRight: {
          from: { opacity: "0", transform: "translateX(20px)" },
          to: { opacity: "1", transform: "translateX(0)" },
        },
      },
      backgroundImage: {
        "hero-gradient":
          "linear-gradient(135deg, #071e13 0%, #0b3d2e 45%, #0f5040 100%)",
        "hero-dots":
          "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='60' height='60'%3E%3Ccircle cx='30' cy='30' r='1' fill='rgba(255,255,255,0.04)'/%3E%3C/svg%3E\")",
      },
      typography: {
        DEFAULT: {
          css: {
            maxWidth: "none",
            color: "#404040",
            lineHeight: "1.85",
            p: { marginBottom: "1.25rem" },
            h2: {
              fontFamily: "var(--font-bricolage), sans-serif",
              fontWeight: "700",
              color: "#171717",
            },
            h3: {
              fontFamily: "var(--font-bricolage), sans-serif",
              fontWeight: "600",
              color: "#171717",
            },
            strong: { color: "#171717" },
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
