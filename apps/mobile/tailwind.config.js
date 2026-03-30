/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./App.{js,jsx,ts,tsx}", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: '#0284c7', // Sky 600
        secondary: '#64748b', // Slate 500
        success: '#16a34a', // Green 600
        danger: '#dc2626', // Red 600
        warning: '#ca8a04', // Yellow 600
        background: '#f8fafc', // Slate 50
        card: '#ffffff',
      }
    },
  },
  plugins: [],
}
