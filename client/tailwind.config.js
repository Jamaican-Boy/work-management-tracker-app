/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
          primary : '#8697c4'
      }
    },
  },
  plugins: [],
  corePlugins: {
    preflight: false,
  },
}