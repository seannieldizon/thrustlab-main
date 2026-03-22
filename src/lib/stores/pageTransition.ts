import { writable } from 'svelte/store';

export const isTransitioning = writable(false);
export const nextRoute = writable<string | null>(null);
