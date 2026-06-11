/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        mono: ['Roboto Mono', 'monospace'],
        sans: ['Inter', 'sans-serif'],
        display: ['Barlow Condensed', 'sans-serif'],
      },
      colors: {
        'dog-red': '#ff0000',
        'dog-blue': '#005eff',
        'dog-white': '#ffffff',
        'dog-black': '#111111',
        'dog-orange': '#e8760a',
        'pos-bg': '#0a0a0a',
        'pos-header': '#111111',
        'pos-green': '#1a5c2a',
        'pos-green-dark': '#0d3a1a',
        'pos-green-light': '#22c55e',
        'pos-yellow': '#f5c518',
        'pos-yellow-dark': '#d4a40a',
        'pos-red': '#cc0000',
        'pos-red-dark': '#990000',
        'pos-gray': '#1e1e1e',
        'pos-border': '#2a2a2a',
        'pos-text': '#e8e8e8',
      },
      animation: {
        'blink': 'blink 1s step-end infinite',
        'pulse-slow': 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'ticker': 'ticker 25s linear infinite',
      },
      keyframes: {
        blink: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0' },
        },
        ticker: {
          '0%': { transform: 'translateX(100%)' },
          '100%': { transform: 'translateX(-100%)' },
        },
      },
    },
  },
  plugins: [],
}
