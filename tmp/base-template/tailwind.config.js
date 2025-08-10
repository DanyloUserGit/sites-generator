/** @type {import('tailwindcss').Config} */
const defaultTheme = require("tailwindcss/defaultTheme");

module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx}",
    "./src/components/**/*.{js,ts,jsx,tsx}",
    "./src/app/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#00c6a2", // бірюзовий
          dark: "#009f83",
        },
        accent: "#f39200", // яскравий помаранчевий акцент
        navy: {
          DEFAULT: "#20222b",
          light: "#2f313d",
        },
        gray: {
          light: "#f7f7f7",
          DEFAULT: "#9b9b9b",
          dark: "#4a4a4a",
        },
        white: "#ffffff",
        black: "#000000",
      },
      fontFamily: {
        sans: ["Open Sans", ...defaultTheme.fontFamily.sans],
      },
      borderRadius: {
        lg: "6px",
        xl: "10px",
      },
      spacing: {
        section: "6rem",
      },
      boxShadow: {
        card: "0 10px 30px rgba(0, 0, 0, 0.1)",
        navbar: "0 2px 10px rgba(0, 0, 0, 0.06)",
      },
    },
  },
  plugins: [],
};
