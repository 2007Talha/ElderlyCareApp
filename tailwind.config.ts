import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{ts,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        surface: '#111827',
        background: '#0B0F19',
        accent: '#2DD4BF',
        'accent-hover': '#14B8A6',
        success: '#10B981',
        warning: '#F59E0B',
        danger: '#EF4444',
      },
      fontSize: {
        comfort: '1.25rem',
        'comfort-lg': '1.5rem',
      },
    },
  },
  plugins: [],
};

export default config;
