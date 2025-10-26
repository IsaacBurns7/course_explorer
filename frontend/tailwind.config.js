const colors = require('tailwindcss/colors')

module.exports = {
  content: [
    "./src/**/*.{html,js,jsx,png}",
    "./src/index.js",
    "./src/components/Wave.js",
    "./public/index.html"
  ],
  safelist: [
    {
      pattern: /text-\[\d+px\]/,  // allows text-[1px], text-[10px], etc.
    },
  ],
  theme: {
    extend: {
      fontSize: {
        '2xs': '0.625rem', // 10px
      },
      colors: {
        // Dark theme colors for #1B1111 background
        "dark-card": "#141414",     
"dark-header": "#141414",    
"dark-semester": "#500000",
"dark-semester-closed": "#330000",   
"dark-hover": "#442828",      
"dark-border": "#5a3a3a",  
"dark-accent": "#704040",    
"dark-input": "#241616", 
"dark-select": "#6E2E2E",

        // Light mode colors
        "light-bg": "#FFFFFF",
        "light-card": "#F5F5F0",  // off-white
        "light-border": "#D0D0C0",
        "light-input": "#FFFFFF",
        "light-text": "#1B1111",
        "light-text-secondary": "#5F5F5F",

        // Cohesive badge colors for dark theme - warmer, maroon-based palette
        "blue-dark": "#2C4563",      // Warmer dark blue
        "blue-light": "#7BA3CC",     // Softer blue-gray
        "yellow-dark": "#665229",    // Warmer gold-brown
        "yellow-light": "#D4B17A",   // Softer gold
        "green-dark": "#2D5140",     // Warmer forest green
        "green-light": "#7FAA92",    // Softer sage
        "red-dark": "#5F1E2A",       // Keep maroon-red
        "red-light": "#C97980",      // Softer rose
        "purple-dark": "#4A3052",    // Warmer purple
        "purple-light": "#B299C0",   // Softer lavender
        "emerald-dark": "#2B5D4A",   // Warmer teal
        "emerald-light": "#7DAA95",  // Softer teal

        // Extra A&M theme
        maroon: "#500000",
        blackX: "#141414",
        background: "#1B1111",
        beige: {
          light: "#F5F5DC",  // normal beige
          dark: "#A49382",   // dark beige
        },
        blanched_almond: "#FFEBCD",
        ...colors
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      fontFamily: {
        poppins: ['Poppins', 'sans-serif'],
      },
      keyframes: {
        'slide-in-top': {
          '0%': { transform: 'translateY(-100%)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        waveRotate: {
          '0%': {
            transform: 'translate(-50%, -75%) rotate(0deg)',
          },
          '100%': {
            transform: 'translate(-50%, -75%) rotate(360deg)',
          },
        },
      },
      animation: {
        wave1: 'waveRotate 5s linear infinite',
        wave2: 'waveRotate 10s linear infinite',
        wave3: 'waveRotate 15s linear infinite',
        'slide-in-top': 'slide-in-top 0.3s ease-out',
      },
    },
  },
  plugins: [],
}