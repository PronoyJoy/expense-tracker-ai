import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        fc: {
          bg: '#F5F5F5',
          surface: '#FFFFFF',
          black: '#000000',
          muted: '#666666',
          border: '#E5E5E5',
          dark: '#111111',
          'dark-card': '#1A1A1A',
        },
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
        '4xl': '2rem',
      },
      boxShadow: {
        card: '0 4px 20px rgba(0,0,0,0.05)',
        'card-hover': '0 8px 32px rgba(0,0,0,0.10)',
        'dark-glow': '0 4px 24px rgba(0,0,0,0.30)',
      },
      fontFamily: {
        sans: ['Inter', 'Geist', 'Roboto', 'system-ui', 'sans-serif'],
      },
      gridTemplateColumns: {
        dashboard: '1fr 1fr 1fr',
      },
      width: {
        sidebar: '260px',
      },
      transitionTimingFunction: {
        smooth: 'cubic-bezier(0.4, 0, 0.2, 1)',
      },
    },
  },
  plugins: [],
};

export default config;
