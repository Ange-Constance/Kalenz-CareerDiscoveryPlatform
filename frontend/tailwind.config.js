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
          black: '#0a0a0f',
          surface: '#111118',
          card: '#111118',
          elevated: '#1a1a24',
          border: 'rgba(255,255,255,0.06)',
          'border-orange': 'rgba(255,140,0,0.25)',
          muted: '#a0a0b8',
          subtle: '#6b6b8a',
          orange: '#FF8C00',
          'orange-light': '#FFA033',
          'orange-dark': '#FF4500',
          teal: '#1D9E75',
          'teal-hover': '#22b585',
          warning: '#f59e0b',
          error: '#ef4444',
          success: '#1D9E75',
        },
      },
      borderRadius: {
        panel: '16px',
        button: '12px',
        chip: '8px',
      },
      backgroundImage: {
        'orange-gradient': 'linear-gradient(135deg, #FF8C00 0%, #FF4500 100%)',
        'orange-gradient-hover': 'linear-gradient(135deg, #FFA033 0%, #FF5500 100%)',
        'teal-gradient': 'linear-gradient(135deg, #1D9E75 0%, #22b585 100%)',
        'hero-mesh': 'radial-gradient(ellipse 60% 50% at 20% 20%, rgba(255,140,0,0.12) 0%, transparent 50%), radial-gradient(ellipse 50% 40% at 80% 60%, rgba(29,158,117,0.08) 0%, transparent 50%)',
        'grid-pattern': 'linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)',
      },
      backgroundSize: {
        grid: '40px 40px',
      },
      maxWidth: {
        content: '1200px',
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'bar-grow': 'barGrow 0.8s ease-out forwards',
        float: 'float 6s ease-in-out infinite',
        'pulse-glow': 'pulseGlow 4s ease-in-out infinite',
        'gradient-shift': 'gradientShift 12s ease-in-out infinite',
        'typing-dot': 'typingDot 1.4s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(12px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        barGrow: {
          '0%': { width: '0%' },
          '100%': { width: 'var(--bar-width, 100%)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-16px)' },
        },
        pulseGlow: {
          '0%, 100%': { opacity: '0.5' },
          '50%': { opacity: '0.9' },
        },
        gradientShift: {
          '0%, 100%': { opacity: '0.6' },
          '50%': { opacity: '1' },
        },
        typingDot: {
          '0%, 80%, 100%': { opacity: '0.3', transform: 'scale(0.8)' },
          '40%': { opacity: '1', transform: 'scale(1)' },
        },
      },
    },
  },
  plugins: [],
};
