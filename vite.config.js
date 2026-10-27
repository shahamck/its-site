import { defineConfig } from 'vite';
import { fileURLToPath } from 'node:url';

const page = (name) => fileURLToPath(new URL(`./${name}.html`, import.meta.url));

export default defineConfig({
  base: './',
  build: {
    rollupOptions: {
      input: {
        index: page('index'),
        products: page('products'),
        services: page('services'),
        about: page('about'),
        contact: page('contact'),
      },
    },
  },
});
