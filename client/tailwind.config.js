/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,jsx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: '#3b82f6',
        secondary: '#1e40af',
        accent: '#f97316',
        dark: '#0f172a',
        light: '#f8fafc',
      },
    },
  },
  plugins: [],
}
