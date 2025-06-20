import { defineConfig } from 'wxt';
import wasm from "vite-plugin-wasm";
import topLevelAwait from "vite-plugin-top-level-await";
import tailwindcss from '@tailwindcss/vite';

// See https://wxt.dev/api/config.html
export default defineConfig({
  srcDir: 'src',
  modules: ['@wxt-dev/module-svelte'],
  manifest: {
    name: 'Video Transcription Search',
    description: 'Search for words in a video and see when they were spoken.',
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
      wasm(),
      topLevelAwait(),
      tailwindcss()
    ],
  }),

});
