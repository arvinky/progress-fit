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
          blue: '#2563eb',    // Bright Royal Blue
        },
        accent: {
          DEFAULT: '#10b981', // Vibrant Emerald Green
          light: '#34d399',   // Light Mint Green
        },
        warning: {
          DEFAULT: '#f97316', // Sunset Orange
        },
        danger: {
          DEFAULT: '#ef4444', // Bright Red
        },
        card: {
          DEFAULT: '#ffffff', // Pure White Cards
          border: '#e2e8f0',  // Light slate border
        },
        background: '#f8fafc', // Clean Light Slate Background
        text: {
          DEFAULT: '#0f172a', // Deep Navy Slate
          muted: '#64748b',   // Cool Slate Grey
        }
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
