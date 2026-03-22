import { writable } from 'svelte/store';

export const zoomedImage = writable<{ src: string; alt: string } | null>(null);
