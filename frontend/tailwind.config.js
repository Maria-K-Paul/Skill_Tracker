/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#FFFFFF",
        surface: "#F9F9F9",
        border: "rgba(0,0,0,0.1)",
        primary: {
          DEFAULT: "#0F0F0F",
          foreground: "#FFFFFF",
        },
        secondary: {
          DEFAULT: "#F9F9F9",
          foreground: "#0F0F0F",
        },
        muted: {
          DEFAULT: "#606060",
          foreground: "#FFFFFF",
        },
        accent: {
          DEFAULT: "#FF0000",
          foreground: "#FFFFFF",
        },
        destructive: {
          DEFAULT: "#FF0000",
          foreground: "#FFFFFF",
        },
        success: {
          DEFAULT: "#2BA640",
          foreground: "#FFFFFF",
        },
        warning: {
          DEFAULT: "#E8A33D",
          foreground: "#FFFFFF",
        },
        ring: "#FF0000",
      },
      fontFamily: {
        sans: ['"Roboto"', 'sans-serif'],
      },
      borderRadius: {
        lg: "8px",
        md: "8px",
        sm: "4px",
      }
    },
  },
  plugins: [],
}
