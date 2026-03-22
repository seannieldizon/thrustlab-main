<script lang="ts">
	import { onMount } from 'svelte';

	let mounted = $state(false);

	onMount(() => {
		mounted = true;
		document.body.classList.add('zone-overhaul');

		// Safety: Ensure scrolling is enabled when page loads
		if (typeof document !== 'undefined') {
			document.body.classList.remove('page-transitioning');
			document.body.style.removeProperty('overflow');
			document.documentElement.style.removeProperty('overflow');
			console.log('Overhaul Station mounted - scroll enabled');
		}

		return () => {
			document.body.classList.remove('zone-overhaul');
			// Safety: Ensure scroll remains enabled on cleanup
			if (typeof document !== 'undefined') {
				document.body.style.removeProperty('overflow');
				document.documentElement.style.removeProperty('overflow');
			}
		};
	});
</script>

<!-- Page Content -->
<div
	class="relative z-10 mx-auto min-h-screen max-w-[1400px] px-4 pt-32 pb-24 md:px-8 md:pt-40 md:pb-16"
>
	<div class="mb-12 text-center md:px-4">
		<h1
			class="animate-gradient-flash gradient-animated font-heading mb-6 bg-clip-text text-5xl font-black tracking-tight text-transparent drop-shadow-[0_4px_10px_rgba(14,165,233,0.4)] md:text-8xl"
			style="--active-gradient: linear-gradient(90deg, #0ea5e9 0%, #e0f7fa 50%, #0ea5e9 100%);"
		>
			Overhaul Station
		</h1>
		<p
			class="mx-auto max-w-[900px] text-center text-xl leading-relaxed font-bold text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] md:text-2xl"
			style="font-family: 'Gotham', 'Gotham Bold', sans-serif;"
		>
			Step into the Overhaul Station, where hands-on learning takes flight. In this interactive
			zone, students <span class="text-[#00CED1]"
				>dive into the intricate process of assembling and disassembling turbofan engine components</span
			>—gaining a deeper understanding of each part's role and the essential principles of gas
			turbine engine overhaul. It's where theory meets practice, transforming knowledge into
			real-world technical skill.
		</p>
	</div>

	<div class="mx-auto mt-12 grid max-w-6xl grid-cols-1 gap-6 md:grid-cols-2">
		<a
			href="/overhaul-station/preliminary-module"
			class="group relative flex min-h-[300px] flex-col items-center justify-center overflow-hidden rounded-[40px] border-4 border-[#0ea5e9] bg-white p-8 text-center shadow-xl transition-all duration-300 hover:-translate-y-2 hover:border-[#FFD966] hover:bg-white hover:shadow-[0_20px_40px_rgba(255,217,102,0.2)]"
		>
			<div
				class="relative z-10 flex flex-col items-center gap-3 transition-all duration-300 group-hover:drop-shadow-[0_0_15px_rgba(14,165,233,0.8)]"
			>
				<h3 class="font-heading text-2xl leading-tight tracking-wide text-[#0ea5e9] md:text-6xl">
					PRELIMINARY<br />LABORATORY<br />MODULE
				</h3>
				<p
					class="max-w-[280px] text-center text-xl leading-relaxed text-[#1b3558]"
					style="font-family: 'Gotham', sans-serif;"
				>
					This module familiarizes students with the key steps of gas turbine engine
					overhaul—disassembly, inspection, repair, and testing—emphasizing efficiency, reliability,
					and hands-on maintenance skills.
				</p>
			</div>
			<div
				class="absolute right-8 bottom-8 text-[#0ea5e9] transition-all duration-300 group-hover:scale-[1.5] group-hover:text-[#FFD966]"
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
			href="/overhaul-station/assembly-disassembly"
			class="group relative flex min-h-[300px] flex-col items-center justify-center overflow-hidden rounded-[40px] border-4 border-[#0ea5e9] bg-white p-8 text-center shadow-xl transition-all duration-300 hover:-translate-y-2 hover:border-[#FFD966] hover:bg-white hover:shadow-[0_20px_40px_rgba(255,217,102,0.2)]"
		>
			<div
				class="relative z-10 flex flex-col items-center gap-3 transition-all duration-300 group-hover:drop-shadow-[0_0_15px_rgba(14,165,233,0.8)]"
			>
				<h3 class="font-heading text-2xl leading-tight tracking-wide text-[#0ea5e9] md:text-6xl">
					ASSEMBLY &<br />DISASSEMBLY<br />ACTIVITY
				</h3>
				<p
					class="max-w-[280px] text-center text-xl leading-relaxed text-[#1b3558]"
					style="font-family: 'Gotham', sans-serif;"
				>
					Students gain hands-on experience in taking apart and reassembling the main components of
					a turbofan engine, developing practical skills, precision, and a deeper understanding of
					how each part works together.
				</p>
			</div>
			<div
				class="absolute right-8 bottom-8 text-[#0ea5e9] transition-all duration-300 group-hover:scale-[1.5] group-hover:text-[#00CED1]"
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

<style>
	/* Removed custom CSS in favor of Tailwind */
</style>
