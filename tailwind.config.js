/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        'red-pantone': '#e63946',
        'honeydew': '#f1faee',
        'non-photo-blue': '#a8dadc',
        'cerulean': '#457b9d',
        'berkeley-blue': '#1d3557',
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'), 
  ],
};
