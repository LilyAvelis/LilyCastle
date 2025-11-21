import { defineConfig } from 'astro/config';

export default defineConfig({
  server: {
    fs: {
      allow: ['c:/Users/lilya/OneDrive/Desktop/ЗамокЛилии/01-Библиотека/js-libs/node_modules']
    }
  }
});