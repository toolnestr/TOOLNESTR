// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';

// Fires after every `astro build` finishes — regardless of what command
// actually invoked it (npm run build, astro build, a CI script, etc.) — so
// IndexNow submission doesn't depend on Cloudflare Pages' build-command
// setting matching a particular npm script. The script itself only submits
// when running as a Cloudflare Pages *production* build (see --auto in
// scripts/indexnow-submit.mjs); it's a no-op locally and on preview branches.
function indexNowOnBuild() {
  return {
    name: 'indexnow-on-build',
    hooks: {
      'astro:build:done': async () => {
        const { execFile } = await import('node:child_process');
        await new Promise((resolve) => {
          execFile('node', ['scripts/indexnow-submit.mjs', '--auto'], (err, stdout, stderr) => {
            if (stdout) console.log(stdout.trim());
            if (stderr) console.log(stderr.trim());
            if (err) console.log('[indexnow] hook error: ' + err.message);
            resolve(undefined); // never fail the build
          });
        });
      },
    },
  };
}

// `site` is used for the sitemap and canonical links (good for SEO).
export default defineConfig({
  site: 'https://toolnestr.com',
  integrations: [
    // No artificial `lastmod`: stamping today's date on every URL each build
    // makes the signal unreliable to Google and wastes crawl budget. Omitting
    // lastmod lets Google use its own crawl-based freshness signals instead.
    sitemap(),
    indexNowOnBuild(),
  ],
  vite: {
    plugins: [tailwindcss()],
  },
});
