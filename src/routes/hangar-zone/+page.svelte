<script lang="ts">
	import { onMount } from 'svelte';

	onMount(() => {
		document.body.classList.add('zone-hangar');

		// Safety: Ensure scrolling is enabled when page loads
		if (typeof document !== 'undefined') {
			document.body.classList.remove('page-transitioning');
			document.body.style.removeProperty('overflow');
			document.documentElement.style.removeProperty('overflow');
			console.log('Hangar Zone mounted - scroll enabled');
		}

		return () => {
			document.body.classList.remove('zone-hangar');
			// Safety: Ensure scroll remains enabled on cleanup
			if (typeof document !== 'undefined') {
				document.body.style.removeProperty('overflow');
				document.documentElement.style.removeProperty('overflow');
			}
		};
	});
</script>

<div
	class="animate-on-scroll relative z-10 mx-auto min-h-screen max-w-7xl px-4 pt-16 pb-24 md:px-8 md:pt-20"
>
	<div class="mb-12 text-center">
		<h1
			class="animate-gradient-flash gradient-animated font-heading mb-6 bg-clip-text pb-4 text-6xl font-black tracking-tight text-transparent drop-shadow-[0_0_25px_rgba(14,165,233,0.6)] md:text-8xl"
			style="--active-gradient: linear-gradient(90deg, #0ea5e9 0%, #e0f7fa 50%, #0ea5e9 100%);"
		>
			Hangar Zone
		</h1>
		<p
			class="mx-auto mb-8 max-w-[900px] text-center text-xl leading-relaxed font-bold text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] md:text-2xl"
			style="font-family: 'Gotham', 'Gotham Bold', sans-serif;"
		>
			Welcome to the Hangar Zone, a <span class="text-sky-400"
				>learning space where students journey through the history and evolution of gas turbine
				engines</span
			>. Here, they'll discover how these powerful machines have developed over time—from early
			designs to the advanced engines that power today's aircraft—building a strong foundation for
			deeper exploration ahead.
		</p>
	</div>

	<div class="mx-auto mt-12 grid max-w-6xl grid-cols-1 gap-6 md:grid-cols-2">
		<a
			href="/hangar-zone/module/history"
			class="group relative flex min-h-[300px] flex-col items-center justify-center overflow-hidden rounded-[40px] border-4 border-[#1b3558] bg-white p-8 text-center shadow-xl transition-all duration-300 hover:-translate-y-2 hover:border-[#FFD966] hover:bg-white hover:shadow-[0_20px_40px_rgba(255,217,102,0.2)]"
			style="color: #1b3558;"
		>
			<div
				class="relative z-10 flex flex-col items-center gap-2 transition-all duration-300 group-hover:drop-shadow-[0_0_15px_rgba(255,217,102,0.8)]"
			>
				<span class="text-3xl font-normal tracking-widest uppercase">LEARNING</span>
				<span class="mb-1 text-3xl font-bold tracking-wider uppercase">MODULE 01:</span>
				<h3
					class="font-heading text-xl leading-tight font-bold tracking-wide uppercase drop-shadow-[0_2px_4px_rgba(0,0,0,0.05)] md:text-5xl"
				>
					HISTORY OF<br />GAS TURBINE<br />ENGINES
				</h3>
			</div>
			<div
				class="absolute right-8 bottom-8 text-[#1b3558] transition-all duration-300 group-hover:scale-[1.5] group-hover:text-[#FFD966]"
			>
				<svg
					width="32"
					height="32"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					stroke-width="3"
					stroke-linecap="round"
					stroke-linejoin="round"
				>
					<line x1="5" y1="12" x2="19" y2="12"></line>
					<polyline points="12 5 19 12 12 19"></polyline>
				</svg>
			</div>
		</a>

		<a
			href="/hangar-zone/module/types"
			class="group relative flex min-h-[300px] flex-col items-center justify-center overflow-hidden rounded-[40px] border-4 border-[#1b3558] bg-white p-8 text-center shadow-xl transition-all duration-300 hover:-translate-y-2 hover:border-[#FFD966] hover:bg-white hover:shadow-[0_20px_40px_rgba(255,217,102,0.2)]"
			style="color: #1b3558;"
		>
			<div
				class="relative z-10 flex flex-col items-center gap-2 transition-all duration-300 group-hover:drop-shadow-[0_0_15px_rgba(255,217,102,0.8)]"
			>
				<span class="text-3xl font-normal tracking-widest uppercase">LEARNING</span>
				<span class="mb-1 text-3xl font-bold tracking-wider uppercase">MODULE 02:</span>
				<h3
					class="font-heading text-xl leading-tight font-bold tracking-wide uppercase drop-shadow-[0_2px_4px_rgba(0,0,0,0.05)] md:text-5xl"
				>
					TYPES OF GAS<br />TURBINE<br />ENGINES
				</h3>
			</div>
			<div
				class="absolute right-8 bottom-8 text-[#1b3558] transition-all duration-300 group-hover:scale-[1.5] group-hover:text-[#FFD966]"
			>
				<svg
					width="32"
					height="32"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					stroke-width="3"
					stroke-linecap="round"
					stroke-linejoin="round"
				>
					<line x1="5" y1="12" x2="19" y2="12"></line>
					<polyline points="12 5 19 12 12 19"></polyline>
				</svg>
			</div>
		</a>
	</div>
</div>
