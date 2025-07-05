module.exports = {
  content: [
    "./src/**/*.{html,js,jsx}",
    "./src/index.js",
    "./src/components/Wave.js",
    "./public/index.html"
  ],
  theme: {
    extend: {
    
      colors: {
        maroon: "#500000",
        blackX: "#141414"
      },
      fontFamily: {
        poppins: ['Poppins', 'sans-serif'],
      },
      keyframes: {
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
      },
    },
  },
  plugins: [],
}