module.exports = {
  content: ['./src/**/*.{js,jsx}', './public/index.html'],
  theme: {
    extend: {
      dropShadow: {
        glow: [
          "0 0px 10px rgba(255, 255, 255, 0.1)",
          "0 0px 60px rgba(255, 255, 255, 0.1)",
        ],
      },
      animation: {
        'fade-in-up': 'fadeInUp 0.3s ease-out forwards',
      },
      keyframes: {
        fadeInUp: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' }
        }
      }
    },
  },
  plugins: [],
};