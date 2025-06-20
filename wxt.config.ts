import { defineConfig } from 'wxt';
import { svelte } from '@sveltejs/vite-plugin-svelte';
import wasm from "vite-plugin-wasm";
import topLevelAwait from "vite-plugin-top-level-await";
import tailwindcss from '@tailwindcss/vite';

// See https://wxt.dev/api/config.html
export default defineConfig({
  srcDir: 'src',
  modules: ['@wxt-dev/module-svelte'],
  manifest: {
    name: 'tubesearch',
    description: 'Search for words in YouTube transcripts and show results in a clickable timeline',
    permissions: ['tabs', 'scripting'],
    host_permissions: ["*://*.youtube.com/*"],
    web_accessible_resources: [
      {
        resources: ['main-world.js'],
        matches: ['*://*.youtube.com/*'],
      },
    ],
  },
  vite: () => ({
    plugins: [
      svelte(),
      wasm(),
      topLevelAwait(),
      tailwindcss()
    ],
  }),

});
