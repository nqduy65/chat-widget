/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        lato: ["Lato", "sans-serif"],
      },
      screens: {
        xs: { max: "600px" },
      },
      keyframes: {
        typing: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
      },
      animation: {
        typing: "typing 0.1s steps(10) forwards",
      },
    },
  },
  plugins: [],
};
