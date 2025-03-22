module.exports = {
  content: ['./src/**/*.{js,jsx}', './public/index.html'],
  theme: {
    extend: {
      dropShadow: {
        glow: [
          "0 0px 10px rgba(255, 255, 255, 0.1)",
          "0 0px 60px rgba(255, 255, 255, 0.1)",
        ],
      }
    },
  },
  plugins: [],
};