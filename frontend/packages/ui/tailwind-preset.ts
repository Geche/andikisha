const preset = {
  content: [] as string[],
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
        neutral: {
          900: "#111111",
          800: "#1f2937",
          700: "#374151",
          600: "#4b5563",
          500: "#6b7280",
          400: "#9ca3af",
          300: "#d1d5db",
          200: "#e5e7eb",
          100: "#f3f4f6",
          50:  "#fafafa",
        },
        "near-black": "#02110c",
        whatsapp: "#25d366",
        error: "#ef4444",
      },
      fontFamily: {
        display: ["var(--font-roboto)", "Roboto", "sans-serif"],
        body: ["var(--font-roboto)", "Roboto", "sans-serif"],
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
    },
  },
  plugins: [] as never[],
};

export default preset;
