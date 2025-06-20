import App from './App.svelte';
import { mount } from "svelte";
import { videoDuration } from '../store.svelte';

type Nullable<T> = T | null;
type Selector = string;

const selector = '#player';

// Helper function to wait for an element to be ready
function waitForElement(selector: Selector): Promise<Element> {
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

export function waitForAllElements(selectors: Selector[]): Promise<Selector[]> {
	// Create a promise that will resolve when all of the target elements are found.
	return new Promise((resolve) => {
		// Log a message to the console to let the user know what's happening.
		console.log(`Waiting for ${selectors.join(", ")}`, "FgMagenta");
		// Create a Map to store the elements as they are found.
		const elementsMap = new Map<string, Nullable<Element>>();
		// Get the number of selectors in the array so we know how many elements we are waiting for.
		const { length: selectorsCount } = selectors;
		// Create a counter for the number of elements that have been found.
		let resolvedCount = 0;
		// Create a MutationObserver to watch for changes in the DOM.
		const observer = new MutationObserver(() => {
			// Loop through each of the selectors.
			selectors.forEach((selector) => {
				// Get the element that matches the selector.
				const element = document.querySelector(selector);
				// Add the element to the Map.
				elementsMap.set(selector, element);
				// If the element is not found, return early.
				if (!element) {
					return;
				}
				// Increase the counter by 1.
				resolvedCount++;
				// If the number of resolved elements is equal to the number of selectors in the array, all of the elements have been found.
				if (resolvedCount === selectorsCount) {
					// Disconnect the observer so it doesn't keep running.
					observer.disconnect();
					// Get an array of the resolved elements.
					const resolvedElements = selectors.map((selector) => (elementsMap.get(selector) ? selector : undefined)).filter(Boolean);
					// Resolve the promise with the array of resolved elements.
					resolve(resolvedElements);
				}
			});
		});
		// Start listening for changes to the DOM.
		observer.observe(document, { childList: true, subtree: true });
		// Loop through each of the selectors.
		selectors.forEach((selector) => {
			// Get the element that matches the selector.
			const element = document.querySelector(selector);
			// Add the element to the Map.
			elementsMap.set(selector, element);
			// If the element is not found, return early.
			if (!element) {
				return;
			}
			// Increase the counter by 1.
			resolvedCount++;
			// If the number of resolved elements is equal to the number of selectors in the array, all of the elements have been found.
			if (resolvedCount === selectorsCount) {
				// Disconnect the observer so it doesn't keep running.
				observer.disconnect();
				// Get an array of the resolved elements.
				const resolvedElements = selectors.map((selector) => (elementsMap.get(selector) ? selector : undefined)).filter(Boolean);
				// Resolve the promise with the array of resolved elements.
				resolve(resolvedElements);
			}
		});
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
        if (command === 'getDuration') {
          videoDuration.value = payload;
        }
      } else if (type === 'FROM_CONTENT') {
        // Forward message to main world, this time with a different type
        window.postMessage({ type: 'TO_PAGE', command, payload }, '*');
      }
    });
    
    // Wait for the player to be available before trying to mount the UI
    await waitForAllElements(["div#player", "div#player-wide-container", "div#video-container", "div#player-container"]);
    // const playerElement = document.querySelector(selector);
    await injectScript('/main-world.js');
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