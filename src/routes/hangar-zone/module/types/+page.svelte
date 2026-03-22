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

	$: currentPage = parseInt($page.url.searchParams.get('page') || '1');

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
			goto(`/hangar-zone/module/types?page=${pageNum}`);
			scrollToTop();
		}
	}

	function nextPage() {
		if (currentPage < totalPages) {
			goToPage(currentPage + 1);
		} else {
			goto('/turbofan-engine');
		}
	}

	function prevPage() {
		if (currentPage > 1) {
			goToPage(currentPage - 1);
		} else {
			goto('/hangar-zone/module/history');
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
			Learning Module 02:<br />Types of Gas Turbine Engines
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
				<SectionHeader title="TURBO JET" />
				<div
					class="relative z-10 -mt-[2px] rounded-tr-3xl rounded-b-3xl border-4 border-[#1b3558] bg-white p-6 text-[#1b3558] shadow-xl md:p-8"
				>
					<ImageGrid
						images={[
							{ src: '/images/hangar-zone/types/1_1.png', alt: 'Turbojet Engine Diagram 1' },
							{ src: '/images/hangar-zone/types/1_2.png', alt: 'Turbojet Engine Diagram 2' }
						]}
						columns={2}
						height="260px"
					/>
					<p class="mt-6 mb-6 border-b border-slate-200 pb-4 text-lg font-bold text-[#1b3558]">
						The basic operating principles of a turbojet engine are relatively straight forward:
					</p>
					<ul class="mb-8 space-y-4">
						<li class="font-body relative pl-6 text-lg leading-relaxed text-[#1E3A5F]">
							<span class="absolute top-1 left-0 font-bold text-[#00CED1]">▸</span>
							Air is compressed in the <strong>compressor</strong>, burned in the
							<strong>combustion chamber</strong>, expands and spins the <strong>turbine</strong>,
							which in turn drives the compressor (self-sustaining), and leaves the exhaust at high
							velocities.
						</li>
						<li class="font-body relative pl-6 text-lg leading-relaxed text-[#1E3A5F]">
							<span class="absolute top-1 left-0 font-bold text-[#00CED1]">▸</span>
							The difference in velocity in the inlet and exit produces thrust.
						</li>
					</ul>
					<div
						class="relative overflow-hidden rounded-r-xl border-l-4 border-[#FFD966] bg-[#FFD966]/20 p-6 shadow-sm"
					>
						<span class="absolute top-1/2 right-4 -translate-y-1/2 text-6xl text-[#FFD966]/20"
							>📌</span
						>
						<strong class="text-lg text-[#1b3558]">EPR</strong> – engine pressure ratio, which is the
						ratio of turbine discharge pressure to the inlet air pressure
					</div>
				</div>
			</section>

			<!-- Section 2 -->
			<section>
				<SectionHeader title="AIRFLOW THROUGH TURBOJET" />
				<div
					class="relative z-10 -mt-[2px] rounded-tr-3xl rounded-b-3xl border-4 border-[#1b3558] bg-white p-6 text-[#1b3558] shadow-xl md:p-8"
				>
					<ImageGrid
						images={[
							{ src: '/images/hangar-zone/types/2_1.png', alt: 'Airflow Through Turbojet 1' },
							{ src: '/images/hangar-zone/types/2_2.png', alt: 'Airflow Through Turbojet 2' },
							{ src: '/images/hangar-zone/types/2_3.png', alt: 'Airflow Through Turbojet 3' }
						]}
						columns={3}
						height="220px"
					/>
					<ul class="mt-6 space-y-4">
						<li class="font-body relative pl-6 text-lg leading-relaxed text-[#1E3A5F]">
							<span class="absolute top-1 left-0 font-bold text-[#00CED1]">▸</span>
							When a compressor and turbine are joined on one shaft, the unit is called a 'spool'.
						</li>
						<li class="font-body relative pl-6 text-lg leading-relaxed text-[#1E3A5F]">
							<span class="absolute top-1 left-0 font-bold text-[#00CED1]">▸</span>
							From the compressor, the air is fed directly into the combustion chambers. Fuel is added
							and the resulting mixture is ignited. The resultant increase in temperature causes a substantial
							increase in volume.
						</li>
						<li class="font-body relative pl-6 text-lg leading-relaxed text-[#1E3A5F]">
							<span class="absolute top-1 left-0 font-bold text-[#00CED1]">▸</span>
							The energy required to drive the compressor is extracted from the stream as it passes through
							the turbine. The remaining energy in the gas stream acts as thrust as the gases pass to
							atmosphere via the end of the jet pipe.
						</li>
					</ul>
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
				<SectionHeader title="TURBOPROP" />
				<div
					class="relative z-10 -mt-[2px] rounded-tr-3xl rounded-b-3xl border-4 border-[#1b3558] bg-white p-6 text-[#1b3558] shadow-xl md:p-8"
				>
					<ImageGrid
						images={[
							{ src: '/images/hangar-zone/types/3_1.png', alt: 'Turboprop Engine Diagram 1' },
							{ src: '/images/hangar-zone/types/3_2.png', alt: 'Turboprop Engine Diagram 2' }
						]}
						columns={2}
						height="260px"
					/>
					<ul class="mt-6 space-y-4">
						<li class="font-body relative pl-6 text-lg leading-relaxed text-[#1E3A5F]">
							<span class="absolute top-1 left-0 font-bold text-[#00CED1]">▸</span>
							A gas turbine engine that delivers power to a propeller is referred to as a
							<strong>turboprop engine</strong>.
						</li>
						<li class="font-body relative pl-6 text-lg leading-relaxed text-[#1E3A5F]">
							<span class="absolute top-1 left-0 font-bold text-[#00CED1]">▸</span>
							Turboprop engines are similar in design to turbojet engines except that the power produced
							by a turboprop engine is delivered to a <strong>reduction gear system</strong> that spins
							a propeller
						</li>
						<li class="font-body relative pl-6 text-lg leading-relaxed text-[#1E3A5F]">
							<span class="absolute top-1 left-0 font-bold text-[#00CED1]">▸</span>
							<strong>Reduction gearing</strong> is necessary in turboprop engines because optimum propeller
							performance is achieved at much slower speeds than the engine's operating rpm.
						</li>
					</ul>
				</div>
			</section>

			<section>
				<SectionHeader title="TURBOPROP PARAMETERS" />
				<div
					class="relative z-10 -mt-[2px] rounded-tr-3xl rounded-b-3xl border-4 border-[#1b3558] bg-white p-6 text-[#1b3558] shadow-xl md:p-8"
				>
					<ImageGrid
						images={[
							{ src: '/images/hangar-zone/types/4_1.png', alt: 'Turboprop Parameters Diagram 1' },
							{ src: '/images/hangar-zone/types/4_2.png', alt: 'Turboprop Parameters Diagram 2' }
						]}
						columns={2}
						height="260px"
					/>
					<ul class="mt-6 space-y-4">
						<li class="font-body relative pl-6 text-lg leading-relaxed text-[#1E3A5F]">
							<span class="absolute top-1 left-0 font-bold text-[#00CED1]">▸</span>
							The output from a turboprop engine is the sum of the shaft horsepower developed at the turbine,
							and the residual jet thrust. This is called
							<strong>Equivalent Shaft Horsepower</strong>
							or <strong>ESHP.</strong>
						</li>
						<li class="font-body relative pl-6 text-lg leading-relaxed text-[#1E3A5F]">
							<span class="absolute top-1 left-0 font-bold text-[#00CED1]">▸</span>
							In turboprop, almost all the energy in the gas stream is converted into mechanical power,
							to drive both the compressor and the propeller.
						</li>
					</ul>
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
				<SectionHeader title="TURBOSHAFT" />
				<div
					class="relative z-10 -mt-[2px] rounded-tr-3xl rounded-b-3xl border-4 border-[#1b3558] bg-white p-6 text-[#1b3558] shadow-xl md:p-8"
				>
					<div class="grid grid-cols-1 items-start gap-8 md:grid-cols-2">
						<ImageGrid
							images={[{ src: '/images/hangar-zone/types/5.png', alt: 'Turboshaft Engine' }]}
							columns={1}
							height="320px"
						/>
						<ul class="space-y-4">
							<li class="font-body relative pl-6 text-lg leading-relaxed text-[#1E3A5F]">
								<span class="absolute top-1 left-0 font-bold text-[#00CED1]">▸</span>
								Turboprop engines are used extensively in business and commuter type aircraft because
								the combination of jet power and propeller efficiency provides good performance characteristics
								at speeds between 300 and 400 miles per hour.
							</li>
							<li class="font-body relative pl-6 text-lg leading-relaxed text-[#1E3A5F]">
								<span class="absolute top-1 left-0 font-bold text-[#00CED1]">▸</span>
								In addition, most turboprop engines provide the best specific fuel consumption of any
								gas turbine engine.
							</li>
						</ul>
					</div>
				</div>
			</section>

			<section>
				<SectionHeader title="AIRFLOW THROUGH TURBOSHAFT" />
				<div
					class="relative z-10 -mt-[2px] rounded-tr-3xl rounded-b-3xl border-4 border-[#1b3558] bg-white p-6 text-[#1b3558] shadow-xl md:p-8"
				>
					<ImageGrid
						images={[
							{ src: '/images/hangar-zone/types/6_1.png', alt: 'Airflow Through Turboshaft 1' },
							{ src: '/images/hangar-zone/types/6_2.png', alt: 'Airflow Through Turboshaft 2' },
							{ src: '/images/hangar-zone/types/6_3.png', alt: 'Airflow Through Turboshaft 3' }
						]}
						columns={3}
						height="220px"
					/>
					<ul class="mt-6 space-y-4">
						<li class="font-body relative pl-6 text-lg leading-relaxed text-[#1E3A5F]">
							<span class="absolute top-1 left-0 font-bold text-[#00CED1]">▸</span>
							A gas turbine engine that delivers power to a shaft that can drive something else is referred
							to as a <strong>turboshaft engine</strong>.
						</li>
						<li class="font-body relative pl-6 text-lg leading-relaxed text-[#1E3A5F]">
							<span class="absolute top-1 left-0 font-bold text-[#00CED1]">▸</span>
							In addition, turboshaft engines are widely used as auxiliary power units and in industrial
							applications to drive electrical generators and surface transportation systems.
						</li>
						<li class="font-body relative pl-6 text-lg leading-relaxed text-[#1E3A5F]">
							<span class="absolute top-1 left-0 font-bold text-[#00CED1]">▸</span>
							Output of a turboprop or turboshaft engine is measured by
							<strong>shaft horsepower</strong> rather than thrust.
						</li>
					</ul>
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
				<SectionHeader title="TURBOPROP AND TURBOSHAFT" />
				<div
					class="relative z-10 -mt-[2px] rounded-tr-3xl rounded-b-3xl border-4 border-[#1b3558] bg-white p-6 text-[#1b3558] shadow-xl md:p-8"
				>
					<div class="mb-8 grid grid-cols-1 items-start gap-8 md:grid-cols-2">
						<ul class="space-y-4">
							<li class="font-body relative pl-6 text-lg leading-relaxed text-[#1E3A5F]">
								<span class="absolute top-1 left-0 font-bold text-[#00CED1]">▸</span>
								Most turboshaft engine incorporates a free power turbine.
							</li>
							<li class="font-body relative pl-6 text-lg leading-relaxed text-[#1E3A5F]">
								<span class="absolute top-1 left-0 font-bold text-[#00CED1]">▸</span>
								Single spool, turboshaft engine has a reverse flow combustion chamber system allowing
								it to be shorter, stiffer, and lighter. It does however add the requirement for a centrifugal
								compressor to be used in the high-pressure stage. This throws the air out radially so
								that it can enter the combustion chamber in the correct direction.
							</li>
						</ul>
						<ImageGrid
							images={[
								{ src: '/images/hangar-zone/types/9_1.png', alt: 'Airflow Diagram 1' },
								{ src: '/images/hangar-zone/types/9_2.png', alt: 'Airflow Diagram 2' }
							]}
							columns={2}
							height="220px"
							gap="1rem"
						/>
					</div>
					<div class="grid grid-cols-1 items-start gap-8 md:grid-cols-2">
						<ImageGrid
							images={[{ src: '/images/hangar-zone/types/10.png', alt: 'Turbine System' }]}
							columns={1}
							height="260px"
						/>
						<ul class="space-y-4">
							<li class="font-body relative pl-6 text-lg leading-relaxed text-[#1E3A5F]">
								<span class="absolute top-1 left-0 font-bold text-[#00CED1]">▸</span>
								Airflow is similar to turbojet up to a point where it leaves the first stage turbine.
							</li>
							<li class="font-body relative pl-6 text-lg leading-relaxed text-[#1E3A5F]">
								<span class="absolute top-1 left-0 font-bold text-[#00CED1]">▸</span>
								The first stage turbine drives the compressor and the free power turbine converts any
								remaining energy to mechanical energy.
							</li>
						</ul>
					</div>
				</div>
			</section>

			<section>
				<SectionHeader title="TURBOPROP AND TURBOSHAFT" />
				<div
					class="relative z-10 -mt-[2px] rounded-tr-3xl rounded-b-3xl border-4 border-[#1b3558] bg-white p-6 text-[#1b3558] shadow-xl md:p-8"
				>
					<ImageGrid
						images={[
							{
								src: '/images/hangar-zone/types/11.png',
								alt: 'Turboprop and Turboshaft Comparison'
							}
						]}
						columns={1}
						height="260px"
					/>
					<ul class="mt-6 space-y-4">
						<li class="font-body relative pl-6 text-lg leading-relaxed text-[#1E3A5F]">
							<span class="absolute top-1 left-0 font-bold text-[#00CED1]">▸</span>
							Both turboprop [TP] and turboshaft [TS] engines use a gas turbine core engine to drive an
							output power shaft for a propeller or helicopter rotor
						</li>
						<li class="font-body relative pl-6 text-lg leading-relaxed text-[#1E3A5F]">
							<span class="absolute top-1 left-0 font-bold text-[#00CED1]">▸</span>
							The main difference between the two variants is that a TP engine might also produce a fraction
							of its overall thrust via a hot core exhaust jet, while a conventional TS engine will have
							a lower exhaust velocity but correspondingly somewhat higher shaft power as the tradeoff
						</li>
						<li class="font-body relative pl-6 text-lg leading-relaxed text-[#1E3A5F]">
							<span class="absolute top-1 left-0 font-bold text-[#00CED1]">▸</span>
							TPs commonly employ a free power turbine to drive the speed reduction gear that in turn
							drives the propeller at a lower rotation speed. This is typically also true for TS engines,
							in driving the main rotor at a significantly lower rotation speed.
						</li>
					</ul>
				</div>
			</section>

			<section>
				<SectionHeader title="DUCTED AND UNDUCTED PROP FAN" />
				<div
					class="relative z-10 -mt-[2px] rounded-tr-3xl rounded-b-3xl border-4 border-[#1b3558] bg-white p-6 text-[#1b3558] shadow-xl md:p-8"
				>
					<ImageGrid
						images={[
							{ src: '/images/hangar-zone/types/12_1.png', alt: 'Ducted Prop Fan' },
							{ src: '/images/hangar-zone/types/12_2.png', alt: 'Unducted Prop Fan' }
						]}
						columns={2}
						height="260px"
					/>
					<ul class="mt-6 space-y-4">
						<li class="font-body relative pl-6 text-lg leading-relaxed text-[#1E3A5F]">
							<span class="absolute top-1 left-0 font-bold text-[#00CED1]">▸</span>
							These new designs utilize titanium, lightweight stainless steel, and composite materials
							to surpass the fuel economy of several high bypass turbofan engines by more than 15 percent.
						</li>
						<li class="font-body relative pl-6 text-lg leading-relaxed text-[#1E3A5F]">
							<span class="absolute top-1 left-0 font-bold text-[#00CED1]">▸</span>
							The use of composite blades reduces weight and allows safe operation at tip speeds higher
							than conventional blades.
						</li>
						<li class="font-body relative pl-6 text-lg leading-relaxed text-[#1E3A5F]">
							<span class="absolute top-1 left-0 font-bold text-[#00CED1]">▸</span>
							Another design encases the propfan in a conventional cowl-type inlet which can achieve Mach
							0.9. These engines are known as <strong>ducted ultra high bypass engines</strong>.
						</li>
					</ul>
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
	/* .clip-path-custom moved to global app.css */
</style>
