/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Kanit', 'sans-serif'], // Default sans
        kanit: ['Kanit', 'sans-serif'],
        prompt: ['Prompt', 'sans-serif'],
      },
      colors: {
        brand: {
          primary: '#1A7E2A',
          secondary: '#11421A',
          dark: '#144026',
          light: '#e8f5e9',
          bg: '#F5F6FA',
          teal: '#1A7E2A',
        },
        primary: '#1A7E2A',
        secondary: '#11421A',
        surface: '#FFFFFF',
      },
      animation: {
        'spin-slow': 'spin 3s linear infinite',
      }
    },
  },
  plugins: [],
}
