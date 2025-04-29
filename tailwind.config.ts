import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  darkMode: 'class',
  theme: {
    extend: {
      animation: {
        'pulse': 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'shimmer': 'shimmer 2s infinite linear',
        'fadeIn': 'fadeIn 0.5s ease-out forwards',
        'slideLeft': 'slideLeft 0.4s ease-out forwards',
        'slideRight': 'slideRight 0.4s ease-out forwards',
        'bounce': 'bounce 1s ease infinite',
        'spin': 'spin 1s linear infinite',
        'spinReverse': 'spinReverse 0.5s ease-in-out',
        'scale': 'scale 0.3s ease-in-out',
      },
      keyframes: {
        pulse: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.5' },
        },
        shimmer: {
          '0%': { backgroundPosition: '200% 0' },
          '100%': { backgroundPosition: '0 0' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideLeft: {
          '0%': { transform: 'translateX(20px)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
        slideRight: {
          '0%': { transform: 'translateX(-20px)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
        bounce: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        spin: {
          '0%': { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(360deg)' },
        },
        spinReverse: {
          '0%': { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(-360deg)' },
        },
        scale: {
          '0%': { transform: 'scale(0.9)' },
          '100%': { transform: 'scale(1)' },
        },
        fadeInCircle: {
          '0%': { clipPath: 'circle(0% at top right)' },
          '100%': { clipPath: 'circle(150% at top right)' },
        },
        fadeOutCircle: {
          '0%': { clipPath: 'circle(150% at top right)' },
          '100%': { clipPath: 'circle(0% at top right)' },
        },
      },
    },
  },
  plugins: [],
};
export default config;
