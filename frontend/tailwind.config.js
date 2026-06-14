/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Poppins', 'system-ui', 'sans-serif'],
      },
      colors: {
        klenz: {
          black: '#000000',
          surface: '#0a0a0a',
          card: '#111111',
          elevated: '#161616',
          border: '#222222',
          muted: '#888888',
          subtle: '#555555',
          orange: '#FF7A00',
          'orange-light': '#FFB347',
          'orange-dark': '#E56A00',
          copper: '#C45A1a',
          purple: '#534AB7',
          teal: '#1D9E75',
        },
      },
      backgroundImage: {
        'orange-gradient': 'linear-gradient(135deg, #FF7A00 0%, #FFB347 100%)',
        'purple-gradient': 'linear-gradient(135deg, #534AB7 0%, #7B6FD4 100%)',
        'teal-gradient': 'linear-gradient(135deg, #1D9E75 0%, #2BB88A 100%)',
        'orange-gradient-hover': 'linear-gradient(135deg, #E56A00 0%, #FF9F40 100%)',
        'hero-glow': 'radial-gradient(ellipse 80% 60% at 50% 40%, rgba(255,122,0,0.15) 0%, transparent 70%)',
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
