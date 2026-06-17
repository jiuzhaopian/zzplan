import type { Config } from 'tailwindcss'

export default {
  content: ['./src/renderer/**/*.{ts,tsx,html}'],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a',
        },
        surface: {
          light: '#ffffff',
          DEFAULT: '#f8fafc',
          dark: '#f1f5f9',
          hover: '#e2e8f0',
        },
        text: {
          primary: '#1e293b',
          secondary: '#64748b',
          placeholder: '#94a3b8',
        },
        page: {
          DEFAULT: '#eef2f7',
        },
        grid: {
          DEFAULT: '#e2e8f0',
        },
      },
      fontFamily: {
        sans: ['"Inter"', '"PingFang SC"', '"Microsoft YaHei"', 'sans-serif'],
      },
      fontSize: {
        '15px': ['15px', '1.5'],
      },
      fontWeight: {
        body: '500',
        heading: '600',
      },
      boxShadow: {
        card: '0 2px 8px rgba(0,0,0,0.06)',
        'card-hover':
          '0 4px 6px -1px rgb(0 0 0 / 0.08), 0 2px 4px -2px rgb(0 0 0 / 0.05)',
        'card-drag':
          '0 10px 15px -3px rgb(59 130 246 / 0.15), 0 4px 6px -4px rgb(59 130 246 / 0.1)',
      },
      borderRadius: {
        card: '12px',
      },
    },
  },
  plugins: [],
} satisfies Config
