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
          50: '#eefdf2',
          100: '#d7f9e0',
          200: '#b2f2c5',
          300: '#84e7a8',
          400: '#54d485',
          500: '#32b968',
          600: '#239452',
          700: '#1e7645',
          800: '#1c5e39',
          900: '#184e32',
          950: '#092b1b',
        },
        secondary: {
          50: '#f4f7fb',
          100: '#e9eff5',
          200: '#cddbe9',
          300: '#a1bdd7',
          400: '#709ac0',
          500: '#517ca8',
          600: '#40648d',
          700: '#365273',
          800: '#314760',
          900: '#2c3c51',
          950: '#1c2737',
        },
        neutral: {
          50: '#f8f9fa',
          100: '#f1f3f5',
          200: '#e9ecef',
          300: '#dee2e6',
          400: '#ced4da',
          500: '#adb5bd',
          600: '#868e96',
          700: '#495057',
          800: '#343a40',
          900: '#212529',
          950: '#0d0f10',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Poppins', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      boxShadow: {
        'soft': '0 2px 15px -3px rgba(0, 0, 0, 0.07), 0 10px 20px -2px rgba(0, 0, 0, 0.04)',
        'card': '0 7px 20px 0 rgba(0, 0, 0, 0.05)',
      },
      borderRadius: {
        'xl': '1rem',
        '2xl': '1.5rem',
      },
    },
  },
  plugins: [],
} 