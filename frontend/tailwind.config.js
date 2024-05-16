/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./*.{ts,tsx,js,tsx,html}", 
    "./*/*.{ts,tsx,js,tsx,html}",
    "./*/*/*.{ts,tsx,js,tsx,html}",
    "./*/*/*/*.{ts,tsx,js,tsx,html}",
  ],
  theme: {
    extend: {
      colors : {
        'primary-color' : '#000',
        'secondary-color' : '#000'
      }
    },
  },
  plugins: [],
}

