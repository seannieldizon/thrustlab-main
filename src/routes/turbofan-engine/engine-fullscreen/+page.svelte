<script lang="ts">
	import { goto } from '$app/navigation';
	import { onMount } from 'svelte';
	import ModelViewer from '$lib/components/ModelViewer.svelte';
	import { turbofanPartDescriptions, turbofanComponentGroups } from '$lib/data/turbofanParts';
	import { ttsService } from '$lib/utils/tts';

	let modelLoaded = $state(false);

	// Part descriptions for highlighting
	// Based on actual 3D model mesh names and colors
	const partDescriptions = turbofanPartDescriptions;

	let cameraResetTrigger = $state(0);
	let showInstructions = $state(true);
	let showLabels = $state(false);
	let isMuted = $state(false);

	onMount(() => {
		// Handle escape key to go back to turbofan engine
		const handleKeyPress = (e: KeyboardEvent) => {
			if (e.key === 'Escape') {
				goto('/turbofan-engine');
			}
		};

		window.addEventListener('keydown', handleKeyPress);

		document.body.classList.add('zone-turbofan');
		return () => {
			window.removeEventListener('keydown', handleKeyPress);
			document.body.classList.remove('zone-turbofan');
		};
	});

	function handleBackClick() {
		goto('/turbofan-engine');
	}

	function resetView() {
		// Trigger camera reset by changing the key
		cameraResetTrigger++;
	}

	function handleModelLoaded() {
		modelLoaded = true;

		// Preload TTS audio for all components for better performance
		const textsToPreload = turbofanComponentGroups.map(
			(group) => `${group.label}. ${group.description}`
		);
		ttsService.preload(textsToPreload).catch((error) => {
			console.warn('Failed to preload TTS audio:', error);
		});
	}
</script>

<div class="relative flex h-[calc(100vh-5rem)] flex-col p-2 md:p-4">
	<div
		class="z-10 mb-4 flex flex-col flex-wrap items-stretch justify-between gap-4 md:flex-row md:items-center"
	>
		<button
			class="font-heading flex items-center justify-center gap-2 rounded-lg border border-[#FFD966] bg-[#FFD966]/90 px-5 py-2.5 text-sm font-medium tracking-wide text-white uppercase shadow-md transition-all hover:-translate-y-0.5 hover:bg-[#FFD966] hover:shadow-lg md:text-base"
			onclick={handleBackClick}
		>
			<svg
				xmlns="http://www.w3.org/2000/svg"
				width="24"
				height="24"
				viewBox="0 0 24 24"
				fill="none"
				stroke="currentColor"
				stroke-width="2"
				stroke-linecap="round"
				stroke-linejoin="round"
			>
				<line x1="19" y1="12" x2="5" y2="12"></line>
				<polyline points="12 19 5 12 12 5"></polyline>
			</svg>
			Back to Turbofan Engine
		</button>

		<div class="flex flex-wrap justify-center gap-3">
			<button
				class="font-heading flex items-center gap-2 rounded-lg border border-white/20 bg-white/10 px-5 py-2.5 text-sm font-medium tracking-wide text-gray-200 uppercase shadow-md backdrop-blur-md transition-all hover:-translate-y-0.5 hover:border-[#5da8cb] hover:bg-[#5da8cb]/30 hover:text-white hover:shadow-lg md:text-base"
				title="View Instructions"
				onclick={() => (showInstructions = true)}
			>
				<svg
					xmlns="http://www.w3.org/2000/svg"
					width="20"
					height="20"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					stroke-width="2"
					stroke-linecap="round"
					stroke-linejoin="round"
				>
					<circle cx="12" cy="12" r="10"></circle>
					<path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path>
					<line x1="12" y1="17" x2="12.01" y2="17"></line>
				</svg>
				Help
			</button>

			<button
				class="font-heading flex items-center gap-2 rounded-lg border px-5 py-2.5 text-sm font-medium tracking-wide uppercase shadow-md backdrop-blur-md transition-all hover:-translate-y-0.5 hover:shadow-lg md:text-base {isMuted
					? 'border-[#FFD966] bg-[#FFD966]/20 text-[#FFD966] shadow-[0_0_15px_rgba(255,217,102,0.3)]'
					: 'border-white/20 bg-white/10 text-gray-200 hover:border-[#5da8cb] hover:bg-[#5da8cb]/30 hover:text-white'}"
				title={isMuted ? 'Unmute Audio' : 'Mute Audio'}
				onclick={() => {
					isMuted = !isMuted;
					ttsService.setMuted(isMuted);
				}}
			>
				{#if isMuted}
					<!-- Muted Icon -->
					<svg
						xmlns="http://www.w3.org/2000/svg"
						width="20"
						height="20"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						stroke-width="2"
						stroke-linecap="round"
						stroke-linejoin="round"
					>
						<path d="M11 5L6 9H2v6h4l5 4V5z"></path>
						<line x1="23" y1="9" x2="17" y2="15"></line>
						<line x1="17" y1="9" x2="23" y2="15"></line>
					</svg>
					Unmute
				{:else}
					<!-- Volume Icon -->
					<svg
						xmlns="http://www.w3.org/2000/svg"
						width="20"
						height="20"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						stroke-width="2"
						stroke-linecap="round"
						stroke-linejoin="round"
					>
						<polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
						<path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"></path>
					</svg>
					Mute Audio
				{/if}
			</button>

			<button
				class="font-heading flex items-center gap-2 rounded-lg border border-white/20 bg-white/10 px-5 py-2.5 text-sm font-medium tracking-wide text-gray-200 uppercase shadow-md backdrop-blur-md transition-all hover:-translate-y-0.5 hover:border-[#5da8cb] hover:bg-[#5da8cb]/30 hover:text-white hover:shadow-lg md:text-base"
				title="Reset View"
				onclick={resetView}
			>
				<svg
					xmlns="http://www.w3.org/2000/svg"
					width="20"
					height="20"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					stroke-width="2"
					stroke-linecap="round"
					stroke-linejoin="round"
				>
					<polyline points="23 4 23 10 17 10"></polyline>
					<polyline points="1 20 1 14 7 14"></polyline>
					<path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"></path>
				</svg>
				Reset
			</button>
		</div>
	</div>

	<!-- Instructions Modal -->
	{#if showInstructions}
		<div
			class="fixed inset-0 top-20 z-[1100] flex items-start justify-center overflow-y-auto bg-black/85 p-8 backdrop-blur-sm"
			role="button"
			tabindex="0"
			onclick={() => (showInstructions = false)}
			onkeydown={(e) => e.key === 'Enter' && (showInstructions = false)}
		>
			<div
				class="m-auto w-[95%] max-w-[800px] rounded-2xl border-2 border-white/10 bg-gradient-to-br from-[#2d3561] to-[#1f2544] p-5 shadow-[0_20px_60px_rgba(0,0,0,0.5)]"
				role="button"
				tabindex="0"
				onclick={(e) => e.stopPropagation()}
				onkeydown={(e) => e.stopPropagation()}
			>
				<div class="flex flex-col gap-3">
					<h1
						class="animate-gradient-flash gradient-animated font-heading m-0 text-center text-2xl font-black drop-shadow-md md:text-3xl"
					>
						Welcome aboard!
					</h1>
					<p class="font-body mb-2 text-center text-sm text-[#00CED1] drop-shadow-md">
						Explore your 3D Turbofan Engine:
					</p>

					<div class="mb-4 grid grid-cols-1 gap-3 md:grid-cols-2">
						{#each [{ icon: 'zoom', title: 'Zoom In & Out', desc: 'Use your mouse scroll to get closer or step back for the full view.' }, { icon: 'rotate', title: 'Rotate the Engine', desc: 'Hold the left mouse button and move around to inspect every angle.' }, { icon: 'explore', title: 'Explore Components', desc: 'Click any part to see its definition and hear a voice explanation.' }, { icon: 'labels', title: 'Toggle Labels', desc: 'Turn component labels on or off to reduce clutter or check details.' }] as item}
							<div
								class="flex items-start gap-4 rounded-2xl border border-white/10 bg-white/5 p-4 transition-all hover:translate-x-1 hover:border-sky-300/40 hover:bg-white/10"
							>
								<div class="shrink-0 text-2xl text-[#00CED1] drop-shadow-md">
									{#if item.icon === 'zoom'}
										<svg
											xmlns="http://www.w3.org/2000/svg"
											width="24"
											height="24"
											viewBox="0 0 24 24"
											fill="none"
											stroke="currentColor"
											stroke-width="2"
											stroke-linecap="round"
											stroke-linejoin="round"
											><circle cx="11" cy="11" r="8"></circle><line
												x1="21"
												y1="21"
												x2="16.65"
												y2="16.65"
											></line><line x1="11" y1="8" x2="11" y2="14"></line><line
												x1="8"
												y1="11"
												x2="11"
												y2="14"
											></line></svg
										>
									{:else if item.icon === 'rotate'}
										<svg
											xmlns="http://www.w3.org/2000/svg"
											width="24"
											height="24"
											viewBox="0 0 24 24"
											fill="none"
											stroke="currentColor"
											stroke-width="2"
											stroke-linecap="round"
											stroke-linejoin="round"
											><path
												d="M21.5 2v6h-6M2.5 22v-6h6M2 11.5a10 10 0 0 1 18.8-4.3M22 12.5a10 10 0 0 1-18.8 4.2"
											/></svg
										>
									{:else if item.icon === 'explore'}
										<svg
											xmlns="http://www.w3.org/2000/svg"
											width="24"
											height="24"
											viewBox="0 0 24 24"
											fill="none"
											stroke="currentColor"
											stroke-width="2"
											stroke-linecap="round"
											stroke-linejoin="round"
											><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"
											></path><polyline points="15 3 21 3 21 9"></polyline><line
												x1="10"
												y1="14"
												x2="21"
												y2="3"
											></line></svg
										>
									{:else}
										<svg
											xmlns="http://www.w3.org/2000/svg"
											width="24"
											height="24"
											viewBox="0 0 24 24"
											fill="none"
											stroke="currentColor"
											stroke-width="2"
											stroke-linecap="round"
											stroke-linejoin="round"
											><path
												d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"
											></path><line x1="7" y1="7" x2="7.01" y2="7"></line></svg
										>
									{/if}
								</div>
								<div class="font-body text-base leading-relaxed text-gray-200">
									<strong class="mb-1 block font-bold text-[#FFD966]">{item.title}:</strong>
									{item.desc}
								</div>
							</div>
						{/each}
					</div>

					<div class="my-6 rounded-r-lg border-l-4 border-[#00d4ff] bg-[#00d4ff]/10 p-4">
						<p class="font-body m-0 text-base leading-relaxed text-gray-200">
							<strong class="text-[#00d4ff]">Tip from JAJA:</strong> Take your time, click around, and
							discover every part of the engine—learning is just a click away!
						</p>
					</div>

					<div class="mt-4 border-t border-sky-300/20 pt-4 text-center">
						<p class="font-heading m-0 animate-pulse text-base font-bold text-[#00CED1]">
							Click "Start Exploring" to continue
						</p>
					</div>
				</div>
				<button
					class="font-heading mt-4 w-full rounded-lg border-none bg-gradient-to-br from-[#4fc3f7] to-[#2196f3] p-4 text-lg font-bold tracking-widest text-white uppercase transition-all hover:-translate-y-0.5 hover:shadow-[0_10px_25px_rgba(79,195,247,0.3)]"
					onclick={() => (showInstructions = false)}
				>
					Start Exploring
				</button>
			</div>
		</div>
	{/if}

	<div
		class="relative mb-4 flex min-h-[400px] flex-1 animate-[fadeIn_0.6s_ease] overflow-hidden rounded-3xl border-2 border-sky-300/30 bg-[#0a2f35]/60 shadow-[0_20px_60px_rgba(0,0,0,0.5)] backdrop-blur-xl md:min-h-[600px]"
	>
		{#if !modelLoaded}
			<div
				class="absolute inset-0 z-[100] flex flex-col items-center justify-center gap-6 bg-[#0a2f35]/90"
			>
				<div
					class="h-[60px] w-[60px] animate-spin rounded-full border-4 border-sky-300/20 border-t-[#E8F4FA]"
				></div>
				<p class="font-heading text-xl font-semibold text-[#00CED1]">Loading 3D Model...</p>
			</div>
		{/if}

		{#key cameraResetTrigger}
			<ModelViewer
				modelPath="/models/Turbofan.glb"
				canvasClass="fullscreen-canvas"
				cameraPosition={{ alpha: Math.PI / 2, beta: Math.PI / 3, radius: 8 }}
				enableHighlight={true}
				{partDescriptions}
				onModelLoaded={handleModelLoaded}
				enableTTS={true}
				autoLoad={true}
				enableDefaultControls={true}
				{showLabels}
			/>
		{/key}
	</div>

	<div
		class="rounded-2xl border border-sky-300/20 bg-[#0a2f35]/70 p-2 text-center backdrop-blur-md"
	>
		<p
			class="animate-gradient-flash gradient-animated font-heading m-0 text-xl font-black md:text-2xl"
		>
			Press <kbd
				class="mx-1 inline-block rounded border border-[#FFD966] bg-[#FFD966]/30 px-2 py-1 font-mono text-base font-bold text-[#FFD966]"
				>ESC</kbd
			> to return to Turbofan Engine
		</p>
	</div>
</div>
