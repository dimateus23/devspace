/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
      },
      colors: {
        accent: '#0070f3',
        'accent-hover': '#338ef7',
        surface: '#0a0a0a',
        elevated: '#111111',
        border: {
          DEFAULT: '#1a1a1a',
          hover: '#2a2a2a',
          strong: '#333333',
        },
        fg: {
          DEFAULT: '#ffffff',
          muted: '#888888',
          subtle: '#555555',
        },
      },
      keyframes: {
        'fade-up': {
          '0%': { opacity: '0', transform: 'translateY(16px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'like-pop': {
          '0%': { transform: 'scale(1)' },
          '40%': { transform: 'scale(1.5)' },
          '70%': { transform: 'scale(0.9)' },
          '100%': { transform: 'scale(1)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
      animation: {
        'fade-up': 'fade-up 0.5s ease forwards',
        'like-pop': 'like-pop 0.35s ease',
        shimmer: 'shimmer 2s linear infinite',
      },
    },
  },
  plugins: [],
}
