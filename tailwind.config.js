/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./*.html",
    "./blog/*.html"
  ],
  theme: {
    extend: {
      colors: {
        ink: '#1d1d1f',
        sub: '#6e6e73',
        line: '#d2d2d7',
        surface: '#f5f5f7',
        brand: {
          DEFAULT: '#2596be',
          dark: '#1b7a9c',
          light: '#e8f4f9'
        }
      },
      fontFamily: {
        sans: ['-apple-system', 'BlinkMacSystemFont', '"SF Pro Display"', '"SF Pro Text"', '"Helvetica Neue"', 'Helvetica', 'Arial', 'sans-serif']
      }
    }
  },
  plugins: []
}
