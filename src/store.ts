import { writable } from 'svelte/store';

export const videoDuration = writable<number | null>(null);