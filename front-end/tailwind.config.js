/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
"./src/Clients/**/*.{js,jsx,ts,tsx}",
  ],
  prefix: 'tw-',
  theme: {
    extend: {
      colors: {
        'brand-amber': '#FFA600',
        'brand-blue': '#1572D3',
        'brand-bg': '#1b1b1b',
        'brand-card': '#2a2a2a', // Example for slightly lighter card bg
        'brand-surface': '#222222', // Another surface color
      },
    },
  },
  plugins: [],
}