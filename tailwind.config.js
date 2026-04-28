/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        // MUBİL paleti — afet temalı, kontrastlı
        mubil: {
          50:  '#FEF2F2',
          100: '#FEE2E2',
          200: '#FECACA',
          300: '#FCA5A5',
          400: '#F87171',
          500: '#EF4444',
          600: '#DC2626',  // primary — acil kırmızı
          700: '#B91C1C',
          800: '#991B1B',
          900: '#7F1D1D',
        },
        warning: {
          400: '#FB923C',
          500: '#F97316',
          600: '#EA580C',  // ikincil — uyarı turuncu
          700: '#C2410C',
        },
        amber: {
          400: '#FBBF24',
          500: '#F59E0B',  // orta seviye — sarı-amber
        },
      },
      fontFamily: {
        sans: ['Poppins', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'mubil-card': '0 1px 3px rgba(0,0,0,0.05), 0 1px 2px rgba(0,0,0,0.03)',
      },
    },
  },
  plugins: [],
};
