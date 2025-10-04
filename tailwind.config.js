/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        background: 'var(--background)',
        card: 'var(--card)',
        muted: 'var(--muted)',
        foreground: 'var(--foreground)',
        accent: 'var(--color-accent)',
        'accent-dark': 'var(--color-accent-dark)',
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'ui-sans-serif', 'system-ui'],
      },
      animation: {
        'float': 'float 8s ease-in-out infinite',
        'marquee': 'marquee 26s linear infinite',
        'fadeUp': 'fadeUp 0.6s cubic-bezier(0.22,1,0.36,1) both',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)', opacity: '1' },
          '50%': { transform: 'translateY(8px)', opacity: '0.9' },
        },
        marquee: {
          from: { transform: 'translateX(0)' },
          to: { transform: 'translateX(-50%)' },
        },
        fadeUp: {
          from: { opacity: '0', transform: 'translateY(12px)' },
          to: { opacity: '1', transform: 'none' },
        },
      },
    },
  },
  plugins: [],
}
