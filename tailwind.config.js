module.exports = {
  content: ['./src/**/*.{html,ts}'],
  darkMode: ['class', 'body.dark'],
  corePlugins: {
    preflight: false
  },
  theme: {
    extend: {
      fontFamily: {
        display: ['Manrope', 'Segoe UI', 'sans-serif'],
        body: ['Inter', 'Segoe UI', 'sans-serif']
      },
      boxShadow: {
        glass: '0 24px 60px rgba(15, 23, 42, 0.2)'
      }
    }
  },
  plugins: []
};
