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
        setTimeout(() => resolve(element), 5000);
      } else {
        setTimeout(check, 500);
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
      if (event.source !== window) {
        return;
      }

      const { type, command, payload } = event.data;

      if (type === 'FROM_PAGE') {
        console.log('Content script received message from page:', event.data);
        if (command === 'getDuration') {
          videoDuration.set(payload);
        }
      } else if (type === 'FROM_CONTENT') {
        // Forward message to main world, this time with a different type
        window.postMessage({ type: 'TO_PAGE', command, payload }, '*');
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