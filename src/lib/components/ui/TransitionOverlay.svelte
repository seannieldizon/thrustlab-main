<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import { isTransitioning } from '$lib/stores/pageTransition';
	import { fade } from 'svelte/transition';
	import { cubicOut } from 'svelte/easing';

	let show = $state(false);

	$effect(() => {
		show = $isTransitioning;

		// Sync body class with transition state
		if (typeof document !== 'undefined') {
			if ($isTransitioning) {
				document.body.classList.add('page-transitioning');
				console.log('Page transitioning');
			} else {
				document.body.classList.remove('page-transitioning');
				// Force enable scrolling
				document.body.style.removeProperty('overflow');
				document.documentElement.style.removeProperty('overflow');
				console.log('Transition complete');
			}
		}
	});

	onMount(() => {
		// Ensure transitioning state is reset on mount
		isTransitioning.set(false);
		console.log('TransitionOverlay mounted - transition state reset');
	});

	onDestroy(() => {
		// Safety cleanup: ensure scroll is re-enabled
		if (typeof document !== 'undefined') {
			document.body.classList.remove('page-transitioning');
			document.body.style.removeProperty('overflow');
			document.documentElement.style.removeProperty('overflow');
			console.log('TransitionOverlay destroyed - scroll unlocked');
		}
	});
</script>

{#if show}
	<div
		class="transition-overlay"
		in:fade={{ duration: 300, easing: cubicOut }}
		out:fade={{ duration: 400, easing: cubicOut }}
	>
		<div class="transition-progress">
			<div class="progress-bar"></div>
		</div>
	</div>
{/if}

<style>
	.transition-overlay {
		position: fixed;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		background: rgba(27, 53, 88, 0.3);
		backdrop-filter: blur(8px);
		z-index: 9998;
		pointer-events: auto;
		display: flex;
		align-items: flex-start;
		justify-content: center;
		padding-top: 0;
	}

	.transition-progress {
		width: 100%;
		height: 3px;
		background: rgba(255, 255, 255, 0.1);
		overflow: hidden;
		position: relative;
	}

	.progress-bar {
		height: 100%;
		background: linear-gradient(
			90deg,
			var(--ui-light-blue) 0%,
			var(--font-accent-cyan) 50%,
			var(--ui-light-blue) 100%
		);
		background-size: 200% 100%;
		animation:
			progressSlide 0.6s cubic-bezier(0.4, 0, 0.2, 1) forwards,
			progressShimmer 1.5s ease-in-out infinite;
		box-shadow: 0 0 20px var(--font-accent-cyan);
	}

	@keyframes progressSlide {
		from {
			width: 0%;
			transform: translateX(0);
		}
		to {
			width: 100%;
			transform: translateX(0);
		}
	}

	@keyframes progressShimmer {
		0%,
		100% {
			background-position: 0% 50%;
		}
		50% {
			background-position: 100% 50%;
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.progress-bar {
			animation: none;
			width: 100%;
		}

		.transition-overlay {
			backdrop-filter: none;
			background: rgba(27, 53, 88, 0.1);
		}
	}
</style>
