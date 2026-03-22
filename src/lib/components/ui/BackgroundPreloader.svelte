<script lang="ts">
	import { onMount } from 'svelte';
	import { page } from '$app/state';
	import { beforeNavigate } from '$app/navigation';

	// Define which backgrounds each route uses
	const routeBackgrounds: Record<string, 'home' | 'night' | 'evening' | 'day' | 'dawn' | 'realtime'> = {
		'/': 'home',
		'/hangar-zone': 'night',
		'/turbofan-engine': 'evening',
		'/overhaul-station': 'day',
		'/test-bay': 'dawn',
		'/profile': 'realtime',
		'/dashboard': 'realtime',
		'/login': 'evening',
		'/sign-up': 'evening'
	};

	let preloadedBackgrounds = $state<Set<string>>(new Set());

	function getBackgroundForRoute(path: string): string {
		// Check exact match first
		if (routeBackgrounds[path]) {
			return routeBackgrounds[path];
		}
		
		// Check parent paths
		for (const route in routeBackgrounds) {
			if (path.startsWith(route) && route !== '/') {
				return routeBackgrounds[route];
			}
		}
		
		return 'night'; // default
	}

	function preloadBackground(bgType: string) {
		if (preloadedBackgrounds.has(bgType)) return;
		
		// Create an offscreen canvas to prerender the background
		const canvas = document.createElement('canvas');
		canvas.width = 1920;
		canvas.height = 1080;
		const ctx = canvas.getContext('2d');
		
		if (ctx) {
			// Pre-render gradient based on type
			let topColor: number[], bottomColor: number[];
			
			switch(bgType) {
				case 'night':
					topColor = [27, 53, 88];
					bottomColor = [40, 70, 110];
					break;
				case 'evening':
					topColor = [206, 85, 8];
					bottomColor = [255, 140, 70];
					break;
				case 'day':
					topColor = [135, 206, 235];
					bottomColor = [255, 255, 255];
					break;
				case 'dawn':
					topColor = [118, 102, 127];
					bottomColor = [200, 180, 210];
					break;
				default:
					topColor = [27, 53, 88];
					bottomColor = [40, 70, 110];
			}
			
			const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
			gradient.addColorStop(0, `rgb(${topColor.join(',')})`);
			gradient.addColorStop(1, `rgb(${bottomColor.join(',')})`);
			ctx.fillStyle = gradient;
			ctx.fillRect(0, 0, canvas.width, canvas.height);
			
			preloadedBackgrounds.add(bgType);
		}
	}

	onMount(() => {
		// Preload current background
		const currentBg = getBackgroundForRoute(page.url.pathname);
		preloadBackground(currentBg);

		// Preload all major backgrounds in the background
		setTimeout(() => {
			['night', 'evening', 'day', 'dawn'].forEach(bg => {
				if (!preloadedBackgrounds.has(bg)) {
					preloadBackground(bg);
				}
			});
		}, 1000);
	});

	beforeNavigate(({ to }) => {
		if (to) {
			const nextBg = getBackgroundForRoute(to.url.pathname);
			preloadBackground(nextBg);
		}
	});
</script>

<!-- This component doesn't render anything visible -->
