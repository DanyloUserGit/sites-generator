/** @type {import('tailwindcss').Config} */
const config = {
  content: ['./src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#1e40af', 
          light: '#3b82f6', 
          dark: '#1e3a8a',
        },
        neutral: {
          900: '#0f0f0f', 
          800: '#1f1f1f',
          700: '#2f2f2f',
          600: '#3f3f3f',
          500: '#525252', 
          400: '#737373',
          300: '#a3a3a3',
          200: '#d4d4d4',
          100: '#e5e5e5',
          50: '#f5f5f5',
        },
        accent: {
          DEFAULT: '#2563eb', 
          hover: '#1d4ed8',
          subtle: '#93c5fd',
        },
        danger: {
          DEFAULT: '#dc2626',
          hover: '#b91c1c',
        },
        success: {
          DEFAULT: '#16a34a',
          hover: '#15803d',
        },
      },
    },
  },
  plugins: [],
};
export default config;
