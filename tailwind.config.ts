import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        editor: {
          bg: '#0f0f0f',
          panel: '#1a1a1a',
          border: '#2a2a2a',
          accent: '#6366f1',
        },
      },
    },
  },
  plugins: [],
};

export default config;
