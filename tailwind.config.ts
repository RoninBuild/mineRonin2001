import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        base: {
          bg: '#0A0A0B',
          panel: '#111827',
          border: '#1F2937',
          primary: '#0052FF',
          secondary: '#6B7280',
        }
      }
    },
  },
  plugins: [],
}
export default config
