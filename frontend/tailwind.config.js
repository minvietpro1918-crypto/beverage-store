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
        black:   '#0A0A0A',
        cream:   '#F5F0E8',
        gold:    '#C9A96E',
        emerald: '#0D2318',
        bronze:  '#8B7355',
      },
      fontFamily: {
        display: ['"Cormorant Garamond"', 'Georgia', 'serif'],
        body:    ['"DM Sans"', 'system-ui', 'sans-serif'],
      },
      animation: {
        'float':         'floatBottle 6s ease-in-out infinite',
        'marquee':       'marqueeScroll 22s linear infinite',
        'scroll-pulse':  'scrollPulse 2s ease-in-out infinite',
        'fade-up-enter': 'fadeUp 0.8s cubic-bezier(0.16,1,0.3,1) forwards',
      },
      keyframes: {
        floatBottle: {
          '0%,100%': { transform: 'translateY(0) rotate(-1deg)' },
          '50%':     { transform: 'translateY(-18px) rotate(1deg)' },
        },
        marqueeScroll: {
          to: { transform: 'translateX(-50%)' },
        },
        scrollPulse: {
          '0%':   { transform: 'scaleY(0)', transformOrigin: 'top' },
          '50%':  { transform: 'scaleY(1)', transformOrigin: 'top' },
          '51%':  { transform: 'scaleY(1)', transformOrigin: 'bottom' },
          '100%': { transform: 'scaleY(0)', transformOrigin: 'bottom' },
        },
        fadeUp: {
          from: { opacity: 0, transform: 'translateY(30px)' },
          to:   { opacity: 1, transform: 'translateY(0)' },
        },
      },
      transitionTimingFunction: {
        'expo-out': 'cubic-bezier(0.16, 1, 0.3, 1)',
      },
    },
  },
  plugins: [],
};
