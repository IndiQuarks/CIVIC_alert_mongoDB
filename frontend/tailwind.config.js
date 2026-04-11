/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        cream:    '#F0F1EB',
        tan:      { DEFAULT: '#A78966', dark: '#8a6f52' },
        olive:    { DEFAULT: '#B1A175', dark: '#8f7f5b' },
        terra:    { DEFAULT: '#A24A3D', dark: '#7d3a2f' },
        charcoal: { DEFAULT: '#414048', dark: '#2e2d34' },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
