/** @type {import('tailwindcss').Config} */
module.exports = {
  // NOTE: Update this to include the paths to all of your component files.
  content: [
    "./app/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}",
    "./lib/**/*.{js,jsx,ts,tsx}",
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        // Custom orange theme colors
        primary: {
          DEFAULT: '#FF6B35',
          light: '#FF8C5A',
          dark: '#E55A25',
        },
        // Dark mode variants
        'primary-dark': {
          DEFAULT: '#FF8C5A',
          light: '#FFA875',
          dark: '#FF6B35',
        },
        // Additional theme colors
        background: {
          light: '#FFFFFF',
          dark: '#000000',
        },
        surface: {
          light: '#F2F2F7',
          dark: '#1C1C1E',
        },
        text: {
          primary: {
            light: '#11181C',
            dark: '#ECEDEE',
          },
          secondary: {
            DEFAULT: '#8E8E93',
            light: '#8E8E93',
            dark: '#8E8E93',
          },
        },
        icon: {
          DEFAULT: '#8E8E93',
          light: '#687076',
          dark: '#9BA1A6',
        },
        accent: '#E8965A',
        ios: {
          blue: '#007AFF',
          green: '#34C759',
          orange: '#FF9500',
          red: '#FF3B30',
        },
      },
    },
  },
  plugins: [],
}
