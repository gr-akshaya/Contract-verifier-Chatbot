/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: {
          50: "#fff7ed",
          100: "#ffedd5",
          200: "#ffd9aa",
          300: "#ffc585",
          400: "#ffa02f",
          500: "#ff9900",
          600: "#f97b34",
          700: "#ea5f24",
          800: "#dd4c0e",
          900: "#c43d00",
          950: "#7c2500",
        },
        dark: {
          700: "#1f2937",
          // 800: "#1a1b1e",
          // 900: "#141517",
        },
      },
    },
  },
  plugins: [],
};
