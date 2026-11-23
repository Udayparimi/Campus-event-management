export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Poppins", "Segoe UI", "Roboto", "Helvetica", "Arial", "sans-serif"],
      },
      colors: {
        primary: {
          50: "#f2edff",
          100: "#ded7f7",
          200: "#acd8ce",
          300: "#83c3b4",
          400: "#4da593",
          500: "#5741bd",
          600: "#3b29a7",
          700: "#302489",
          800: "#25215c",
          900: "#212044",
        },
        accent: {
          50: "#fff7ea",
          100: "#ffead0",
          400: "#efbc77",
          500: "#ad6b29",
          600: "#905326",
        },
        glow: {
          400: "#22d3ee",
          500: "#06b6d4",
        },
      },
      backgroundImage: {
        "hero-gradient": "linear-gradient(100deg, #26223e, #25213b)",
        "brand-gradient": "linear-gradient(100deg, #4931aa, #6050ce)",
        "card-glow": "radial-gradient(circle at top left, rgba(21,83,70,0.15), transparent 55%)",
      },
      boxShadow: {
        glow: "0 0 0 1px rgba(21,83,70,0.08), 0 8px 30px -8px rgba(21,83,70,0.35)",
        "glow-pink": "0 8px 30px -8px rgba(18,77,68,0.45)",
      },
      keyframes: {
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-12px)" },
        },
        "fade-in-up": {
          "0%": { opacity: "0", transform: "translateY(16px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "fade-in": {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        "scale-in": {
          "0%": { opacity: "0", transform: "scale(0.94)" },
          "100%": { opacity: "1", transform: "scale(1)" },
        },
        "pulse-glow": {
          "0%, 100%": { boxShadow: "0 0 0 0 rgba(21,83,70,0.4)" },
          "50%": { boxShadow: "0 0 0 8px rgba(21,83,70,0)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-400px 0" },
          "100%": { backgroundPosition: "400px 0" },
        },
        "gradient-x": {
          "0%, 100%": { backgroundPosition: "0% 50%" },
          "50%": { backgroundPosition: "100% 50%" },
        },
      },
      animation: {
        float: "float 6s ease-in-out infinite",
        "float-slow": "float 9s ease-in-out infinite",
        "fade-in-up": "fade-in-up 0.5s ease-out both",
        "fade-in": "fade-in 0.4s ease-out both",
        "scale-in": "scale-in 0.25s ease-out both",
        "pulse-glow": "pulse-glow 2.2s ease-out infinite",
        shimmer: "shimmer 1.6s linear infinite",
        "gradient-x": "gradient-x 6s ease infinite",
      },
    },
  },
  plugins: [],
};
