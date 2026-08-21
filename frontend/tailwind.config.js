export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Poppins", "Segoe UI", "Roboto", "Helvetica", "Arial", "sans-serif"],
      },
      colors: {
        primary: {
          50: "#eef4ff",
          100: "#dbe6fe",
          200: "#bdd0fd",
          300: "#93b0fb",
          400: "#6186f6",
          500: "#3b5fe0",
          600: "#2f4dc4",
          700: "#263ea3",
          800: "#233482",
          900: "#212e68",
        },
        accent: {
          50: "#fdf2f8",
          100: "#fce7f3",
          400: "#f472b6",
          500: "#ec4899",
          600: "#db2777",
        },
        glow: {
          400: "#22d3ee",
          500: "#06b6d4",
        },
      },
      backgroundImage: {
        "hero-gradient": "linear-gradient(135deg, #263ea3 0%, #3b5fe0 45%, #ec4899 100%)",
        "brand-gradient": "linear-gradient(135deg, #3b5fe0 0%, #6186f6 50%, #22d3ee 100%)",
        "card-glow": "radial-gradient(circle at top left, rgba(59,95,224,0.15), transparent 55%)",
      },
      boxShadow: {
        glow: "0 0 0 1px rgba(59,95,224,0.08), 0 8px 30px -8px rgba(59,95,224,0.35)",
        "glow-pink": "0 8px 30px -8px rgba(236,72,153,0.45)",
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
          "0%, 100%": { boxShadow: "0 0 0 0 rgba(59,95,224,0.4)" },
          "50%": { boxShadow: "0 0 0 8px rgba(59,95,224,0)" },
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
