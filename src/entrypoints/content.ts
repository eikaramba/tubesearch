import App from './App.svelte';
import { mount } from "svelte";
import { videoDuration } from '../store';

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
    window.addEventListener('message', (event) => {
      // We only accept messages from ourselves
      if (event.source !== window || event.data.type !== 'FROM_PAGE') {
        return;
      }

      console.log('Content script received message:', event.data);
      if (event.data.command === 'getDuration') {
        videoDuration.set(event.data.payload);
      }
    });
    
    await injectScript('/main-world.js');
    // Wait for the player to be available before trying to mount the UI
    const playerElement = await waitForElement(selector);
    console.log('YouTube player found, mounting UI...');

    // mount(App, {
    //   target: playerElement,
    // });

    const ui = await createShadowRootUi(ctx, {
      name: 'youtube-word-finder',
      position: 'inline',
      anchor:selector,
      
      onMount: (container: HTMLElement) => {
        mount(App, {
            target: container
        });
      },
    });
    ui.mount();
  },
});