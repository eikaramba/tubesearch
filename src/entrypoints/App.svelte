<script lang="ts">
  import type { Segment, YouTubePlayerDiv } from '../types';
  import { videoDuration } from '../store';
  import "../app.css";

  let searchTerm = '';
  let segments: Segment[] = [];

  async function search(e) {
    e.preventDefault();
    await ensureTranscriptIsOpen();
    
    // Allow time for the transcript to render after being opened
    await new Promise(resolve => setTimeout(resolve, 500));

    const transcriptSegments = Array.from(document.querySelectorAll('ytd-transcript-segment-renderer'));
    if (transcriptSegments.length === 0) {
      console.error("Could not find transcript segments.");
      return;
    }
    
    const videoDurationValue = $videoDuration ?? 0;

    const parsedSegments: { time: number; text: string }[] = transcriptSegments.map(segment => {
      const timeEl = segment.querySelector('.segment-timestamp') as HTMLElement;
      const textEl = segment.querySelector('.segment-text') as HTMLElement;
      const time = timeEl ? parseTimestamp(timeEl.innerText) : 0;
      const text = textEl ? textEl.innerText : '';
      return { time, text };
    });

    const filteredSegments = parsedSegments.filter(segment => segment.text.includes(searchTerm));

    segments = filteredSegments.map(segment => ({
      time: segment.time,
      position: videoDurationValue > 0 ? (segment.time / videoDurationValue) * 100 : 0,
    }));
  }

  async function ensureTranscriptIsOpen() {
    const transcriptButton = document.querySelector<HTMLButtonElement>("ytd-video-description-transcript-section-renderer button");
    
    // If transcript is already open, the segments will be visible.
    const segmentsVisible = document.querySelector('ytd-transcript-segment-renderer');

    if (transcriptButton && !segmentsVisible) {
      transcriptButton.click();
    }
  }

  function parseTimestamp(timestamp: string): number {
    const parts = timestamp.split(':').map(Number);
    if (parts.length === 2) {
      return parts[0] * 60 + parts[1];
    }
    return parts[0] * 3600 + parts[1] * 60 + parts[2];
  }

  function seekTo(time: number) {
    window.postMessage({
      type: 'FROM_CONTENT',
      command: 'seekTo',
      payload: time,
    }, '*');
  }

  function preventDefault(event: Event) {
    event.stopPropagation();
    searchTerm = (event.target as HTMLInputElement).value;
  }
</script>

<div class="p-4 bg-gray-100 rounded-lg shadow-md">
  <form onsubmit={search} class="flex gap-2">
    <input
      id="search-words-transcripts"
      type="text"
      onkeydown={preventDefault}
      placeholder="Search transcript..."
      class="flex-grow px-3 py-2 text-gray-700 bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
    />
    <button
      type="submit"
      class="px-4 py-2 font-semibold text-white bg-blue-500 rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
    >
      Search
    </button>
  </form>
  {#if segments.length > 0}
  <div class="relative w-full h-5 mt-4 bg-gray-300 rounded-full">
    {#each segments as segment}
      <div
        class="absolute w-3 h-3 bg-blue-500 rounded-full cursor-pointer -translate-x-1/2 top-1/2 -translate-y-1/2"
        style="left: {segment.position}%"
        onclick={() => seekTo(segment.time)}
        title={`Found at ${segment.time}s`}
      ></div>
    {/each}
  </div>
  {/if}
</div>