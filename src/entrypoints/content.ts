import App from './App.svelte';
import { mount } from "svelte";
import { videoDuration } from '../store.svelte';

type Nullable<T> = T | null;
type Selector = string;

const selector = '#below';
const watchPattern = new MatchPattern('*://*.youtube.com/watch*');

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
		// console.log(`Waiting for ${selectors.join(", ")}`, "FgMagenta");
		// Create a Set to store the selectors of elements that have been found. This prevents duplicate counting.
		const foundSelectors = new Set<string>();
		// Get the number of selectors in the array so we know how many elements we are waiting for.
		const { length: selectorsCount } = selectors;

		const check = () => {
			// Loop through each of the selectors.
			selectors.forEach((selector) => {
				// If we've already found this selector, don't check for it again.
				if (foundSelectors.has(selector)) {
					return;
				}
				// Get the element that matches the selector.
				const element = document.querySelector(selector);

				// If the element is found, add the selector to our set of found selectors.
				if (element) {
					// console.log(`Found element for selector: ${selector}`, "FgGreen");
					foundSelectors.add(selector);
				}
			});

			// If the number of unique found selectors is equal to the number of selectors in the array, all of the elements have been found.
			if (foundSelectors.size === selectorsCount) {
				// Disconnect the observer so it doesn't keep running.
				observer.disconnect();
				// Resolve the promise with the array of selectors that have been found.
				resolve(Array.from(foundSelectors));
			}
		};

		// Create a MutationObserver to watch for changes in the DOM.
		const observer = new MutationObserver(check);
		
		// Start listening for changes to the DOM.
		observer.observe(document, { childList: true, subtree: true });

		// Perform an initial check in case the elements are already on the page.
		check();
	});
}

export default defineContentScript({
  matches: ['*://*.youtube.com/*'],
  cssInjectionMode: 'ui',
  
  async main(ctx) {
	
	ctx.addEventListener(window, 'wxt:locationchange', ({ newUrl }) => {
      if (watchPattern.includes(newUrl)) {
		window.postMessage({ type: 'TO_PAGE', command: 'resetSearch' }, '*');
	  }
    });
	mountUi(ctx)
},
});

async function mountUi(ctx) {
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
    await waitForAllElements(["div#player", "div#video-container", "div#player-container","#related #items", "#description"]);
    // const playerElement = document.querySelector(selector);
    await injectScript('/main-world.js');
    console.log('YouTube player found, mounting UI...');

    // mount(App, {
    //   target: playerElement,
    // });
	// const ui = await createIntegratedUi(ctx, {
    //   position: 'inline',
    //   anchor:selector,
      
    //   onMount: (container: HTMLElement) => {
    //     mount(App, {
    //         target: container
    //     });
    //   },
    // });

    const ui = await createShadowRootUi(ctx, {
      name: 'youtube-word-finder',
      position: 'inline',
	  append: "first",
      anchor:selector,
      
      onMount: (container: HTMLElement) => {
        mount(App, {
            target: container
        });
      },
    });
    ui.autoMount();
}
