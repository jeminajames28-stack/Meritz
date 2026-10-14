/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        // Original campaign palette plus the gold from the 30th Anniversary logo.
        // Contrast values are in docs/superpowers/specs/2026-10-14-landing-redesign-design.md, section 5.1.
        brand: {
          deepest: '#3d081d',
          deep: '#5a0d2a',
          primary: '#a20f43',
          'primary-hover': '#7a1236',
          pink: '#f5b2c8',
          border: '#edc5d2',
          line: '#ead7dd',
          surface: '#fff8fa',
          soft: '#fff0f4',
          blush: '#f8e9ee',
          ink: '#1c1917',
          muted: '#6f5360',
          'input-border': '#9a8790',
          gold: '#c18912',
          'gold-text': '#87600d',
          error: '#b91c1c',
          'error-soft': '#fef2f2',
        },
      },
      fontFamily: {
        serif: ['"Instrument Serif"', 'Georgia', 'serif'],
        sans: ['Geist', 'system-ui', '-apple-system', '"Segoe UI"', 'Roboto', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
