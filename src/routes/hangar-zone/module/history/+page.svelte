<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import { fade, fly } from 'svelte/transition';
	import { searchQuery, showSearchModal, performSearch } from '$lib/stores/searchStore';
	import { MODULE_CONTENT } from '$lib/data/searchContent';
	import SearchModal from '$lib/components/SearchModal.svelte';
	import ImageModal from '$lib/components/ui/ImageModal.svelte';
	import ImageGrid from '$lib/components/ui/ImageGrid.svelte';
	import SectionHeader from '$lib/components/ui/SectionHeader.svelte';
	import { onMount } from 'svelte';

	const totalPages = 4;

	// Reactive statement to get current page from URL
	$: currentPage = parseInt($page.url.searchParams.get('page') || '1');

	// Ensure currentPage is within valid range
	$: if (currentPage < 1) currentPage = 1;
	$: if (currentPage > totalPages) currentPage = totalPages;

	function handleSearch() {
		if ($searchQuery.trim()) {
			performSearch($searchQuery, MODULE_CONTENT);
			showSearchModal.set(true);
		}
	}

	function scrollToTop() {
		window.scrollTo({ top: 0, behavior: 'smooth' });
	}

	function goToPage(pageNum: number) {
		if (pageNum >= 1 && pageNum <= totalPages) {
			goto(`/hangar-zone/module/history?page=${pageNum}`);
			scrollToTop();
		}
	}

	function nextPage() {
		if (currentPage < totalPages) {
			goToPage(currentPage + 1);
		} else {
			goto('/hangar-zone/module/types');
		}
	}

	function prevPage() {
		if (currentPage > 1) {
			goToPage(currentPage - 1);
		} else {
			goto('/hangar-zone');
		}
	}

	function handleKeydown(event: KeyboardEvent) {
		if (event.key === 'ArrowLeft') {
			prevPage();
		} else if (event.key === 'ArrowRight') {
			nextPage();
		}
	}

	onMount(() => {
		document.body.classList.add('zone-hangar');
		return () => document.body.classList.remove('zone-hangar');
	});
</script>

<svelte:window on:keydown={handleKeydown} />

<!-- Main wrapper: added pb-24 to ensure content isn't hidden behind sticky nav on mobile -->
<div class="relative z-10 mx-auto min-h-screen max-w-7xl px-4 py-24 pb-32 md:px-8 md:pb-24">
	<SearchModal />
	<ImageModal />

	<!-- Header Section -->
	<div class="mb-12 flex flex-col items-center gap-6">
		<h1
			class="font-heading animate-gradient-flash gradient-animated text-center text-4xl leading-tight font-black uppercase drop-shadow-md md:text-6xl"
		>
			Learning Module 01:<br />History of Gas Turbine Engines
		</h1>
		<div
			class="flex w-full items-center self-center rounded-full border-2 border-[#1b3558] bg-white px-4 py-2 shadow-sm transition-all focus-within:ring-4 focus-within:ring-[#00CED1]/20 md:w-[350px] md:self-end"
		>
			<input
				type="text"
				placeholder="Looking for something?"
				bind:value={$searchQuery}
				on:keydown={(e) => e.key === 'Enter' && handleSearch()}
				class="font-body flex-1 border-none bg-transparent text-base text-[#1b3558] placeholder-[#657786] outline-none"
			/>
			<button
				on:click={handleSearch}
				class="cursor-pointer border-none bg-transparent p-1 text-[#1b3558] transition-colors hover:text-[#00CED1]"
				aria-label="Search"
			>
				<svg
					width="20"
					height="20"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					stroke-width="2"
				>
					<circle cx="11" cy="11" r="8"></circle>
					<path d="m21 21-4.35-4.35"></path>
				</svg>
			</button>
		</div>
	</div>

	<!-- Content Sections -->
	{#if currentPage === 1}
		<div
			class="mb-16 flex flex-col gap-16"
			in:fly={{ y: 20, duration: 400, delay: 200 }}
			out:fade={{ duration: 200 }}
		>
			<!-- Section 1 -->
			<section>
				<SectionHeader title="PRINCIPLE OF JET PROPULSION" />
				<div
					class="relative z-10 -mt-[2px] rounded-tr-3xl rounded-b-3xl border-4 border-[#1b3558] bg-white p-6 text-[#1b3558] shadow-xl md:p-8"
				>
					<ImageGrid
						images={[
							{ src: '/images/hangar-zone/history/1.png', alt: 'Principle of Jet Propulsion' }
						]}
						columns={1}
						height="300px"
					/>
					<ul class="mt-6 space-y-4">
						<li class="font-body relative pl-6 text-lg leading-relaxed text-[#1E3A5F]">
							<span class="absolute top-1 left-0 font-bold text-[#00CED1]">▸</span>
							<strong>Isaac Newton's Third Law of Motion</strong> states that for every force acting on
							a body, there is an opposite and equal reaction.
						</li>
						<li class="font-body relative pl-6 text-lg leading-relaxed text-[#1E3A5F]">
							<span class="absolute top-1 left-0 font-bold text-[#00CED1]">▸</span>
							<strong>Jet propulsion</strong> is the force which is generated in the opposite direction
							to that of a discharge of fluid under pressure, escaping through an opening.
						</li>
						<li class="font-body relative pl-6 text-lg leading-relaxed text-[#1E3A5F]">
							<span class="absolute top-1 left-0 font-bold text-[#00CED1]">▸</span>
							Whatever form the device utilizes for jet propulsion, it is essentially a reaction engine
							that operates according to <strong>Sir Isaac Newton's Third Law of Motion</strong>.
						</li>
					</ul>
				</div>
			</section>

			<!-- Section 2 -->
			<section>
				<SectionHeader title="HISTORY OF JET PROPULSION" />
				<div
					class="relative z-10 -mt-[2px] rounded-tr-3xl rounded-b-3xl border-4 border-[#1b3558] bg-white p-6 text-[#1b3558] shadow-xl md:p-8"
				>
					<!-- Timeline Items -->
					<div
						class="mb-8 grid grid-cols-1 gap-6 border-b border-slate-200 pb-8 last:mb-0 last:border-0 last:pb-0 md:grid-cols-[100px_1fr]"
					>
						<div
							class="font-heading h-fit rounded border-l-4 border-[#FFD966] bg-[#FFD966]/20 px-3 py-1 text-center font-bold text-[#1b3558]"
						>
							250 B.C.
						</div>
						<div>
							<p class="mb-4 text-lg leading-relaxed text-[#1E3A5F]">
								A writer and mathematician named <strong>Hero</strong> devised a toy that used the
								reaction principle. The toy, called the <strong>aeolipile</strong>, consisted of a
								covered kettle of water that was heated to produce steam.
							</p>
							<ImageGrid
								images={[{ src: '/images/hangar-zone/history/2.png', alt: 'Aeolipile' }]}
								columns={1}
								height="260px"
							/>
						</div>
					</div>

					<div
						class="mb-8 grid grid-cols-1 gap-6 border-b border-slate-200 pb-8 last:mb-0 last:border-0 last:pb-0 md:grid-cols-[100px_1fr]"
					>
						<div
							class="font-heading h-fit rounded border-l-4 border-[#FFD966] bg-[#FFD966]/20 px-3 py-1 text-center font-bold text-[#1b3558]"
						>
							1791
						</div>
						<div>
							<p class="mb-4 text-lg leading-relaxed text-[#1E3A5F]">
								The first patent covering a gas turbine was granted to <strong>John Barber</strong> of
								England. It included all the essential elements of the modern gas turbine except that
								it had a reciprocating-type compressor.
							</p>
							<ImageGrid
								images={[
									{
										src: '/images/hangar-zone/history/3.png',
										alt: "John Barber's Gas Turbine Patent"
									}
								]}
								columns={1}
								height="260px"
							/>
						</div>
					</div>

					<div
						class="mb-8 grid grid-cols-1 gap-6 border-b border-slate-200 pb-8 last:mb-0 last:border-0 last:pb-0 md:grid-cols-[100px_1fr]"
					>
						<div
							class="font-heading h-fit rounded border-l-4 border-[#FFD966] bg-[#FFD966]/20 px-3 py-1 text-center font-bold text-[#1b3558]"
						>
							1900
						</div>
						<div>
							<p class="mb-4 text-lg leading-relaxed text-[#1E3A5F]">
								The history of mechanical jet propulsion began in 1900, when <strong
									>Dr. Sanford Moss</strong
								>
								applied some of his concepts in the development of the
								<strong>turbo-supercharger</strong>. This unique supercharger consisted of a small
								turbine wheel that was driven by exhaust gases. The turbine was then used to drive a
								supercharger.
							</p>
							<p class="text-lg leading-relaxed text-[#1E3A5F]">
								Research done by Dr. Moss influenced <strong>Frank Whittle</strong> of England in the
								development of what became the first successful turbojet engine.
							</p>
						</div>
					</div>
				</div>
			</section>
		</div>
	{/if}

	{#if currentPage === 2}
		<!-- Page 2 -->
		<div
			class="mb-16 flex flex-col gap-16"
			in:fly={{ y: 20, duration: 400, delay: 200 }}
			out:fade={{ duration: 200 }}
		>
			<section>
				<SectionHeader title="MODERN JET ENGINE DEVELOPMENT" />
				<div
					class="relative z-10 -mt-[2px] rounded-tr-3xl rounded-b-3xl border-4 border-[#1b3558] bg-white p-6 text-[#1b3558] shadow-xl md:p-8"
				>
					<div
						class="mb-8 grid grid-cols-1 gap-6 border-b border-slate-200 pb-8 last:mb-0 last:border-0 last:pb-0 md:grid-cols-[100px_1fr]"
					>
						<div
							class="font-heading h-fit rounded border-l-4 border-[#FFD966] bg-[#FFD966]/20 px-3 py-1 text-center font-bold text-[#1b3558]"
						>
							1930
						</div>
						<div>
							<p class="mb-4 text-lg leading-relaxed text-[#1E3A5F]">
								<strong>Frank Whittle</strong> of England developed what became the first successful turbojet
								engine and was granted his first patent for the jet engine.
							</p>
							<ImageGrid
								images={[
									{ src: '/images/hangar-zone/history/4.png', alt: "Frank Whittle's Engine" }
								]}
								columns={1}
								height="260px"
							/>
						</div>
					</div>

					<div
						class="mb-8 grid grid-cols-1 gap-6 border-b border-slate-200 pb-8 last:mb-0 last:border-0 last:pb-0 md:grid-cols-[100px_1fr]"
					>
						<div
							class="font-heading h-fit rounded border-l-4 border-[#FFD966] bg-[#FFD966]/20 px-3 py-1 text-center font-bold text-[#1b3558]"
						>
							1936
						</div>
						<div>
							<p class="mb-4 text-lg leading-relaxed text-[#1E3A5F]">
								While Whittle was developing the gas turbine engine in England, <strong
									>Hans von Ohain</strong
								>, a German engineer, designed and built a jet engine that produced 1,100 pounds of
								thrust. This engine was installed in the <strong>Heinkel He-178 aircraft</strong> in
								<strong>1939</strong>, which became recognized as the first practical flight by a
								jet-propelled aircraft.
							</p>
							<ImageGrid
								images={[
									{ src: '/images/hangar-zone/history/5.png', alt: 'Heinkel He-178 Aircraft' }
								]}
								columns={1}
								height="260px"
							/>
						</div>
					</div>

					<div
						class="mb-8 grid grid-cols-1 gap-6 border-b border-slate-200 pb-8 last:mb-0 last:border-0 last:pb-0 md:grid-cols-[100px_1fr]"
					>
						<div
							class="font-heading h-fit rounded border-l-4 border-[#FFD966] bg-[#FFD966]/20 px-3 py-1 text-center font-bold text-[#1b3558]"
						>
							1941
						</div>
						<div>
							<p class="mb-4 text-lg leading-relaxed text-[#1E3A5F]">
								Frank Whittle's engine completed its first flight in a <strong
									>Gloster model E28/39</strong
								> aircraft. The engine produced about one thousand pounds of thrust and propelled the
								aircraft at speeds over 400 miles per hour.
							</p>
							<ImageGrid
								images={[
									{ src: '/images/hangar-zone/history/6_1.png', alt: 'Gloster E28/39 Aircraft' },
									{ src: '/images/hangar-zone/history/6_2.png', alt: 'Gloster E28/39 in Flight' }
								]}
								columns={2}
								height="260px"
							/>
							<p
								class="my-4 rounded-lg border-l-4 border-[#00CED1] bg-[#00CED1]/10 p-4 text-lg font-bold text-[#0A2F35] italic"
							>
								The majority of commercial aircraft utilize some form of jet propulsion.
							</p>
							<p class="mb-4 text-lg leading-relaxed text-[#1E3A5F]">
								Another step in the progression of commercial and military aviation was the ability
								to produce an engine that would propel an aircraft faster than the speed of sound.
								Such aircraft are the SR-71 Blackbird which flies in excess of Mach five and the
								Concorde capable of flying 2.2 times the speed of sound.
							</p>
							<ImageGrid
								images={[
									{ src: '/images/hangar-zone/history/7_1.png', alt: 'SR-71 Blackbird' },
									{ src: '/images/hangar-zone/history/7_2.png', alt: 'Concorde' }
								]}
								columns={2}
								height="260px"
							/>
						</div>
					</div>
				</div>
			</section>
		</div>
	{/if}

	{#if currentPage === 3}
		<!-- Page 3 -->
		<div
			class="mb-16 flex flex-col gap-16"
			in:fly={{ y: 20, duration: 400, delay: 200 }}
			out:fade={{ duration: 200 }}
		>
			<section>
				<SectionHeader title="PROPULSION DEVICES" />
				<div
					class="relative z-10 -mt-[2px] rounded-tr-3xl rounded-b-3xl border-4 border-[#1b3558] bg-white p-6 text-[#1b3558] shadow-xl md:p-8"
				>
					<div class="mb-8 border-b border-slate-200 pb-8 last:mb-0 last:border-0 last:pb-0">
						<h3
							class="font-heading mb-4 border-b-2 border-[#FFD966]/50 pb-2 text-xl font-bold text-[#1b3558]"
						>
							AIR BREATHING
						</h3>
						<ul class="mb-6 space-y-4">
							<li class="font-body relative pl-6 text-lg leading-relaxed text-[#1E3A5F]">
								<span class="absolute top-1 left-0 font-bold text-[#00CED1]">▸</span>
								Uses atmospheric air and some fuel as the main propellant.
							</li>
							<li class="font-body relative pl-6 text-lg leading-relaxed text-[#1E3A5F]">
								<span class="absolute top-1 left-0 font-bold text-[#00CED1]">▸</span>
								Examples are piston engines, ramjet, scramjet, pulsejet, and gas turbine engines.
							</li>
						</ul>
						<ImageGrid
							images={[
								{
									src: '/images/hangar-zone/history/8_1.png',
									alt: 'Air Breathing Engine Example 1'
								},
								{
									src: '/images/hangar-zone/history/8_2.png',
									alt: 'Air Breathing Engine Example 2'
								}
							]}
							columns={2}
							height="260px"
						/>
					</div>

					<div class="mb-8 border-b border-slate-200 pb-8 last:mb-0 last:border-0 last:pb-0">
						<h3
							class="font-heading mb-4 border-b-2 border-[#FFD966]/50 pb-2 text-xl font-bold text-[#1b3558]"
						>
							ROCKETS
						</h3>
						<ul class="mb-6 space-y-4">
							<li class="font-body relative pl-6 text-lg leading-relaxed text-[#1E3A5F]">
								<span class="absolute top-1 left-0 font-bold text-[#00CED1]">▸</span>
								Carries the entire propellant composed of liquid or solid fuel and oxygen.
							</li>
						</ul>
						<ImageGrid
							images={[{ src: '/images/hangar-zone/history/9.png', alt: 'Rocket Engine' }]}
							columns={1}
							height="260px"
						/>
					</div>
				</div>
			</section>

			<section>
				<SectionHeader title="JET ENGINES – BASIC OPERATION" />
				<div
					class="relative z-10 -mt-[2px] rounded-tr-3xl rounded-b-3xl border-4 border-[#1b3558] bg-white p-6 text-[#1b3558] shadow-xl md:p-8"
				>
					<div class="grid grid-cols-1 items-start gap-8 md:grid-cols-2">
						<div class="overflow-hidden rounded-xl border-2 border-[#1b3558]/20 shadow-md">
							<ImageGrid
								images={[
									{
										src: '/images/hangar-zone/history/10.png',
										alt: 'Jet Engine Operation Diagram'
									}
								]}
								columns={1}
							/>
						</div>
						<div class="flex flex-col justify-center">
							<ol class="list-decimal space-y-3 pl-6 marker:font-bold marker:text-[#00CED1]">
								<li class="pl-2 text-lg text-[#1E3A5F]">
									Air enters the trough through the intake duct (cowl).
								</li>
								<li class="pl-2 text-lg text-[#1E3A5F]">
									Air is compressed by passage through the compressor.
								</li>
								<li class="pl-2 text-lg text-[#1E3A5F]">
									Mixed with fuel in the combustion chamber.
								</li>
								<li class="pl-2 text-lg text-[#1E3A5F]">
									Fuel is ignited, Pressure and Temperature raised.
								</li>
								<li class="pl-2 text-lg text-[#1E3A5F]">
									Some of the pressure used to turn a turbine;
								</li>
								<li class="pl-2 text-lg text-[#1E3A5F]">
									The turbine shaft drives the compressor.
								</li>
								<li class="pl-2 text-lg text-[#1E3A5F]">
									Hot, high-pressure air is forced through a nozzle.
								</li>
								<li class="pl-2 text-lg text-[#1E3A5F]">
									The reaction force is the engine thrust.
								</li>
							</ol>
						</div>
					</div>
				</div>
			</section>
		</div>
	{/if}

	{#if currentPage === 4}
		<!-- Page 4 -->
		<div
			class="mb-16 flex flex-col gap-16"
			in:fly={{ y: 20, duration: 400, delay: 200 }}
			out:fade={{ duration: 200 }}
		>
			<section>
				<SectionHeader title="TYPES OF JET ENGINES" />
				<div
					class="relative z-10 -mt-[2px] rounded-tr-3xl rounded-b-3xl border-4 border-[#1b3558] bg-white p-6 text-[#1b3558] shadow-xl md:p-8"
				>
					<!-- RAMJET -->
					<div class="mb-8 rounded-2xl border-l-8 border-[#1b3558] bg-slate-50 p-6 shadow-sm">
						<h3 class="font-heading mb-4 text-xl font-bold tracking-wide text-[#1b3558] uppercase">
							RAMJET
						</h3>
						<ul class="mb-6 space-y-4">
							<li class="font-body relative pl-6 text-lg leading-relaxed text-[#1E3A5F]">
								<span class="absolute top-1 left-0 font-bold text-[#00CED1]">▸</span>
								An athodyd (aero-thermodynamic-duct) which has no rotating parts and consists of a duct
								with a divergent entry and a convergent or convergent-divergent exit.
							</li>
							<li class="font-body relative pl-6 text-lg leading-relaxed text-[#1E3A5F]">
								<span class="absolute top-1 left-0 font-bold text-[#00CED1]">▸</span>
								With a forward motion imparted by an external source, air is forced into the divergent
								inlet (increasing its pressure). The total energy of air is further increased by the combustion
								of fuel, and the rapidly expanding gases accelerate to the atmosphere through the outlet
								duct.
							</li>
						</ul>
						<ImageGrid
							images={[
								{ src: '/images/hangar-zone/history/11_1.png', alt: 'Ramjet Diagram' },
								{ src: '/images/hangar-zone/history/11_2.png', alt: 'Ramjet Engine' }
							]}
							columns={2}
							height="260px"
						/>
					</div>

					<!-- PULSE JET -->
					<div class="mb-8 rounded-2xl border-l-8 border-[#1b3558] bg-slate-50 p-6 shadow-sm">
						<h3 class="font-heading mb-4 text-xl font-bold tracking-wide text-[#1b3558] uppercase">
							PULSE JET
						</h3>
						<div class="grid grid-cols-1 items-center gap-8 md:grid-cols-2">
							<ul class="space-y-4">
								<li class="font-body relative pl-6 text-lg leading-relaxed text-[#1E3A5F]">
									<span class="absolute top-1 left-0 font-bold text-[#00CED1]">▸</span>
									It can be run at static conditions, unlike the ram jet, and is constructed with a robust
									construction.
								</li>
								<li class="font-body relative pl-6 text-lg leading-relaxed text-[#1E3A5F]">
									<span class="absolute top-1 left-0 font-bold text-[#00CED1]">▸</span>
									The inlet duct has spring-loaded inlet valves to the open position.
								</li>
								<li class="font-body relative pl-6 text-lg leading-relaxed text-[#1E3A5F]">
									<span class="absolute top-1 left-0 font-bold text-[#00CED1]">▸</span>
									As air passes to the combustion chamber, it produces high pressures to force the valves
									closed.
								</li>
							</ul>
							<div class="overflow-hidden rounded-xl shadow-md">
								<ImageGrid
									images={[{ src: '/images/hangar-zone/history/12.png', alt: 'Pulse Jet Diagram' }]}
									columns={1}
								/>
							</div>
						</div>
					</div>

					<!-- SCRAM JET -->
					<div class="mb-8 rounded-2xl border-l-8 border-[#1b3558] bg-slate-50 p-6 shadow-sm">
						<h3 class="font-heading mb-4 text-xl font-bold tracking-wide text-[#1b3558] uppercase">
							SCRAM JET
						</h3>
						<div class="grid grid-cols-1 items-center gap-8 md:grid-cols-2">
							<ul class="space-y-4">
								<li class="font-body relative pl-6 text-lg leading-relaxed text-[#1E3A5F]">
									<span class="absolute top-1 left-0 font-bold text-[#00CED1]">▸</span>
									A scramjet (supersonic combustion ramjet) is a variant of a ramjet air-breathing jet
									engine in which combustion takes place in supersonic airflow.
								</li>
							</ul>
							<div class="overflow-hidden rounded-xl shadow-md">
								<ImageGrid
									images={[{ src: '/images/hangar-zone/history/13.png', alt: 'Scram Jet Diagram' }]}
									columns={1}
								/>
							</div>
						</div>
					</div>

					<!-- ROCKET & GAS TURBINE -->
					<div class="grid grid-cols-1 gap-6 md:grid-cols-2">
						<div class="rounded-2xl border-l-8 border-[#1b3558] bg-slate-50 p-6 shadow-sm">
							<h3
								class="font-heading mb-4 text-xl font-bold tracking-wide text-[#1b3558] uppercase"
							>
								ROCKET ENGINE
							</h3>
							<div class="space-y-4">
								<ul class="mb-4 space-y-4">
									<li class="font-body relative pl-6 text-lg leading-relaxed text-[#1E3A5F]">
										<span class="absolute top-1 left-0 font-bold text-[#00CED1]">▸</span>
										Non-air breathing. Uses propellants.
									</li>
								</ul>
								<div class="overflow-hidden rounded-xl shadow-md">
									<ImageGrid
										images={[{ src: '/images/hangar-zone/history/14.png', alt: 'Rocket Engine' }]}
										columns={1}
									/>
								</div>
							</div>
						</div>

						<div class="rounded-2xl border-l-8 border-[#1b3558] bg-slate-50 p-6 shadow-sm">
							<h3
								class="font-heading mb-4 text-xl font-bold tracking-wide text-[#1b3558] uppercase"
							>
								GAS TURBINE ENGINE
							</h3>
							<div class="space-y-4">
								<ul class="mb-4 space-y-4">
									<li class="font-body relative pl-6 text-lg leading-relaxed text-[#1E3A5F]">
										<span class="absolute top-1 left-0 font-bold text-[#00CED1]">▸</span>
										Most practical form. Standard on most aircraft.
									</li>
								</ul>
								<div class="overflow-hidden rounded-xl shadow-md">
									<ImageGrid
										images={[
											{ src: '/images/hangar-zone/history/15.png', alt: 'Gas Turbine Engine' }
										]}
										columns={1}
									/>
								</div>
							</div>
						</div>
					</div>
				</div>
			</section>
		</div>
	{/if}

	<!-- Sticky Bottom Navigation -->
	<div
		class="fixed right-0 bottom-16 left-0 z-40 border-t border-white/20 bg-[#1b3558]/90 p-4 backdrop-blur-md md:static md:mt-12 md:border-t md:border-white/20 md:bg-transparent md:p-0 md:pt-8 md:backdrop-blur-none"
	>
		<div class="mx-auto grid max-w-7xl grid-cols-[1fr_auto_1fr] items-center gap-4">
			<button
				on:click={prevPage}
				class="flex items-center gap-2 justify-self-start rounded-xl border-2 border-[#1b3558]/30 bg-white/90 px-6 py-3 font-bold text-[#1b3558] backdrop-blur-md transition-all hover:-translate-y-1 hover:border-[#1b3558] hover:shadow-lg"
			>
				<span class="text-xl">←</span>
				<span class="hidden md:inline">Previous</span>
			</button>

			<div class="flex items-center gap-2">
				{#each Array(totalPages) as _, i}
					<button
						class="flex h-10 w-10 items-center justify-center rounded-full font-bold transition-all {currentPage ===
						i + 1
							? 'scale-110 bg-[#FFD966] text-[#1b3558]'
							: 'bg-[#1b3558] text-white hover:bg-[#1b3558]/80'}"
						on:click={() => goToPage(i + 1)}
					>
						{i + 1}
					</button>
				{/each}
			</div>

			<button
				on:click={nextPage}
				class="flex items-center gap-2 justify-self-end rounded-xl border-2 border-[#1b3558]/30 bg-white/90 px-6 py-3 font-bold text-[#1b3558] backdrop-blur-md transition-all hover:-translate-y-1 hover:border-[#1b3558] hover:shadow-lg"
			>
				<span class="hidden md:inline">Next</span>
				<span class="text-xl">→</span>
			</button>
		</div>
	</div>
</div>

<style>
	/* Custom clip path for section titles to create the angled effect */
	/* .clip-path-custom moved to global app.css */
</style>
