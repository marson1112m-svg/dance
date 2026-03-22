/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#6b38d4',
        'primary-container': '#eaddff',
        secondary: '#ffb800',
        'secondary-container': '#ffe082',
        background: '#f8f9fc',
        surface: '#ffffff',
        'surface-container': '#f3f4f6',
        'on-surface': '#1b1b1f',
        'on-surface-variant': '#46464f',
        outline: '#777680',
        'outline-variant': '#c7c5d0',
      },
      fontFamily: {
        headline: ['"Outfit"', 'sans-serif'],
        body: ['"Inter"', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
