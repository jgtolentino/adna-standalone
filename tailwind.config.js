/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
        scout: {
          primary: '#000000',
          secondary: '#FFD700',
          accent: '#1E40AF',
          dark: '#000000',
          light: '#F5F5F5',
          text: '#000000',
          card: '#FFFFFF',
          border: '#F5F5F5',
        },
        tbwa: {
          yellow: '#FFD700',
          turquoise: '#00CED1',
          black: '#000000',
          white: '#FFFFFF',
          gray: '#4A4A4A',
          lightGray: '#F5F5F5',
          darkYellow: '#E6C200',
          blue: '#1E40AF',
          purple: '#6B46C1',
          emerald: '#059669',
          red: '#DC2626',
          orange: '#D97706',
          secondary: '#00CED1',
          agency: '#FFD700',
          outline: '#E5E7EB',
        },
        nav: {
          bg: '#FFFFFF',
          hover: '#F5F5F5',
          text: '#000000',
        }
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}