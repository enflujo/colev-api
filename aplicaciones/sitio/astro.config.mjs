import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import robotsTxt from 'astro-robots-txt';
import comprimir from 'astro-compress';
import bichos from 'astro-critters';

// https://astro.build/config
export default defineConfig({
  publicDir: './recursos',
  outDir: './publico',
  site: 'https://colev.enflujo.com',
  integrations: [
    bichos({ path: './publico' }),
    comprimir({ path: './publico' }),

    sitemap({
      customPages: ['https://colev.enflujo.com/pronostico-covid19'],
      i18n: {
        defaultLocale: 'es',
        locales: { es: 'es-CO' },
      },
    }),

    robotsTxt(),
  ],
});
