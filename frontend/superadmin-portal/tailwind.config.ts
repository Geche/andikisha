import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "../../packages/ui/src/**/*.{js,ts,jsx,tsx}",
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
        "near-black": "#02110c",
        whatsapp: "#25d366",
        error: "#ef4444",
      },
      fontFamily: {
        display: ["var(--font-montserrat)", "sans-serif"],
        body: ["var(--font-montserrat)", "sans-serif"],
        mono: ["var(--font-dm-mono)", "monospace"],
      },
    },
  },
  plugins: [],
};

export default config;
