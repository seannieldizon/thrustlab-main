<script lang="ts">
	import AssemblyActivity from '$lib/components/AssemblyActivity.svelte';
	import { onMount } from 'svelte';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	onMount(() => {
		document.body.classList.add('zone-overhaul');
		return () => document.body.classList.remove('zone-overhaul');
	});
</script>

<!-- Page Container -->
<div
	class="relative z-10 mx-auto flex min-h-screen w-full flex-col px-4 pt-16 pb-24 md:px-12 md:pt-20 md:pb-16"
>
	{#if !data.session || !data.user}
		<!-- Auth Required Section -->
		<div class="flex min-h-[60vh] items-center justify-center p-4">
			<div
				class="w-full max-w-[600px] rounded-[1.5rem] border border-white/10 bg-[#1e3a5f]/60 p-8 text-center shadow-[0_20px_60px_rgba(0,0,0,0.3)] backdrop-blur-md md:p-12"
			>
				<div class="mb-4 animate-bounce text-6xl">🔒</div>
				<h1 class="font-heading mb-4 text-3xl font-black text-white drop-shadow-md md:text-4xl">
					Authentication Required
				</h1>
				<p class="font-body mb-8 text-lg leading-relaxed text-white/80">
					You need to be signed in to access the Assembly and Disassembly activity. Track your
					progress, save your scores, and compete with others!
				</p>
				<div class="mb-8 flex flex-col justify-center gap-4 sm:flex-row">
					<a
						href="/login"
						class="font-body inline-block rounded-xl bg-gradient-to-br from-[var(--ui-yellow)] to-[var(--font-accent-cyan)] px-10 py-4 text-lg font-bold tracking-wide text-[#0A2F35] uppercase shadow-lg transition-all hover:-translate-y-0.5 hover:shadow-xl"
						>Login</a
					>
					<a
						href="/sign-up"
						class="font-body inline-block rounded-xl border border-white/25 bg-white/10 px-10 py-4 text-lg font-bold tracking-wide text-white uppercase transition-all hover:-translate-y-0.5 hover:bg-white/15"
						>Sign Up</a
					>
				</div>
				<div class="mt-8 rounded-2xl border border-white/10 bg-white/5 p-6 text-left">
					<h3 class="font-heading mb-4 text-xl font-bold text-white">Why Sign In?</h3>
					<ul class="m-0 list-none p-0">
						<li class="font-body flex items-center gap-2 py-2 text-base text-white/80">
							<span class="text-[var(--font-accent-cyan)]">✓</span> Save your assembly scores
						</li>
						<li class="font-body flex items-center gap-2 py-2 text-base text-white/80">
							<span class="text-[var(--font-accent-cyan)]">✓</span> Track your learning progress
						</li>
						<li class="font-body flex items-center gap-2 py-2 text-base text-white/80">
							<span class="text-[var(--font-accent-cyan)]">✓</span> Access personalized feedback
						</li>
						<li class="font-body flex items-center gap-2 py-2 text-base text-white/80">
							<span class="text-[var(--font-accent-cyan)]">✓</span> Compete on leaderboards
						</li>
					</ul>
				</div>
			</div>
		</div>
	{:else}
		<!-- Header Section -->
		<div class="relative z-20 mb-8 flex w-full flex-col items-center">
			<div
				class="relative mb-[-1.5rem] flex w-full flex-col items-center gap-4 md:flex-row md:items-end md:justify-between"
			>
				<!-- Speech Bubble Box -->
				<div
					class="relative w-full overflow-hidden rounded-[1.5rem] border border-white/20 bg-gradient-to-br from-white/15 to-white/10 p-6 shadow-[0_18px_40px_rgba(0,0,0,0.22)] backdrop-blur-xl md:mb-8 md:flex-1 md:p-8"
				>
					<div
						class="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(255,255,255,0.2),transparent_50%)]"
					></div>
					<p
						class="font-body relative pr-4 text-lg leading-relaxed font-semibold text-[#1b3558] md:text-xl"
					>
						<span class="font-extrabold text-[#00CED1]">JAJA:</span> Yey! You've mastered the fundamentals
						of the turbofan engine! Now it's time to put that knowledge into action.
					</p>
				</div>

				<!-- Character Image -->
				<div class="relative z-20 h-48 w-auto shrink-0 md:ml-4 md:h-[18rem] md:w-auto">
					<img
						src="/images/jaja-vest.png"
						alt="Jaja Character"
						class="h-full w-full object-contain drop-shadow-md"
					/>
				</div>
			</div>

			<!-- Title Card -->
			<div
				class="relative z-10 w-full rounded-[1.5rem] border border-white/10 bg-[#1e3a5f]/60 p-8 text-center shadow-md backdrop-blur-xl md:p-12"
			>
				<h1
					class="font-heading animate-gradient-flash gradient-animated mb-6 text-4xl leading-tight font-black drop-shadow-lg md:text-7xl"
					style="--active-gradient: linear-gradient(90deg, #0ea5e9 0%, #e0f7fa 50%, #0ea5e9 100%); filter: drop-shadow(0 2px 4px rgba(0,0,0,0.8)) drop-shadow(0 4px 15px rgba(14,165,233,0.6));"
				>
					Assembly and Disassembly Activity
				</h1>
				<p
					class="font-body mx-auto max-w-[1000px] text-lg leading-relaxed text-white/90 md:text-xl"
				>
					<span class="font-bold text-[#00CED1]">Instruction:</span> Drag and drop each component of the
					turbofan engine to its correct position inside the casing. Pay attention to the order and orientation
					— each part has its special place in the engine!
				</p>
			</div>
		</div>

		<!-- Full Screen Activity -->
		<div class="mt-8 mb-12">
			<AssemblyActivity />
		</div>
	{/if}
</div>
