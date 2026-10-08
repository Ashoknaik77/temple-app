/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['system-ui', '-apple-system', 'Segoe UI', 'Roboto', 'Noto Sans', 'Noto Sans Kannada', 'sans-serif'],
      },
      colors: {
        temple: {
          50: '#fdf8f0',
          100: '#faefd9',
          500: '#d97706',
          600: '#b45309',
          700: '#92400e',
        },
        maroon: {
          600: '#9d174d',
          700: '#831843',
          800: '#651234',
        },
      },
    },
  },
  plugins: [],
};
