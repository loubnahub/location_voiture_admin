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
       animation: {
        'spin-slow': 'spin 3s linear infinite',
         'marquee': 'marquee 40s linear infinite',

      }
    },
     resolve: {
     extensions: ['.mjs', '.js', '.jsx', '.ts', '.tsx'],
  },
    keyframes: {
        marquee: {
          '0%': { transform: 'translateX(0%)' },
          '100%': { transform: 'translateX(-50%)' },
        }
      },

  },
  plugins: [],
}