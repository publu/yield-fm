export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        mono: ['"Space Mono"', 'monospace'],
      },
      colors: {
        teal: '#00d4a8',
        purple: '#9b59d8',
        orange: '#f5a623',
        bg: '#080810',
        panel: '#0d0d1f',
        border: '#1e1e3f',
      },
    },
  },
  plugins: [],
}
