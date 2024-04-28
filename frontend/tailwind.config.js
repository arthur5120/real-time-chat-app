/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./*.{ts,tsx,js,tsx,html}", 
    "./*/*.{ts,tsx,js,tsx,html}",
    "./*/*/*.{ts,tsx,js,tsx,html}",
    "./*/*/*/*.{ts,tsx,js,tsx,html}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}

