import type { YouTubePlayer } from "youtube-player/dist/types";

export type YouTubePlayerDiv = HTMLDivElement & YouTubePlayer;

export interface Segment {
  time: number;
  position: number;
  text: string;
  keyword: string;
  color: string;
}