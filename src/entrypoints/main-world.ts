// entrypoints/main-world.ts
export default defineUnlistedScript(() => {
  // This code runs in the page's "main world"
  const player = document.querySelector<any>('#movie_player');

  const getDuration = () => {
    if (player && typeof player.getDuration === 'function') {
      const duration = player.getDuration();
      console.log('Video duration from main world:', duration);

      // We need to send this value back to our content script.
      // We'll use window.postMessage for that.
      window.postMessage({
        type: 'FROM_PAGE', // A custom identifier for our messages
        command: 'getDuration',
        payload: duration,
      }, '*');
    }
  };

  // Initial duration check
  getDuration();

  // Listen for commands from the content script
  window.addEventListener('message', (event) => {
    if (event.source !== window || event.data.type !== 'TO_PAGE') {
      return;
    }

    const { command, payload } = event.data;
    console.log('Main world received command:', command, 'with payload:', payload);

    if (command === 'seekTo' && player && typeof player.seekTo === 'function') {
      player.seekTo(payload, true);
    }
    
    if (command === 'getDuration') {
      getDuration();
    }
  });
});