/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Arial', 'Helvetica', 'sans-serif'],
      },
      colors: {
        bronze: {
          50: '#fdf8f0',
          100: '#f9edd8',
          200: '#f2d8af',
          300: '#e9bc7d',
          400: '#df9a4a',
          500: '#d6812c',
          600: '#c76a22',
          700: '#a5511f',
          800: '#854220',
          900: '#6c371d',
        },
        accent: {
          50: '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#116dff',
          600: '#0b5cd5',
          700: '#0a4cad',
          800: '#0d3b87',
          900: '#0a2d6b',
        },
      },
    },
  },
  plugins: [],
}
