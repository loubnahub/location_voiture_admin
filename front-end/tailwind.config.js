// tailwind.config.js

/** @type {import('tailwindcss').Config} */
module.exports = {
  prefix: 'tw-', // Adds a 'tw-' prefix to all Tailwind classes
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {},
  },
  corePlugins: {
    preflight: false, // Disables Tailwind's reset styles
  },
  plugins: [],
}