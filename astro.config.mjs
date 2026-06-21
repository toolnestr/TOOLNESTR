// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';

// `site` is used for the sitemap and canonical links (good for SEO).
export default defineConfig({
  site: 'https://toolnestr.com',
  integrations: [sitemap()],
  vite: {
    plugins: [tailwindcss()],
  },
});
