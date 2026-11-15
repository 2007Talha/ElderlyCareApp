import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{ts,tsx}'],
  darkMode: ['class', '[data-theme="dark"]'],
  theme: {
    extend: {
      colors: {
        surface: 'var(--bg-surface)',
        background: 'var(--bg-primary)',
        'card-subtle': 'var(--bg-card-subtle)',
        accent: 'var(--accent)',
        'accent-hover': 'var(--accent-hover)',
        success: 'var(--success)',
        warning: 'var(--warning)',
        danger: 'var(--danger)',
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
