// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';

// `site` is used for the sitemap and canonical links (good for SEO).
export default defineConfig({
  site: 'https://toolnestr.com',
  integrations: [
    // No artificial `lastmod`: stamping today's date on every URL each build
    // makes the signal unreliable to Google and wastes crawl budget. Omitting
    // lastmod lets Google use its own crawl-based freshness signals instead.
    sitemap(),
  ],
  vite: {
    plugins: [tailwindcss()],
  },
});
