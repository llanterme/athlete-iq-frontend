/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f0f8ff',
          100: '#e1f2fe',
          200: '#bce5fd',
          300: '#77bef0',
          400: '#77bef0',
          500: '#77bef0',
          600: '#5ba6d6',
          700: '#4a8bb3',
          800: '#3e7396',
          900: '#356278',
        },
        secondary: {
          50: '#fffbf0',
          100: '#fff5d9',
          200: '#ffe8b3',
          300: '#ffd68a',
          400: '#ffcb61',
          500: '#ffcb61',
          600: '#e6b657',
          700: '#cc9f4d',
          800: '#b38943',
          900: '#997339',
        },
        accent: {
          50: '#fff4f0',
          100: '#ffe4d9',
          200: '#ffc2b3',
          300: '#ff9b8a',
          400: '#ff894f',
          500: '#ff894f',
          600: '#e67c47',
          700: '#cc6f3f',
          800: '#b36237',
          900: '#99552f',
        },
        tertiary: {
          50: '#fdf2f4',
          100: '#fce7ea',
          200: '#f8c8d0',
          300: '#f3a0b1',
          400: '#ea5b6f',
          500: '#ea5b6f',
          600: '#d45264',
          700: '#be4957',
          800: '#a8404b',
          900: '#92373f',
        },
        strava: {
          orange: '#ff894f',
          'orange-dark': '#e67c47',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },
    },
  },
  plugins: [require('@tailwindcss/forms')],
}