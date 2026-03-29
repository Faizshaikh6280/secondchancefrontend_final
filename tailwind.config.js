/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'recovery-bg': '#D9ECA2',
        'recovery-btn': '#7D9C6D',
        'recovery-accent': '#F97316', // Orange as requested
        'brain-pink': '#FBCFE8',
        'brain-dark': '#831843'
      },
      fontFamily: {
        sans: ['Nunito', 'ui-sans-serif', 'system-ui', 'sans-serif'], // Recommend Nunito for that soft, friendly feel
      }
    },
  },
  plugins: [],
}