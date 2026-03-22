<script lang="ts">
	import { page } from '$app/state';
	import SkyBackground from '$lib/components/ui/SkyBackground.svelte';

	const errorCode = page.status;
	const errorMessage = page.error?.message || 'Page not found';
</script>

<SkyBackground useRealTime={true} />

<div class="fixed inset-0 flex flex-col items-center justify-center px-6 pt-20 pb-24">
	<!-- Error Content -->
	<div class="max-w-2xl text-center">
		<!-- Large Error Code -->
		<div class="mb-8">
			<h1
				class="animate-gradient-flash gradient-animated mb-4 text-9xl font-black tracking-tighter drop-shadow-2xl"
			>
				{errorCode}
			</h1>
			<div
				class="mx-auto h-1 w-32 rounded-full bg-gradient-to-r from-transparent via-sky-400 to-transparent"
			></div>
		</div>

		<!-- Error Message -->
		<h2 class="mb-4 text-3xl font-bold text-white drop-shadow-lg">
			{#if errorCode === 404}
				Flight Path Not Found
			{:else if errorCode === 500}
				System Malfunction
			{:else}
				Unexpected Turbulence
			{/if}
		</h2>

		<p class="mx-auto mb-12 max-w-xl text-lg leading-relaxed text-slate-300">
			{#if errorCode === 404}
				The page you're looking for has drifted off radar. Let's get you back on course.
			{:else if errorCode === 500}
				Our systems are experiencing technical difficulties. Our crew is working to fix this.
			{:else}
				{errorMessage}
			{/if}
		</p>

		<!-- Action Buttons -->
		<div class="mb-16 flex flex-col justify-center gap-4 sm:flex-row">
			<a
				href="/"
				class="group relative overflow-hidden rounded-2xl bg-gradient-to-r from-sky-600 to-sky-500 px-8 py-4 font-bold text-white shadow-[0_4px_20px_0_rgba(2,132,199,0.4)] transition-all hover:shadow-[0_6px_30px_0_rgba(2,132,199,0.6)] active:scale-[0.98]"
			>
				<div class="relative flex items-center justify-center gap-2">
					<svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
						/>
					</svg>
					Return Home
				</div>
			</a>

			<a
				href="/dashboard"
				class="relative overflow-hidden rounded-2xl border border-white/10 bg-slate-900/70 px-8 py-4 font-bold text-white shadow-lg backdrop-blur-xl transition-all hover:bg-slate-900/90 active:scale-[0.98]"
			>
				<div class="flex items-center justify-center gap-2">
					<svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
						/>
					</svg>
					Go to Dashboard
				</div>
			</a>
		</div>

		<!-- Help Hints -->
		<div class="grid grid-cols-1 gap-4 text-sm md:grid-cols-3">
			<div class="rounded-xl border border-white/10 bg-slate-900/50 p-4 backdrop-blur-md">
				<div class="mb-2 text-2xl text-sky-400">🔍</div>
				<div class="text-slate-300">Check the URL for typos</div>
			</div>
			<div class="rounded-xl border border-white/10 bg-slate-900/50 p-4 backdrop-blur-md">
				<div class="mb-2 text-2xl text-indigo-400">🧭</div>
				<div class="text-slate-300">Use the navigation menu</div>
			</div>
			<div class="rounded-xl border border-white/10 bg-slate-900/50 p-4 backdrop-blur-md">
				<div class="mb-2 text-2xl text-purple-400">📱</div>
				<div class="text-slate-300">Try refreshing the page</div>
			</div>
		</div>
	</div>

	<!-- Floating Background Elements -->
	<div class="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
		<!-- Animated circles -->
		<div
			class="absolute top-1/4 left-1/4 h-64 w-64 animate-pulse rounded-full bg-sky-500/5 blur-3xl"
		></div>
		<div
			class="absolute right-1/4 bottom-1/4 h-96 w-96 animate-pulse rounded-full bg-indigo-500/5 blur-3xl"
			style="animation-delay: 1s;"
		></div>
		<div
			class="absolute top-1/2 left-1/2 h-[32rem] w-[32rem] -translate-x-1/2 -translate-y-1/2 animate-pulse rounded-full bg-purple-500/5 blur-3xl"
			style="animation-delay: 2s;"
		></div>
	</div>
</div>

<style>
	@keyframes pulse {
		0%,
		100% {
			opacity: 0.3;
			transform: scale(1);
		}
		50% {
			opacity: 0.6;
			transform: scale(1.1);
		}
	}

	.animate-pulse {
		animation: pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite;
	}
</style>
