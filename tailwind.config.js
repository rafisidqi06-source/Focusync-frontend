/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        display: ['"Sora"', 'sans-serif'],
        body: ['"Inter"', 'sans-serif'],
      },
      colors: {
        base: {
          950: '#EAF7F3',
          900: '#FFFFFF',
          850: '#FFFFFF',
          800: '#F1F8F5',
          700: '#E3EEE9',
        },
        ink: {
          100: '#0F2019',
          300: '#4B5D57',
          400: '#6B7C76',
          500: '#8B9A95',
        },
        violet: {
          400: '#0F9E86',
          500: '#0B8570',
          600: '#096B5A',
        },
        aqua: {
          400: '#22C55E',
          500: '#16A34A',
        },
        coral: {
          400: '#F4735A',
          500: '#E85C42',
        },
        amber: {
          400: '#F5A524',
        },
      },
      backgroundImage: {
        'brand-gradient': 'linear-gradient(135deg, #0B7A6B 0%, #2FBE5F 100%)',
        'card-sheen': 'linear-gradient(160deg, rgba(11,122,107,0.06) 0%, rgba(47,190,95,0.03) 100%)',
      },
      boxShadow: {
        glow: '0 10px 30px rgba(11,122,107,0.25)',
        card: '0 2px 14px rgba(15,32,25,0.06)',
      },
      borderRadius: {
        xl2: '1.75rem',
      },
      animation: {
        'fade-in': 'fadeIn 0.4s ease-out',
        'scale-in': 'scaleIn 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)',
        'fade-in-scale': 'fadeInScale 0.8s cubic-bezier(0.34, 1.56, 0.64, 1)',
        breathe: 'breathe 8s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        scaleIn: {
          '0%': { transform: 'scale(0.8)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        breathe: {
          '0%, 100%': { transform: 'scale(0.8)' },
          '50%': { transform: 'scale(1)' },
        },
        fadeInScale: {
          '0%': { opacity: '0', transform: 'scale(0.85)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
      },
    },
  },
  plugins: [],
}
