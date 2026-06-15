/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Poppins', 'system-ui', 'sans-serif'],
      },
      fontSize: {
        'page-title': ['1.875rem', { lineHeight: '2.25rem', fontWeight: '600' }],
        'page-subtitle': ['0.875rem', { lineHeight: '1.375rem', fontWeight: '400' }],
      },
      colors: {
        klenz: {
          black: '#000000',
          surface: '#0A0A0A',
          card: '#121212',
          elevated: '#1A1A1A',
          border: '#2D2D2D',
          muted: '#9CA3AF',
          subtle: '#6B7280',
          orange: '#FF8C00',
          'orange-light': '#FFA033',
          'orange-dark': '#FF4500',
          copper: '#E56A00',
        },
      },
      borderRadius: {
        panel: '12px',
        button: '10px',
      },
      backgroundImage: {
        'orange-gradient': 'linear-gradient(135deg, #FF8C00 0%, #FF4500 100%)',
        'orange-gradient-hover': 'linear-gradient(135deg, #FFA033 0%, #FF5500 100%)',
        'hero-glow': 'radial-gradient(ellipse 80% 60% at 50% 40%, rgba(255,140,0,0.12) 0%, transparent 70%)',
        'grid-pattern': 'linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)',
      },
      backgroundSize: {
        grid: '40px 40px',
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-out',
        'slide-up': 'slideUp 0.5s ease-out',
        float: 'float 6s ease-in-out infinite',
        'float-slow': 'float 8s ease-in-out infinite',
        'float-delayed': 'float 7s ease-in-out 2s infinite',
        'spin-slow': 'spin 20s linear infinite',
        'pulse-glow': 'pulseGlow 4s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px) rotateX(0deg)' },
          '50%': { transform: 'translateY(-20px) rotateX(5deg)' },
        },
        pulseGlow: {
          '0%, 100%': { opacity: '0.4' },
          '50%': { opacity: '0.8' },
        },
      },
    },
  },
  plugins: [],
};
