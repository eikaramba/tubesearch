// entrypoints/main-world.ts
export default defineUnlistedScript(() => {
  // This code runs in the page's "main world"
  const player = document.querySelector<any>('#movie_player');
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
});