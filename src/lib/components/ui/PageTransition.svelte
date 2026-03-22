<script lang="ts">
	import { onMount } from 'svelte';
	import { page } from '$app/state';
	import { beforeNavigate, afterNavigate } from '$app/navigation';
	import { isTransitioning } from '$lib/stores/pageTransition';
	import { fade, fly } from 'svelte/transition';
	import { cubicOut } from 'svelte/easing';

	let { children } = $props<{ children: any }>();

	let transitionState = $state<'idle' | 'out' | 'in'>('idle');
	let currentPath = $state('');
	let isNavigating = $state(false);

	onMount(() => {
		currentPath = page.url.pathname;
	});

	beforeNavigate(({ to, cancel }) => {
		if (to && to.url.pathname !== currentPath) {
			isNavigating = true;
			isTransitioning.set(true);
			transitionState = 'out';
		}
	});

	afterNavigate(({ to }) => {
		if (to) {
			currentPath = to.url.pathname;
			transitionState = 'in';

			// Reset transition state after animation completes
			setTimeout(() => {
				transitionState = 'idle';
				isNavigating = false;
				isTransitioning.set(false);
			}, 600);
		}
	});
</script>

<div class="page-transition-wrapper" class:navigating={isNavigating}>
	{#key currentPath}
		<div
			class="page-content"
			in:fly={{ y: 20, duration: 600, easing: cubicOut, delay: 200 }}
			out:fade={{ duration: 400, easing: cubicOut }}
		>
			{@render children()}
		</div>
	{/key}
</div>

<style>
	.page-transition-wrapper {
		position: relative;
		width: 100%;
		min-height: 100vh;
		isolation: isolate;
	}

	.page-content {
		width: 100%;
		min-height: 100vh;
	}

	.navigating .page-content {
		pointer-events: none;
	}
</style>
