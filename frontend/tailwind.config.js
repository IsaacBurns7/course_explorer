const colors = require('tailwindcss/colors')

module.exports = {
  content: [
    "./src/**/*.{html,js,jsx,png}",
    "./src/index.js",
    "./src/components/Wave.js",
    "./public/index.html"
  ],
  theme: {
    extend: {
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

        // Badge colors for dark theme
        "blue-dark": "#1E3A5F",
        "blue-light": "#93C5FD",
        "yellow-dark": "#5F4E1E",
        "yellow-light": "#FDE68A",
        "green-dark": "#1E5F3A",
        "green-light": "#86EFAC",
        "red-dark": "#5F1E2A",
        "red-light": "#FCA5A5",
        "purple-dark": "#3F1E5F",
        "purple-light": "#D8B4FE",
        "emerald-dark": "#064E3B",
        "emerald-light": "#6EE7B7",

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