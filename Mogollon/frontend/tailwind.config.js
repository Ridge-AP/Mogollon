/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        "gold-light": "#FFEB99",
        gold:        "#FFD700",
        "gold-dark": "#CCA300",
      }
    },
  },
  plugins: [],
};
