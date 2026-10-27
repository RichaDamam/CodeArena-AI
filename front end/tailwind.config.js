/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        dark: {
          bg: '#080C14',
          card: '#0F172A',
          border: '#1E293B',
          text: '#F8FAFC',
          muted: '#94A3B8'
        },
        cyber: {
          cyan: '#00F0FF',
          magenta: '#FF007F',
          green: '#39FF14',
          purple: '#BD00FF',
          yellow: '#FFEA00'
        }
      },
      fontFamily: {
        sans: ['Space Grotesk', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace']
      },
      boxShadow: {
        'glow-cyan': '0 0 15px rgba(0, 240, 255, 0.4)',
        'glow-magenta': '0 0 15px rgba(255, 0, 127, 0.4)',
        'glow-green': '0 0 15px rgba(57, 255, 20, 0.4)',
        'glass': '0 8px 32px 0 rgba(0, 0, 0, 0.37)'
      }
    },
  },
  plugins: [],
}
