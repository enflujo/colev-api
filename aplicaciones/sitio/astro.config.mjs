import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

// https://astro.build/config
export default defineConfig({
  publicDir: './recursos',
  outDir: './publico',
  site: 'https://colev.enflujo.com',
  integrations: [sitemap()],
});
