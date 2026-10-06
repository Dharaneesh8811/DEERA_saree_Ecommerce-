/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],

  theme: {
    extend: {
      colors: {
        nera: {
          ivory: "#FAF6EE",
          sand: "#F1E5D0",
          wine: "#651B2E",
          espresso: "#241A18",
          gold: "#C6A15B",
          rose: "#D8B8A8",
          white: "#FFFDF8",
        },
      },

      fontFamily: {
        sans: [
          "Inter",
          "Arial",
          "sans-serif",
        ],

        serif: [
          "Georgia",
          "Times New Roman",
          "serif",
        ],
      },

      maxWidth: {
        "nera": "1440px",
      },

      boxShadow: {
        luxury: "0 15px 45px rgba(36, 26, 24, 0.08)",
      },

      letterSpacing: {
        luxury: "0.18em",
      },
    },
  },

  plugins: [],
};