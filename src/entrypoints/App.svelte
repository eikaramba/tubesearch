<script lang="ts">
  import type { Segment, YouTubePlayerDiv } from '../types';
  let searchTerm = '';
  let segments: Segment[] = [];

  async function search() {
    await ensureTranscriptIsOpen();
    
    // Allow time for the transcript to render after being opened
    await new Promise(resolve => setTimeout(resolve, 500));

    const transcriptSegments = Array.from(document.querySelectorAll('ytd-transcript-segment-renderer'));
    if (transcriptSegments.length === 0) {
      console.error("Could not find transcript segments.");
      return;
    }
    
    const player = getPlayer();
    console.log("Player found:", player.getDuration);
    const videoDuration = await player?.getDuration() ?? 0;

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
      position: videoDuration > 0 ? (segment.time / videoDuration) * 100 : 0,
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

  function getPlayer(): YouTubePlayerDiv | null {
    return document.querySelector<YouTubePlayerDiv>('#movie_player');
  }

  function parseTimestamp(timestamp: string): number {
    const parts = timestamp.split(':').map(Number);
    if (parts.length === 2) {
      return parts[0] * 60 + parts[1];
    }
    return parts[0] * 3600 + parts[1] * 60 + parts[2];
  }

  function seekTo(time: number) {
    const player = document.querySelector<YouTubePlayerDiv>('#movie_player');
    if (player) {
      player.seekTo(time, true);
    }
  }
</script>

<div class="container">
  Dies ist ein kleiner test
  <input id="search-words-transcripts" type="text" bind:value={searchTerm} placeholder="Search transcript..." />
  <button on:click={search}>Search</button>
  <div class="timeline">
    {#each segments as segment}
      <div 
        class="dot" 
        style="left: {segment.position}%" 
        on:click={() => seekTo(segment.time)}
      ></div>
    {/each}
  </div>
</div>

<style>
  .container {
    padding: 1rem;
    background-color: #f0f0f0;
    border-radius: 8px;
  }
  .timeline {
    position: relative;
    height: 20px;
    background-color: #ccc;
    margin-top: 1rem;
  }
  .dot {
    position: absolute;
    width: 10px;
    height: 10px;
    background-color: blue;
    border-radius: 50%;
    cursor: pointer;
  }
</style>