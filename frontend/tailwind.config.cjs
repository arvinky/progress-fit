/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Vibrant Colorful SaaS Palette
        primary: {
          DEFAULT: '#6366f1', // Vibrant Indigo
          hover: '#4f46e5',   // Deep Indigo
          blue: '#3b82f6',    // Vibrant Royal Blue
        },
        accent: {
          DEFAULT: '#00f5ff', // Neon Cyan
          light: '#34d399',   // Light Mint Green
        },
        warning: {
          DEFAULT: '#f97316', // Sunset Orange
        },
        danger: {
          DEFAULT: '#ef4444', // Bright Red
        },
        card: {
          DEFAULT: '#0d1326', // Dark Card Background
          border: 'rgba(99, 102, 241, 0.15)',  // Neon indigo border
        },
        background: '#060913', // Obsidian Dark Background
        text: {
          DEFAULT: '#f8fafc', // Light text
          muted: '#94a3b8',   // Muted slate text
        }
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
