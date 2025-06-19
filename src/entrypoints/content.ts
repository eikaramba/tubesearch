import App from './App.svelte';
import { mount } from "svelte";

const selector = '#player'; //ytd-player

// Helper function to wait for an element to be ready
function waitForElement(selector: string): Promise<Element> {
  return new Promise(resolve => {
    const check = () => {
      const element = document.querySelector(selector);
      if (element) {
        resolve(element);
      } else {
        setTimeout(check, 2000);
      }
    };
    check();
  });
}

export default defineContentScript({
  matches: ['*://*.youtube.com/watch*'],
  cssInjectionMode: 'ui',
  
  async main(ctx) {
    // Wait for the player to be available before trying to mount the UI
    await waitForElement(selector);
    console.log('YouTube player found, mounting UI...');

     mount(App, {
      target: document.querySelector(selector)
    })

    // const ui = await createShadowRootUi(ctx, {
    //   name: 'youtube-word-finder',
    //   position: 'inline',
    //   anchor:selector,
      
    //   onMount: (container: HTMLElement) => {
    //     mount(App, {
    //         target: container
    //     });
    //   },
    // });
    // ui.mount();
  },
});