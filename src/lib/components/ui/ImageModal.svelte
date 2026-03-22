<script lang="ts">
	import { zoomedImage } from '$lib/stores/zoomStore';
	import { fade, scale } from 'svelte/transition';
	import { onMount } from 'svelte';

	function close() {
		$zoomedImage = null;
	}

	function handleKeydown(e: KeyboardEvent) {
		if (e.key === 'Escape') close();
	}

	onMount(() => {
			function isZoomableImage(imgEl: HTMLElement) {
				const imgElement = imgEl;
				const isContentImage = imgElement.closest('.content-card') || 
									imgElement.closest('.section-content') || 
									imgElement.closest('.image-placeholder') || 
									imgElement.closest('.image-grid') || 
									imgElement.closest('.image-row') ||
									imgElement.closest('.parameter-image') || 
									imgElement.closest('.diagram-column') || 
									imgElement.closest('.more-info-container');

				const isExcluded = imgElement.closest('.character-container') || 
									imgElement.closest('.logo') || 
									imgElement.classList.contains('no-zoom');

				return isContentImage && !isExcluded;
			}

			function handleGlobalClick(e: MouseEvent) {
				const clicked = e.target as HTMLElement;
				const targetImg = clicked.closest('img') as HTMLImageElement | null;
				if (!targetImg) return;
				if (isZoomableImage(targetImg)) {
					zoomedImage.set({ src: targetImg.src, alt: targetImg.alt });
					e.stopPropagation();
				}
			}

			function handleGlobalKeyDown(e: KeyboardEvent) {
				if (e.key !== 'Enter' && e.key !== ' ') return;
				const active = document.activeElement as HTMLElement | null;
				if (!active) return;
				let targetImg: HTMLImageElement | null = null;
				if (active.tagName === 'IMG') {
					targetImg = active as HTMLImageElement;
				} else if (active.classList.contains('image-placeholder')) {
					// find child img
					targetImg = active.querySelector('img');
				} else {
					const nearestImg = active.closest('img') as HTMLImageElement | null;
					if (nearestImg) targetImg = nearestImg;
				}
				if (!targetImg) return;
				if (isZoomableImage(targetImg)) {
					zoomedImage.set({ src: targetImg.src, alt: targetImg.alt });
					(e as Event).stopPropagation();
				}
			}

			document.addEventListener('click', handleGlobalClick);
			document.addEventListener('keydown', handleGlobalKeyDown);

			return () => {
				document.removeEventListener('click', handleGlobalClick);
				document.removeEventListener('keydown', handleGlobalKeyDown);
			};
		});
</script>

<svelte:window on:keydown={handleKeydown} />

{#if $zoomedImage}
	<!-- svelte-ignore a11y-click-events-have-key-events -->
	<!-- svelte-ignore a11y-no-static-element-interactions -->
	<div class="modal-backdrop" on:click={close} transition:fade={{ duration: 200 }}>
		<div class="modal-content" on:click|stopPropagation>
			<img 
				src={$zoomedImage.src} 
				alt={$zoomedImage.alt} 
				class="modal-image" 
				transition:scale={{ start: 0.9, duration: 200 }} 
			/>
			<button class="close-button" on:click={close} aria-label="Close zoom view">
				<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
					<line x1="18" y1="6" x2="6" y2="18"></line>
					<line x1="6" y1="6" x2="18" y2="18"></line>
				</svg>
			</button>
			{#if $zoomedImage.alt}
				<p class="image-caption">{$zoomedImage.alt}</p>
			{/if}
		</div>
	</div>
{/if}

<style>
	.modal-backdrop {
		position: fixed;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		background: rgba(0, 0, 0, 0.9);
		z-index: 9999;
		display: flex;
		align-items: center;
		justify-content: center;
		cursor: zoom-out;
		backdrop-filter: blur(5px);
	}

	.modal-content {
		position: relative;
		max-width: 95vw;
		max-height: 95vh;
		display: flex;
		flex-direction: column;
		align-items: center;
		cursor: default;
	}

	.modal-image {
		max-width: 100%;
		max-height: 85vh;
		object-fit: contain;
		border-radius: 8px;
		box-shadow: 0 4px 24px rgba(0, 0, 0, 0.5);
	}

	.close-button {
		position: absolute;
		top: -40px;
		right: 0;
		background: rgba(255, 255, 255, 0.2);
		border: none;
		color: white;
		width: 36px;
		height: 36px;
		border-radius: 50%;
		display: flex;
		align-items: center;
		justify-content: center;
		cursor: pointer;
		transition: all 0.2s ease;
	}

	.close-button:hover {
		background: rgba(255, 255, 255, 0.4);
		transform: scale(1.1);
	}

	.image-caption {
		color: white;
		margin-top: 1rem;
		font-family: var(--font-body, sans-serif);
		font-size: 1.1rem;
		text-align: center;
		max-width: 800px;
		text-shadow: 0 2px 4px rgba(0, 0, 0, 0.5);
	}
</style>
