<script lang="ts">
  import type { Segment, YouTubePlayerDiv } from '../types';
  import { videoDuration } from '../store.svelte';
  import "../app.css";

  let searchTerm = '';
  let segments: Segment[] = [];
  let hoveredSegment: Segment | null = null;

  const colors = ['#FF0000', '#00FF00', '#0000FF', '#FFFF00', '#00FFFF', '#FF00FF'];

  async function search(e: SubmitEvent) {
    e.preventDefault();
    await ensureTranscriptIsOpen();
    
    await new Promise(resolve => setTimeout(resolve,  1000));

    const transcriptSegments = Array.from(document.querySelectorAll('ytd-transcript-segment-renderer'));
    if (transcriptSegments.length === 0) {
      console.error("Could not find transcript segments.");
      return;
    }
    
    const videoDurationValue = videoDuration.value ?? 0;

    const parsedSegments: { time: number; text: string }[] = transcriptSegments.map(segment => {
      const timeEl = segment.querySelector('.segment-timestamp') as HTMLElement;
      const textEl = segment.querySelector('.segment-text') as HTMLElement;
      const time = timeEl ? parseTimestamp(timeEl.innerText) : 0;
      const text = textEl ? textEl.innerText : '';
      return { time, text };
    });

    const searchKeywords = searchTerm.split(',').map(k => k.trim()).filter(k => k);
    let foundSegments: Segment[] = [];

    searchKeywords.forEach((keyword, index) => {
      const color = colors[index % colors.length];
      const keywordSegments = parsedSegments
        .filter(segment => segment.text.toLowerCase().includes(keyword.toLowerCase()))
        .map(segment => ({
          time: segment.time,
          position: videoDurationValue > 0 ? (segment.time / videoDurationValue) * 100 : 0,
          text: segment.text,
          keyword: keyword,
          color: color,
        }));
      foundSegments = foundSegments.concat(keywordSegments);
    });

    segments = foundSegments.sort((a, b) => a.time - b.time);
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

  function getHighlightedText(text: string, keyword: string) {
    const regex = new RegExp(`(${keyword})`, 'gi');
    return text.replace(regex, '<b>$1</b>');
  }

  function preventDefault(event: Event) {
    event.stopPropagation();
    searchTerm = (event.target as HTMLInputElement).value;
  }

</script>

<style>
  .dot {
    position: absolute;
    width: 12px;
    height: 12px;
    border-radius: 50%;
    cursor: pointer;
    transform: translate(-50%, -50%);
    top: 50%;
  }
</style>

<div class="p-4 bg-gray-100 dark:bg-gray-800 rounded-lg shadow-md">
  <form onsubmit={search} class="flex gap-2 relative">
    <input
      id="search-words-transcripts"
      type="text"
      onkeydown={preventDefault}
      onkeyup={preventDefault}
      onkeypress={preventDefault}
      placeholder="Search transcript..."
      class="flex-grow px-3 py-2 text-gray-700 bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600"
    />
    <button
      type="submit"
      class="px-4 py-2 font-semibold text-white bg-blue-500 rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
    >
      Search
    </button>
  </form>
  {#if segments.length > 0}
  <div class="relative w-full h-5 mt-4 bg-gray-300 dark:bg-gray-700 rounded-full">
    {#each segments as segment}
      <div
        class="dot"
        style="left: {segment.position}%; background-color: {segment.color};"
        onmouseover={() => hoveredSegment = segment}
        onmouseout={() => hoveredSegment = null}
        onclick={() => seekTo(segment.time)}
      >
        {#if hoveredSegment === segment}
          <div class="absolute bottom-full left-1/2 -translate-x-1/2 p-2 w-[400px] bg-white text-black dark:bg-black dark:text-white rounded shadow-lg z-[1000] mb-2">
            {@html getHighlightedText(segment.text, segment.keyword)}
          </div>
        {/if}
      </div>
    {/each}
  </div>
  {/if}
</div>