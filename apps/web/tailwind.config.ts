import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './lib/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: '#0F6E56',
        secondary: '#1D9E75',
        accent: '#5DCAA5',
        darkbg: '#0B2D2A',
      },
    },
  },
  plugins: [],
};

export default config;
