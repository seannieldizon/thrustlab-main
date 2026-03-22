import tailwindcss from '@tailwindcss/vite';
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

export default defineConfig({
	server: {
		watch: {
			usePolling: true
		},
		fs: {
			allow: ['..']
		}
	},
	plugins: [tailwindcss(), sveltekit()],
	optimizeDeps: {
		exclude: ['@babylonjs/core', '@babylonjs/loaders']
	}
});
