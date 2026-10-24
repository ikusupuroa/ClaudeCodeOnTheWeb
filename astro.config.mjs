// @ts-check
import { defineConfig } from 'astro/config';
import { satteri } from '@astrojs/markdown-satteri';
import tailwindcss from '@tailwindcss/vite';
import digestSections from './src/lib/digest-sections.mjs';

// https://astro.build/config
export default defineConfig({
  output: 'static',
  markdown: {
    processor: satteri({
      hastPlugins: [digestSections],
    }),
    shikiConfig: {
      themes: { light: 'github-light', dark: 'github-dark' },
      wrap: true,
    },
  },
  vite: {
    plugins: [tailwindcss()],
  },
});
