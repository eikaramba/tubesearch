import App from './App.svelte';
import { mount } from "svelte";

export default defineContentScript({
  matches: ['*://*.youtube.com/watch*'],
  cssInjectionMode: 'ui',
  
  async main(ctx) {
    const ui = await createShadowRootUi(ctx, {
      name: 'youtube-word-finder',
      position: 'inline',
      anchor: 'ytd-player',
      
      onMount: (container: HTMLElement) => {
        mount(App, {
            target: container
        });
      },
    });
    ui.mount();
  },
});