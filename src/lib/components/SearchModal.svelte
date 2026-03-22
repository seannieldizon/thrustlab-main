<script lang="ts">
	import {
		searchQuery,
		searchResults,
		isSearching,
		showSearchModal
	} from '$lib/stores/searchStore';
	import { highlightText } from '$lib/stores/searchStore';
	import { goto } from '$app/navigation';
	import { onDestroy } from 'svelte';
	import { fade, scale, fly } from 'svelte/transition';
	import { cubicOut } from 'svelte/easing';

	let restoreScrollLock: null | (() => void) = null;

	function lockPageScroll() {
		if (typeof document === 'undefined') return;

		const body = document.body;
		const html = document.documentElement;
		const prevBodyOverflow = body.style.overflow;
		const prevHtmlOverflow = html.style.overflow;
		const prevBodyPaddingRight = body.style.paddingRight;
		const scrollbarWidth = window.innerWidth - html.clientWidth;

		body.style.overflow = 'hidden';
		html.style.overflow = 'hidden';
		if (scrollbarWidth > 0) {
			body.style.paddingRight = `${scrollbarWidth}px`;
		}

		restoreScrollLock = () => {
			body.style.overflow = prevBodyOverflow;
			html.style.overflow = prevHtmlOverflow;
			body.style.paddingRight = prevBodyPaddingRight;
		};
	}

	function unlockPageScroll() {
		restoreScrollLock?.();
		restoreScrollLock = null;
	}

	$: {
		if ($showSearchModal) lockPageScroll();
		else unlockPageScroll();
	}

	onDestroy(() => {
		unlockPageScroll();
	});

	function handleResultClick(url: string) {
		showSearchModal.set(false);
		searchQuery.set('');
		goto(url);
	}

	function handleClose() {
		showSearchModal.set(false);
		searchQuery.set('');
	}

	function handleBackdropClick(e: MouseEvent) {
		if (e.target === e.currentTarget) {
			handleClose();
		}
	}

	function getModuleStyle(module: string) {
		if (module.includes('History') || module.includes('01')) {
			return {
				bg: 'bg-cyan-50/50 hover:bg-cyan-50',
				border: 'border-cyan-100 hover:border-cyan-300',
				tag: 'bg-cyan-100 text-cyan-800',
				iconBg: 'bg-cyan-100',
				iconColor: 'text-cyan-600'
			};
		}
		if (module.includes('Types') || module.includes('02')) {
			return {
				bg: 'bg-violet-50/50 hover:bg-violet-50',
				border: 'border-violet-100 hover:border-violet-300',
				tag: 'bg-violet-100 text-violet-800',
				iconBg: 'bg-violet-100',
				iconColor: 'text-violet-600'
			};
		}
		if (module.includes('Turbofan') || module.includes('03')) {
			return {
				bg: 'bg-orange-50/50 hover:bg-orange-50',
				border: 'border-orange-100 hover:border-orange-300',
				tag: 'bg-orange-100 text-orange-800',
				iconBg: 'bg-orange-100',
				iconColor: 'text-orange-600'
			};
		}
		return {
			bg: 'bg-gray-50/50 hover:bg-gray-50',
			border: 'border-gray-100 hover:border-gray-300',
			tag: 'bg-gray-100 text-gray-800',
			iconBg: 'bg-gray-100',
			iconColor: 'text-gray-600'
		};
	}

	function getModuleIcon(module: string) {
		if (module.includes('History') || module.includes('01')) {
			return `<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />`;
		}
		if (module.includes('Types') || module.includes('02')) {
			return `<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />`;
		}
		if (module.includes('Turbofan') || module.includes('03')) {
			return `<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />`;
		}
		return `<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />`;
	}
</script>

{#if $showSearchModal}
	<!-- svelte-ignore a11y_click_events_have_key_events -->
	<!-- svelte-ignore a11y_no_static_element_interactions -->
	<div class="modal-backdrop" on:click={handleBackdropClick} transition:fade={{ duration: 200 }}>
		<div
			class="search-modal"
			transition:scale={{ duration: 300, start: 0.95, opacity: 0, easing: cubicOut }}
		>
			<div class="modal-header">
				<div class="flex items-center gap-3">
					<div
						class="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#B34700] to-orange-600 text-white shadow-lg shadow-orange-500/30"
					>
						<svg
							xmlns="http://www.w3.org/2000/svg"
							class="h-6 w-6"
							fill="none"
							viewBox="0 0 24 24"
							stroke="currentColor"
						>
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
							/>
						</svg>
					</div>
					<div>
						<h2
							class="bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-2xl font-black text-transparent"
						>
							Search Results
						</h2>
						<p class="text-xs font-medium tracking-widest text-gray-500 uppercase">
							Knowledge Base
						</p>
					</div>
				</div>
				<button class="close-btn group" on:click={handleClose}>
					<span class="relative z-10 transition-transform duration-300 group-hover:rotate-90"
						>×</span
					>
					<div
						class="absolute inset-0 rounded-lg bg-gray-100 opacity-0 transition-opacity group-hover:opacity-100"
					></div>
				</button>
			</div>

			<div class="modal-content custom-scrollbar">
				{#if $isSearching}
					<div class="flex flex-col items-center justify-center py-20 text-gray-500">
						<div
							class="mb-4 h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-[#B34700]"
						></div>
						<p class="text-sm font-medium tracking-wider uppercase">Searching...</p>
					</div>
				{:else if $searchResults.length === 0}
					<div class="no-results flex flex-col items-center py-20">
						<div class="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-50">
							<svg
								xmlns="http://www.w3.org/2000/svg"
								class="h-8 w-8 text-gray-400"
								fill="none"
								viewBox="0 0 24 24"
								stroke="currentColor"
							>
								<path
									stroke-linecap="round"
									stroke-linejoin="round"
									stroke-width="2"
									d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
								/>
							</svg>
						</div>
						<p class="text-lg font-medium text-gray-900">No results found for "{$searchQuery}"</p>
						<p class="text-sm text-gray-500">Try checking for typos or using different keywords</p>
					</div>
				{:else}
					<div class="mb-4 flex items-center justify-between px-2">
						<div class="text-xs font-bold tracking-widest text-gray-400 uppercase">
							Found {$searchResults.length} result{$searchResults.length === 1 ? '' : 's'}
						</div>
					</div>
					<div class="results-list">
						{#each $searchResults as result, i}
							{@const style = getModuleStyle(result.module)}
							<button
								class="result-item group relative w-full overflow-hidden rounded-xl border border-transparent p-4 text-left transition-all duration-300 hover:-translate-y-1 hover:shadow-lg {style.bg} {style.border}"
								on:click={() => handleResultClick(result.url)}
								in:fly={{ y: 20, duration: 400, delay: i * 50 }}
							>
								<div class="relative z-10 flex gap-4">
									<div
										class="mt-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-lg {style.iconBg} {style.iconColor} shadow-sm transition-transform duration-300 group-hover:scale-110"
									>
										<svg
											xmlns="http://www.w3.org/2000/svg"
											class="h-5 w-5"
											fill="none"
											viewBox="0 0 24 24"
											stroke="currentColor"
										>
											{@html getModuleIcon(result.module)}
										</svg>
									</div>
									<div class="min-w-0 flex-1">
										<div class="mb-1 flex items-start justify-between gap-4">
											<h3 class="result-title truncate text-lg font-bold text-gray-900">
												{@html highlightText(result.title, $searchQuery)}
											</h3>
											<span
												class="shrink-0 rounded-full px-2.5 py-0.5 text-[10px] font-bold tracking-wider uppercase {style.tag}"
											>
												{result.module.replace('Module ', '')}
											</span>
										</div>
										{#if result.section}
											<div class="mb-2 flex items-center gap-1.5 text-xs font-medium text-gray-500">
												<span class="h-1 w-1 rounded-full bg-gray-400"></span>
												<span class="tracking-wide text-gray-400 uppercase">Section:</span>
												<span class={style.iconColor}>{result.section}</span>
											</div>
										{/if}
										<div class="result-content line-clamp-2 text-sm leading-relaxed text-gray-600">
											{@html highlightText(result.content, $searchQuery)}...
										</div>
									</div>
								</div>
							</button>
						{/each}
					</div>
				{/if}
			</div>
		</div>
	</div>
{/if}

<style>
	.modal-backdrop {
		position: fixed;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		background: rgba(0, 0, 0, 0.6);
		backdrop-filter: blur(8px);
		display: flex;
		align-items: flex-start;
		justify-content: center;
		z-index: 9999;
		padding-top: 5vh;
		overflow: hidden;
		overscroll-behavior: contain;
	}

	.search-modal {
		background: rgba(255, 255, 255, 0.95);
		backdrop-filter: blur(20px);
		border: 1px solid rgba(255, 255, 255, 0.5);
		border-radius: 24px;
		width: 90%;
		max-width: 800px;
		max-height: 85vh;
		display: flex;
		flex-direction: column;
		box-shadow:
			0 20px 50px -12px rgba(0, 0, 0, 0.25),
			0 0 0 1px rgba(255, 255, 255, 0.5) inset;
		margin-bottom: 5vh;
	}

	.modal-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 1.5rem 2rem;
		border-bottom: 1px solid rgba(0, 0, 0, 0.05);
	}

	.close-btn {
		position: relative;
		cursor: pointer;
		width: 36px;
		height: 36px;
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 1.75rem;
		line-height: 1;
		color: #9ca3af;
		border-radius: 8px;
		background: transparent;
		border: none;
	}

	.close-btn:hover {
		color: #111827;
	}

	.modal-content {
		padding: 1.5rem 2rem;
		overflow-y: auto;
		flex: 1;
		overscroll-behavior: contain;
	}

	/* Custom Scrollbar */
	.custom-scrollbar::-webkit-scrollbar {
		width: 8px;
	}

	.custom-scrollbar::-webkit-scrollbar-track {
		background: transparent;
	}

	.custom-scrollbar::-webkit-scrollbar-thumb {
		background: rgba(0, 0, 0, 0.1);
		border-radius: 4px;
	}

	.custom-scrollbar::-webkit-scrollbar-thumb:hover {
		background: rgba(0, 0, 0, 0.2);
	}

	.result-content :global(mark) {
		background: rgba(254, 243, 199, 1);
		color: #92400e;
		padding: 0 0.25rem;
		border-radius: 4px;
		font-weight: 600;
	}

	.result-title :global(mark) {
		background: rgba(254, 243, 199, 1);
		color: #92400e;
		padding: 0 0.25rem;
		border-radius: 4px;
	}

	@media (max-width: 768px) {
		.modal-backdrop {
			padding-top: 0;
			align-items: flex-end; /* Show as bottom sheet on mobile */
		}

		.search-modal {
			width: 100%;
			max-width: 100%;
			border-radius: 24px 24px 0 0;
			margin-bottom: 0;
			max-height: 90vh;
		}

		.modal-header {
			padding: 1.25rem;
		}

		.modal-content {
			padding: 1rem;
		}
	}
</style>
