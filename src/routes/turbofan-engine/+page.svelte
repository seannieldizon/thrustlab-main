<script lang="ts">
	import { onMount } from 'svelte';
	import ImageGrid from '$lib/components/ui/ImageGrid.svelte';
	import MarkdownRenderer from '$lib/components/MarkdownRenderer.svelte';
	import { goto } from '$app/navigation';
	import { fade, fly } from 'svelte/transition';
	import ModelViewer from '$lib/components/ModelViewer.svelte';
	import { turbofanPartDescriptions } from '$lib/data/turbofanParts';
	import { searchQuery, showSearchModal, performSearch } from '$lib/stores/searchStore';
	import { MODULE_CONTENT } from '$lib/data/searchContent';
	import SearchModal from '$lib/components/SearchModal.svelte';
	import ImageModal from '$lib/components/ui/ImageModal.svelte';
	import SectionHeader from '$lib/components/ui/SectionHeader.svelte';

	let mounted = $state(false);

	// Tab state
	let activeTab = $state<'overview' | 'sections'>('overview');

	// Pagination state for "More About Turbofan Engine" section
	let currentPage = $state(1);
	const totalPages = 2;

	// Pagination state for "Engine Sections" tab
	let currentPageSections = $state(1);
	const totalPagesSections = 5;

	const turbofanParts = turbofanPartDescriptions;

	function handleSearch() {
		if ($searchQuery.trim()) {
			performSearch($searchQuery, MODULE_CONTENT);
			showSearchModal.set(true);
		}
	}

	function scrollToTop() {
		// Use 'auto' (instant) scrolling for pagination to ensure the user is immediately at the top
		// 'smooth' can sometimes fail if the page height changes dynamically during the scroll
		window.scrollTo({ top: 0, behavior: 'auto' });
	}

	function nextPage() {
		if (currentPage < totalPages) {
			currentPage++;
			scrollToTop();
		} else {
			activeTab = 'sections';
			currentPageSections = 1;
			scrollToTop();
		}
	}

	function prevPage() {
		if (currentPage > 1) {
			currentPage--;
			scrollToTop();
		} else {
			goto('/hangar-zone/module/types');
		}
	}

	function goToPage(page: number) {
		if (page >= 1 && page <= totalPages) {
			currentPage = page;
			scrollToTop();
		}
	}

	// Pagination functions for Engine Sections
	function nextPageSections() {
		if (currentPageSections < totalPagesSections) {
			currentPageSections++;
			scrollToTop();
		} else {
			goto('/overhaul-station');
		}
	}

	function prevPageSections() {
		if (currentPageSections > 1) {
			currentPageSections--;
			scrollToTop();
		} else {
			activeTab = 'overview';
			currentPage = totalPages;
			scrollToTop();
		}
	}

	function goToPageSections(page: number) {
		if (page >= 1 && page <= totalPagesSections) {
			currentPageSections = page;
			scrollToTop();
		}
	}

	function handleKeydown(event: KeyboardEvent) {
		if (activeTab === 'overview') {
			if (event.key === 'ArrowLeft') prevPage();
			if (event.key === 'ArrowRight') nextPage();
		} else {
			if (event.key === 'ArrowLeft') prevPageSections();
			if (event.key === 'ArrowRight') nextPageSections();
		}
	}

	onMount(() => {
		mounted = true;
		document.body.classList.add('zone-turbofan');

		// Safety: Ensure scrolling is enabled when page loads
		if (typeof document !== 'undefined') {
			document.body.classList.remove('page-transitioning');
			document.body.style.removeProperty('overflow');
			document.documentElement.style.removeProperty('overflow');
			console.log('Turbofan Engine mounted - scroll enabled');
		}

		return () => {
			document.body.classList.remove('zone-turbofan');
			// Safety: Ensure scroll remains enabled on cleanup
			if (typeof document !== 'undefined') {
				document.body.style.removeProperty('overflow');
				document.documentElement.style.removeProperty('overflow');
			}
		};
	});
</script>

<svelte:window on:keydown={handleKeydown} />

<!-- Main Content -->
<div
	class="animate-on-scroll relative z-10 mx-auto min-h-screen w-full max-w-[1200px] px-4 pt-16 pb-8 md:px-8 md:pt-20 md:pb-16"
>
	<SearchModal />
	<ImageModal />

	<!-- Header Section -->
	<div class="mb-12 text-center">
		<h1
			class="animate-gradient-flash gradient-animated font-heading mb-8 pb-4 text-5xl font-black tracking-tight drop-shadow-[0_4px_10px_rgba(211,84,0,0.4)] md:text-8xl"
		>
			Turbofan Engine
		</h1>
		<p
			class="mx-auto mb-8 max-w-[900px] text-center text-xl leading-relaxed font-bold text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] md:text-2xl"
			style="font-family: 'Gotham', 'Gotham Bold', sans-serif;"
		>
			Enter the Turbofan Engine Zone, an immersive hub where students can <span
				class="text-[#D35400]">explore a fully rotatable 3D turbofan engine in stunning detail</span
			>. Here, they can interact with each component, uncover the inner workings of every section,
			and gain a clear understanding of how these powerful machines drive modern aircraft to the
			skies.
		</p>
	</div>

	<!-- Search Bar -->
	<div
		class="mx-auto mb-8 flex w-full max-w-md min-w-[300px] items-center gap-4 rounded-full border-2 border-[#B34700]/30 bg-white/95 px-4 py-2 shadow-sm backdrop-blur-md transition-all focus-within:border-[#B34700] focus-within:shadow-[0_0_20px_rgba(211,84,0,0.3)] md:mr-0 md:ml-auto md:w-auto"
	>
		<input
			type="text"
			placeholder="Search turbofan components..."
			bind:value={$searchQuery}
			onkeydown={(e) => e.key === 'Enter' && handleSearch()}
			class="flex-1 bg-transparent text-base text-[#0A1628] placeholder-[#0A1628]/50 outline-none"
		/>
		<button
			onclick={handleSearch}
			class="flex items-center justify-center p-1 text-[#00CED1] transition-colors hover:text-[#FFD966]"
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

	<!-- Tab Toggle Buttons -->
	<div class="mb-8 flex justify-end gap-4 pr-0 md:gap-8 md:pr-8">
		<button
			class="font-heading relative rounded-xl border-2 px-6 py-2 text-xl font-black tracking-wider uppercase transition-all hover:-translate-y-0.5 {activeTab ===
			'overview'
				? 'border-[#ff9f43] bg-[#B34700]/90 text-white shadow-[0_0_15px_rgba(179,71,0,0.5)] drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] backdrop-blur-md'
				: 'border-white/30 bg-black/40 text-white shadow-md drop-shadow-[0_2px_6px_rgba(0,0,0,0.7)] hover:bg-black/50'}"
			onclick={() => (activeTab = 'overview')}
		>
			Overview
		</button>
		<button
			class="font-heading relative rounded-xl border-2 px-6 py-2 text-xl font-black tracking-wider uppercase transition-all hover:-translate-y-0.5 {activeTab ===
			'sections'
				? 'border-[#ff9f43] bg-[#B34700]/90 text-white shadow-[0_0_15px_rgba(179,71,0,0.5)] drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] backdrop-blur-md'
				: 'border-white/30 bg-black/40 text-white shadow-md drop-shadow-[0_2px_6px_rgba(0,0,0,0.7)] hover:bg-black/50'}"
			onclick={() => (activeTab = 'sections')}
		>
			Engine Sections
		</button>
	</div>

	<!-- Tab Content -->
	{#if activeTab === 'overview'}
		<div
			class="mt-8 flex flex-col gap-12"
			in:fly={{ y: 20, duration: 400, delay: 200 }}
			out:fade={{ duration: 200 }}
		>
			<!-- 3D Engine Container -->
			<section class="opacity-100">
				<SectionHeader title="Learn, Explore and Understand the Turbofan Engine" color="#B34700" />
				<div
					class="relative z-[1] rounded-3xl border-[5px] border-[#B34700] bg-white p-6 text-[#1a2b47] md:p-8"
				>
					<div class="relative h-[450px] w-full">
						<ModelViewer
							modelPath="/models/Turbofan.glb"
							partDescriptions={turbofanParts}
							cameraPosition={{ alpha: Math.PI / 2, beta: Math.PI / 2.5, radius: 8 }}
							autoLoad={true}
						/>
						<button
							class="absolute top-4 right-4 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-white/90 text-[#B34700] shadow-md transition-all hover:scale-110 hover:bg-white hover:text-[#B34700]"
							title="View Instructions & Fullscreen"
							onclick={() => goto('/turbofan-engine/engine-fullscreen')}
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
								<circle cx="11" cy="11" r="8"></circle>
								<line x1="21" y1="21" x2="16.65" y2="16.65"></line>
								<line x1="11" y1="8" x2="11" y2="14"></line>
								<line x1="8" y1="11" x2="14" y2="11"></line>
							</svg>
						</button>
					</div>

					<!-- Jaja's Tip -->
					<div class="mt-6 flex items-center justify-center gap-4 px-4">
						<div class="shrink-0 drop-shadow-md">
							<img src="/icons/jaja.png" alt="Jaja" class="h-auto w-20" />
						</div>
						<div
							class="font-body flex items-center rounded-xl border-4 border-[#B34700] bg-white p-3 font-semibold text-[#1a2b47] shadow-[4px_4px_0px_rgba(0,0,0,0.1)]"
						>
							<div
								class="[&_.markdown-body]:font-inherit [&_.markdown-body]:m-0 [&_.markdown-body]:leading-tight [&_.markdown-body]:text-inherit"
							>
								<MarkdownRenderer
									content={'**Tip from JAJA:** Click the **zoom** icon to get a closer look!'}
								/>
							</div>
							<div
								class="ml-2 inline-flex items-center justify-center text-[#B34700]"
								aria-hidden="true"
							>
								<svg
									xmlns="http://www.w3.org/2000/svg"
									width="24"
									height="24"
									viewBox="0 0 24 24"
									fill="none"
									stroke="#B34700"
									stroke-width="3"
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
										x2="14"
										y2="11"
									></line></svg
								>
							</div>
						</div>
					</div>
				</div>
			</section>

			<!-- More About Turbofan Container with Pagination -->
			<div id="more-info-section" class="flex flex-col gap-8">
				<!-- Paginated Content -->
				<div class="flex flex-col gap-8">
					{#if currentPage === 1}
						<div class="flex flex-col gap-12">
							<!-- Overview & Parameters Container (Moved to Page 1) -->
							<section class="opacity-100">
								<SectionHeader title="OVERVIEW AND PARAMETERS" color="#B34700" />
								<div
									class="relative z-[1] rounded-3xl border-[5px] border-[#B34700] bg-white p-6 text-[#1a2b47] md:p-8"
								>
									<div class="mb-6 leading-loose">
										<ul class="my-8 list-none pl-0">
											<li
												class="relative mb-5 pl-10 text-lg leading-relaxed text-[#2c3e50] before:absolute before:left-2 before:text-2xl before:font-bold before:text-[#B34700] before:content-['▸']"
											>
												A turbofan engine consists of a multi-bladed ducted propeller driven by a
												gas turbine engine.
											</li>
											<li
												class="relative mb-5 pl-10 text-lg leading-relaxed text-[#2c3e50] before:absolute before:left-2 before:text-2xl before:font-bold before:text-[#B34700] before:content-['▸']"
											>
												Turbofans were developed to provide a compromise between the best features
												of the turbojet and the turboprop.
											</li>
											<li
												class="relative mb-5 pl-10 text-lg leading-relaxed text-[#2c3e50] before:absolute before:left-2 before:text-2xl before:font-bold before:text-[#B34700] before:content-['▸']"
											>
												Turbofan engines have turbojet-type cruise speed capability yet retain some
												of the short-field takeoff capability of a turboprop.
											</li>
										</ul>
									</div>
									<ImageGrid
										images={[
											{
												src: '/images/turbofan-overview/1.1.png',
												alt: 'Pressure Parameter',
												caption: 'Pressure'
											},
											{
												src: '/images/turbofan-overview/1.2.png',
												alt: 'Temperature Parameter',
												caption: 'Temperature'
											},
											{
												src: '/images/turbofan-overview/1.3.png',
												alt: 'Flow Parameter',
												caption: 'Flow'
											}
										]}
										columns={3}
										height="220px"
									/>
								</div>
							</section>
							<!-- Section 1: More About Turbofan Engine -->
							<section class="opacity-100">
								<SectionHeader title="MORE ABOUT TURBOFAN ENGINE" color="#B34700" />
								<div
									class="relative z-[1] rounded-3xl border-[5px] border-[#B34700] bg-white p-6 text-[#1a2b47] md:p-8"
								>
									<ImageGrid
										images={[
											{
												src: '/images/turbofan-more-info/img_1.1.png',
												alt: 'Turbofan Engine Forward Fan'
											},
											{
												src: '/images/turbofan-more-info/img_1.2.png',
												alt: 'Turbofan Engine Aft Fan'
											}
										]}
										columns={2}
										height="260px"
									/>
									<div class="mb-6 leading-loose">
										<p class="mb-6 text-justify text-lg leading-loose text-[#2c3e50]">
											The airlines' choice. Turbofans are like Turbojets but also have a large fan
											accelerating the air's entry into the engine and adding to the thrust as an
											internal propeller.
										</p>
										<p class="mb-6 text-justify text-lg leading-loose text-[#2c3e50]">
											Engines that have the fan mounted in front of the compressor are called
											forward-fan engines, while turbofan engines that have the fan mounted to the
											turbine section are called aft-fan engines.
										</p>
									</div>
									<ImageGrid
										images={[
											{
												src: '/images/turbofan-more-info/img_2.png',
												alt: 'Turbofan Bypass Engine'
											}
										]}
										columns={1}
										height="auto"
									/>
								</div>
							</section>
						</div>
					{/if}

					{#if currentPage === 2}
						<div class="flex flex-col gap-12">
							<!-- Section 2: Bypass Engine Concept -->
							<section class="opacity-100">
								<SectionHeader title="THE BYPASS ENGINE CONCEPT" color="#B34700" />
								<div
									class="relative z-[1] rounded-3xl border-[5px] border-[#B34700] bg-white p-6 text-[#1a2b47] md:p-8"
								>
									<div class="mb-6 leading-loose">
										<p class="mb-6 text-justify text-lg leading-loose text-[#2c3e50]">
											The inlet air that passes through a turbofan engine is usually divided into
											two separate streams of air. One stream passes through the engine core while a
											second stream coaxially bypasses the engine core. It is this bypass stream of
											air that is responsible for the term bypass engine.
										</p>
										<p class="mb-6 text-justify text-lg leading-loose text-[#2c3e50]">
											When discussing bypass engines there are three terms you must be familiar
											with; they are thrust ratio, bypass ratio, and fan pressure ratio. A turbofan
											engine's thrust ratio is a comparison of the thrust produced by the fan to the
											thrust produced by the engine core exhaust. On the other hand, a turbofan's
											bypass ratio refers to the ratio of incoming air that bypasses the core to the
											amount of air that passes through the engine core.
										</p>
									</div>
									<ImageGrid
										images={[
											{
												src: '/images/turbofan-more-info/img_3.1.png',
												alt: 'Turbofan Classifications'
											},
											{ src: '/images/turbofan-more-info/img_3.2.png', alt: 'Bypass Ratio Types' }
										]}
										columns={2}
										height="260px"
									/>
								</div>
							</section>

							<!-- Section 3: Classifications -->
							<section class="opacity-100">
								<SectionHeader title="TURBOFAN CLASSIFICATIONS AND RATIOS" color="#B34700" />
								<div
									class="relative z-[1] rounded-3xl border-[5px] border-[#B34700] bg-white p-6 text-[#1a2b47] md:p-8"
								>
									<div class="mb-6 leading-loose">
										<p class="mb-6 text-justify text-lg leading-loose text-[#2c3e50]">
											<strong
												>Turbofans in civil aircraft are generally divided into three
												classifications based on bypass ratio:</strong
											>
										</p>
										<ul class="my-8 list-none pl-0">
											<li
												class="relative mb-5 pl-10 text-lg leading-relaxed text-[#2c3e50] before:absolute before:left-2 before:text-2xl before:font-bold before:text-[#B34700] before:content-['▸']"
											>
												Low bypass (1:1)
											</li>
											<li
												class="relative mb-5 pl-10 text-lg leading-relaxed text-[#2c3e50] before:absolute before:left-2 before:text-2xl before:font-bold before:text-[#B34700] before:content-['▸']"
											>
												Medium bypass (2:1 or 3:1)
											</li>
											<li
												class="relative mb-5 pl-10 text-lg leading-relaxed text-[#2c3e50] before:absolute before:left-2 before:text-2xl before:font-bold before:text-[#B34700] before:content-['▸']"
											>
												High bypass (4:1 or greater)
											</li>
										</ul>
										<p class="mb-6 text-justify text-lg leading-loose text-[#2c3e50]">
											<strong>Key Ratios:</strong>
										</p>
										<ul class="my-8 list-none pl-0">
											<li
												class="relative mb-5 pl-10 text-lg leading-relaxed text-[#2c3e50] before:absolute before:left-2 before:text-2xl before:font-bold before:text-[#B34700] before:content-['▸']"
											>
												<strong>Bypass Ratio:</strong> bypass air to engine air
											</li>
											<li
												class="relative mb-5 pl-10 text-lg leading-relaxed text-[#2c3e50] before:absolute before:left-2 before:text-2xl before:font-bold before:text-[#B34700] before:content-['▸']"
											>
												<strong>Thrust Ratio:</strong> fan to engine core exhaust
											</li>
											<li
												class="relative mb-5 pl-10 text-lg leading-relaxed text-[#2c3e50] before:absolute before:left-2 before:text-2xl before:font-bold before:text-[#B34700] before:content-['▸']"
											>
												<strong>Fan Pressure Ratio:</strong> pressure leaving the fan to pressure entering
												the fan
											</li>
										</ul>
									</div>
									<ImageGrid
										images={[
											{
												src: '/images/turbofan-more-info/img_4.png',
												alt: 'Turbofan Engine Details'
											}
										]}
										columns={1}
										height="auto"
									/>
								</div>
							</section>
						</div>
					{/if}
				</div>

				<!-- Bottom Navigation (Overview) -->
				<div
					class="fixed right-0 bottom-16 left-0 z-40 border-t border-white/20 bg-black/90 p-4 backdrop-blur-md md:static md:mt-6 md:bg-transparent md:p-0 md:pt-4 md:backdrop-blur-none"
				>
					<div class="mx-auto grid max-w-7xl grid-cols-[1fr_auto_1fr] items-center gap-4">
						<button
							onclick={prevPage}
							class="group flex items-center gap-2 justify-self-start rounded-xl border-2 border-[#B34700]/30 bg-white/90 px-4 py-3 font-bold text-[#1b3558] backdrop-blur-md transition-all hover:-translate-y-1 hover:border-[#B34700] hover:shadow-lg md:px-6"
						>
							<span class="text-xl text-[#B34700]">←</span>
							<span class="hidden font-bold text-[#0A1628] md:inline"
								>{currentPage === 1 ? 'Previous: Hangar Zone' : 'Previous'}</span
							>
						</button>

						<div class="flex items-center gap-2">
							{#each Array(totalPages) as _, i}
								<button
									class="flex h-10 w-10 items-center justify-center rounded-full font-bold transition-all {currentPage ===
									i + 1
										? 'scale-110 bg-[#B34700] text-white'
										: 'bg-[#1b3558] text-white hover:bg-[#1b3558]/80'}"
									onclick={() => goToPage(i + 1)}
									aria-label="Go to page {i + 1}"
								>
									{i + 1}
								</button>
							{/each}
						</div>

						<button
							onclick={nextPage}
							class="group flex items-center gap-2 justify-self-end rounded-xl border-2 border-[#B34700]/30 bg-white/90 px-4 py-3 font-bold text-[#1b3558] backdrop-blur-md transition-all hover:-translate-y-1 hover:border-[#B34700] hover:shadow-lg md:px-6"
						>
							<span class="hidden font-bold text-[#0A1628] md:inline"
								>{currentPage === totalPages ? 'Next: Engine Sections' : 'Next'}</span
							>
							<span class="text-xl text-[#B34700]">→</span>
						</button>
					</div>
				</div>
			</div>
		</div>
	{:else}
		<div
			id="engine-sections-tab"
			class="flex flex-col gap-12"
			in:fly={{ y: 20, duration: 400, delay: 200 }}
			out:fade={{ duration: 200 }}
		>
			<h2
				class="animate-gradient-flash gradient-animated font-heading m-0 mb-8 text-center text-4xl font-black drop-shadow-[0_2px_8px_rgba(211,84,0,0.4)] md:text-5xl"
			>
				LEARNING MODULE 03:<br />
				SECTIONS OF A GAS TURBINE ENGINE
			</h2>

			<!-- Page 1: ENGINE COMPONENTS, COLD SECTION (Air Inlet & Centrifugal Compressor) -->
			{#if currentPageSections === 1}
				<div class="flex flex-col gap-12">
					<section class="opacity-100">
						<SectionHeader title="ENGINE COMPONENTS" color="#B34700" />
						<div
							class="relative z-[1] rounded-b-3xl border-[5px] border-[#B34700] bg-white p-6 text-[#1a2b47] md:p-8"
						>
							<div class="mb-6 leading-loose">
								<p class="mb-6 text-justify text-lg leading-loose text-[#2c3e50]">
									There are <b>5 major sections</b> of the gas turbine engine that are grouped into
									2 sections: the <b>hot section</b> and the <b>cold section</b>.
								</p>
								<ul class="my-8 list-none pl-0">
									<li
										class="relative mb-5 pl-10 text-lg leading-relaxed text-[#2c3e50] before:absolute before:left-2 before:text-2xl before:font-bold before:text-[#B34700] before:content-['▸']"
									>
										A turbine engine's hot section includes the combustion, turbine, and exhaust
										sections. The cold section, on the other hand, includes the air inlet duct and
										the compressor section.
									</li>
								</ul>
								<div
									class="relative mb-6 h-[500px] w-full rounded-xl border border-gray-200 bg-gray-50 shadow-inner"
								>
									<ModelViewer modelPath="/models/Turbofan (Caseless).glb" autoLoad={true} />
								</div>
								<ImageGrid
									images={[
										{
											src: '/images/turbofan-module3/3d_img_1.png'
										}
									]}
									columns={1}
									height="320px"
								/>
							</div>
						</div>
					</section>

					<section class="opacity-100">
						<SectionHeader title="COLD SECTION: AIR INLET" color="#B34700" />
						<div
							class="relative z-[1] rounded-b-3xl border-[5px] border-[#B34700] bg-white p-6 text-[#1a2b47] md:p-8"
						>
							<div class="mb-6 leading-loose">
								<div
									class="relative mb-6 h-[400px] w-full rounded-xl border border-gray-200 bg-gray-50 shadow-inner"
								>
									<ModelViewer modelPath="/models/Intake.glb" autoLoad={true} />
								</div>
								<p class="mb-6 text-justify text-lg leading-loose text-[#2c3e50]">
									The air intake of a gas turbine engine is either built into the airframe itself,
									if the engine is mounted in the airframe, or is the forward part of the nacelle
									installation if the engine is wing or rear-fuselage-mounted.
								</p>
								<p class="mb-6 text-justify text-lg leading-loose text-[#2c3e50]">
									The air intake is designed to provide a turbulence-free supply of air to the
									first-stage compressor of the engine, with the minimum energy loss occurring
									through the inlet.
								</p>
								<p class="mb-6 text-justify text-lg leading-loose text-[#2c3e50]">
									To enable the compressor to operate satisfactorily, the air must reach the
									compressor at a uniform pressure, distributed evenly across the whole of the face
									of the first stage.
								</p>
								<p class="mb-6 text-justify text-lg leading-loose text-[#2c3e50]">
									The design of the intake duct is therefore vital to the performance of the engine,
									under all airspeed and angles of attack, to avoid compressor stall or surge to be
									avoided.
								</p>
								<div class="my-8 rounded-xl border-l-4 border-[#B34700] bg-orange-50 p-6 shadow-sm">
									<h5 class="font-heading mb-4 text-xl font-bold text-[#B34700]">
										Functions of the air inlet:
									</h5>
									<ul class="list-none pl-0">
										<li
											class="relative mb-3 pl-6 text-base leading-relaxed text-[#2c3e50] before:absolute before:top-2 before:left-0 before:h-2 before:w-2 before:rounded-full before:bg-[#B34700]"
										>
											Recover as much of the total pressure of the free airstream as possible and
											deliver this pressure to the compressor. This is known as <b>ram recovery</b>
											or
											<b>pressure recovery</b>.
										</li>
										<li
											class="relative mb-3 pl-6 text-base leading-relaxed text-[#2c3e50] before:absolute before:top-2 before:left-0 before:h-2 before:w-2 before:rounded-full before:bg-[#B34700]"
										>
											Many inlets are shaped to raise the air pressure above atmospheric pressure.
										</li>
										<li
											class="relative mb-3 pl-6 text-base leading-relaxed text-[#2c3e50] before:absolute before:top-2 before:left-0 before:h-2 before:w-2 before:rounded-full before:bg-[#B34700]"
										>
											Provide a uniform supply of air to the compressor so the compressor can
											operate efficiently.
										</li>
									</ul>
								</div>
							</div>
						</div>
					</section>

					<section class="opacity-100">
						<SectionHeader title="Types of Air Inlet Ducts" color="#B34700" />
						<div
							class="relative z-[1] rounded-b-3xl border-[5px] border-[#B34700] bg-white p-6 text-[#1a2b47] md:p-8"
						>
							<h5
								class="font-heading mb-4 text-lg font-bold text-[#B34700] underline decoration-2 underline-offset-4"
							>
								Engine Mounted
							</h5>
							<p class="mb-6 text-justify text-lg leading-loose text-[#2c3e50]">
								Several large commercial aircraft and large military aircraft use wing-mounted
								engines. In a few cases, such as the DC-10 and L-1011, a combination of wing-mounted
								and vertical stabilizer-mounted engines is used.
							</p>

							<h5
								class="font-heading mb-4 text-lg font-bold text-[#B34700] underline decoration-2 underline-offset-4"
							>
								Wings Mounted
							</h5>
							<p class="mb-6 text-justify text-lg leading-loose text-[#2c3e50]">
								Some aircraft with engines mounted inside the wings feature air inlet ducts in the
								wing's leading edge. Aircraft such as the Aerospatiale Caravelle, de Havilland
								Comet, and de Havilland Vampire all utilize wing-mounted inlets.
							</p>

							<h5
								class="font-heading mb-4 text-lg font-bold text-[#B34700] underline decoration-2 underline-offset-4"
							>
								Fuselage Mounted
							</h5>
							<p class="mb-6 text-justify text-lg leading-loose text-[#2c3e50]">
								Engines mounted inside a fuselage typically use air inlet ducts located near the
								front of the fuselage. For example, many early military aircraft were designed with
								an air inlet duct in the nose of the fuselage.
							</p>
						</div>
					</section>

					<section class="opacity-100">
						<SectionHeader title="Subsonic Inlets" color="#B34700" />
						<div
							class="relative z-[1] rounded-b-3xl border-[5px] border-[#B34700] bg-white p-6 text-[#1a2b47] md:p-8"
						>
							<p class="mb-6 text-justify text-lg leading-loose text-[#2c3e50]">
								A typical subsonic air inlet consists of a fixed geometry duct whose diameter
								progressively increases from front to back. This divergent shape works like a
								venturi in that as the intake air spreads out, the velocity of the air decreases and
								the pressure increases. This added pressure contributes significantly to engine
								efficiency once the aircraft reaches its design cruising speed.
							</p>
						</div>
					</section>

					<section class="opacity-100">
						<SectionHeader title="Supersonic Inlets" color="#B34700" />
						<div
							class="relative z-[1] rounded-b-3xl border-[5px] border-[#B34700] bg-white p-6 text-[#1a2b47] md:p-8"
						>
							<p class="mb-6 text-justify text-lg leading-loose text-[#2c3e50]">
								On supersonic aircraft a typical air inlet duct has either a fixed or variable
								geometry whose diameter progressively decreases, then increases from front to back.
								This convergent-divergent shape is used to slow the incoming airflow to subsonic
								speed before it reaches the compressor. The supersonic diffuser gradually decreases
								in area from front to rear which has the effect of reducing the air velocity down to
								below Mach 1. Further reduction of velocity is achieved by a subsonic diffuser which
								increases in area towards the compressor face. The control of shock waves that form
								on the air inlet is also important to correctly decelerate the air through the shock
								waves. The use of variable geometry intakes allow the correct control of intake
								shocks and may also comprise spill doors to allow excess air to be spilled from the
								inlet without having its velocity changed.
							</p>
						</div>
					</section>

					<section class="opacity-100">
						<SectionHeader title="Bellmouth Inlets" color="#B34700" />
						<div
							class="relative z-[1] rounded-b-3xl border-[5px] border-[#B34700] bg-white p-6 text-[#1a2b47] md:p-8"
						>
							<p class="mb-6 text-justify text-lg leading-loose text-[#2c3e50]">
								Bellmouth inlets have a convergent profile that is designed specifically for
								obtaining very high aerodynamic efficiency when stationary or in slow flight.
								Therefore, bellmouth inlets are typically used on helicopters, some slow moving
								aircraft, and on engines being run in ground test stands. A typical bellmouth inlet
								is short in length and has rounded shoulders offering very little air resistance.
							</p>
						</div>
					</section>
				</div>
			{/if}

			<!-- Page 2: COMPRESSOR SECTION (Centrifugal & Axial) -->
			{#if currentPageSections === 2}
				<div class="flex flex-col gap-12">
					<section class="opacity-100">
						<SectionHeader title="COMPRESSOR SECTION" color="#B34700" />
						<div
							class="relative z-[1] rounded-b-3xl border-[5px] border-[#B34700] bg-white p-6 text-[#1a2b47] md:p-8"
						>
							<div
								class="relative mb-6 h-[400px] w-full rounded-xl border border-gray-200 bg-gray-50 shadow-inner"
							>
								<ModelViewer modelPath="/models/Compression.glb" autoLoad={true} />
							</div>

							<p class="mb-6 text-justify text-lg leading-loose text-[#2c3e50]">
								The second major section and also a part of the cold section of a gas turbine engine
								is the compressor. It is the component that forces air into the engine. Its main
								objective is to supply compressed air for combustion in the combustion chamber.
							</p>

							<h5
								class="font-heading mb-4 text-lg font-bold text-[#B34700] underline decoration-2 underline-offset-4"
							>
								Compressor Pressure Ratio
							</h5>
							<p class="mb-6 text-justify text-lg leading-loose text-[#2c3e50]">
								This ratio is the <b>outlet pressure divided by the inlet pressure</b>.
							</p>
							<p class="mb-6 text-justify text-lg leading-loose text-[#2c3e50]">
								The amount of air passing through the engine is dependent upon three factors:
							</p>
							<ol class="mb-6 list-decimal pl-10 leading-loose text-[#2c3e50]">
								<li class="pl-2 marker:font-bold marker:text-[#B34700]">
									The compressor speed (rpm)
								</li>
								<li class="pl-2 marker:font-bold marker:text-[#B34700]">
									The forward speed of the aircraft
								</li>
								<li class="pl-2 marker:font-bold marker:text-[#B34700]">
									The density of the ambient (surrounding) air
								</li>
							</ol>
							<p class="mb-6 text-justify text-lg leading-loose text-[#2c3e50]">
								To be effective, a modern compressor must increase the intake air pressure <b
									>20 to 30 times above the ambient air pressure</b
								>
								and move the air at a velocity of <b>400 to 500 feet per second</b>.
							</p>

							<div class="my-8 rounded-xl border-l-4 border-[#B34700] bg-orange-50 p-6 shadow-sm">
								<h5 class="font-heading mb-4 text-xl font-bold text-[#B34700]">
									Functions of the Compressor Section
								</h5>
								<ul class="list-none pl-0">
									<li
										class="relative mb-3 pl-6 text-base leading-relaxed text-[#2c3e50] before:absolute before:top-2 before:left-0 before:h-2 before:w-2 before:rounded-full before:bg-[#B34700]"
									>
										Its primary function is <b
											>to supply air in sufficient quantity to satisfy the requirements of the
											combustion burners</b
										>.
									</li>
									<li
										class="relative mb-3 pl-6 text-base leading-relaxed text-[#2c3e50] before:absolute before:top-2 before:left-0 before:h-2 before:w-2 before:rounded-full before:bg-[#B34700]"
									>
										A secondary function of the compressor is <b
											>to supply bleed air/customer bleed air for various purposes in the engine and
											aircraft</b
										>.
									</li>
									<li
										class="relative mb-3 pl-6 text-base leading-relaxed text-[#2c3e50] before:absolute before:top-2 before:left-0 before:h-2 before:w-2 before:rounded-full before:bg-[#B34700]"
									>
										The bleed-air is taken from any of the various pressure stages of the
										compressor. Bleeding air from the compressor does cause a small but <b
											>noticeable drop in engine power</b
										>. Sometimes power loss can be detected by observing the
										<b>engine pressure ratio (EPR) indicator</b>.
									</li>
								</ul>
								<p class="mt-6 mb-4 text-justify text-lg leading-loose text-[#2c3e50]">
									Bleed air is utilized in a wide variety of ways. Some of the current applications
									of bleed air are:
								</p>
								<ol class="list-decimal pl-10 leading-loose text-[#2c3e50]">
									<li class="pl-2 marker:font-bold marker:text-[#B34700]">
										<b>Cabin pressurization, heating, and cooling;</b>
									</li>
									<li class="pl-2 marker:font-bold marker:text-[#B34700]">
										<b>De-icing and anti-icing equipment;</b>
									</li>
									<li class="pl-2 marker:font-bold marker:text-[#B34700]">
										<b>Pneumatic starting of engines</b>
									</li>
								</ol>
							</div>
						</div>
					</section>
				</div>
			{/if}

			<!-- Page 2: COLD SECTION: COMPRESSOR -->
			{#if currentPageSections === 2}
				<div class="flex flex-col gap-12">
					<section class="opacity-100">
						<SectionHeader title="Types of Compressor" color="#B34700" />
						<div
							class="relative z-[1] rounded-b-3xl border-[5px] border-[#B34700] bg-white p-6 text-[#1a2b47] md:p-8"
						>
							<h5
								class="font-heading mb-4 text-lg font-bold text-[#B34700] underline decoration-2 underline-offset-4"
							>
								Centrifugal Flow Compressor
							</h5>
							<p class="mb-6 text-justify text-lg leading-loose text-[#2c3e50]">
								Sometimes called a radial outflow compressor. This type of compressor is one of the
								earliest compressor designs and is still used today in some smaller engines and
								auxiliary power units (APU’s). Centrifugal compressors consist of:
							</p>
							<ul class="my-8 list-none pl-0">
								<li
									class="relative mb-5 pl-10 text-lg leading-relaxed text-[#2c3e50] before:absolute before:left-2 before:text-2xl before:font-bold before:text-[#B34700] before:content-['▸']"
								>
									An Impeller (also called rotor);
								</li>
								<li
									class="relative mb-5 pl-10 text-lg leading-relaxed text-[#2c3e50] before:absolute before:left-2 before:text-2xl before:font-bold before:text-[#B34700] before:content-['▸']"
								>
									Diffuser;
								</li>
								<li
									class="relative mb-5 pl-10 text-lg leading-relaxed text-[#2c3e50] before:absolute before:left-2 before:text-2xl before:font-bold before:text-[#B34700] before:content-['▸']"
								>
									And a Manifold
								</li>
							</ul>
							<p class="mb-6 text-justify text-lg leading-loose text-[#2c3e50]">
								Centrifugal compressors have a high pressure rise per stage that can be around <b
									>8:1</b
								>. Generally centrifugal compressors are limited to two stages due to efficiency
								concerns.
							</p>
							<p class="mb-6 text-justify text-lg leading-loose text-[#2c3e50]">
								The <b>Impeller (rotor)</b> consists of a forged disk with integral blades fastened by
								a splined coupling to a common power shaft. Its function is to take air in and accelerate
								it outward by centrifugal force.
							</p>
							<p class="mb-6 text-justify text-lg leading-loose text-[#2c3e50]">
								Compressors having only one impeller are referred to as <b
									>single-stage compressors</b
								>
								while compressors having two impellers are referred to as
								<b>double-stage compressors</b>.
							</p>

							<h5
								class="font-heading mb-4 text-lg font-bold text-[#B34700] underline decoration-2 underline-offset-4"
							>
								Double sided / Double Entry Impeller
							</h5>
							<ul class="my-8 list-none pl-0">
								<li
									class="relative mb-5 pl-10 text-lg leading-relaxed text-[#2c3e50] before:absolute before:left-2 before:text-2xl before:font-bold before:text-[#B34700] before:content-['▸']"
								>
									When two impellers are mounted back-to-back, a double-sided or double-entry
									impeller is created.
								</li>
								<li
									class="relative mb-5 pl-10 text-lg leading-relaxed text-[#2c3e50] before:absolute before:left-2 before:text-2xl before:font-bold before:text-[#B34700] before:content-['▸']"
								>
									A single-stage, double-sided impeller allows a higher mass airflow than that of a
									similar sized single-stage, single-sided impeller. Therefore, engines “with
									double-sided impellers typically has a smaller overall diameter.
								</li>
							</ul>

							<h5
								class="font-heading mb-4 text-lg font-bold text-[#B34700] underline decoration-2 underline-offset-4"
							>
								Process of Compression
							</h5>
							<p class="mb-6 text-justify text-lg leading-loose text-[#2c3e50]">
								Once through the impeller, the air is expelled into a divergent duct called a <b
									>diffuser</b
								>. The diffuser acts as a divergent duct where the air spreads out, slows down, and
								increases in static pressure.
							</p>
							<ul class="my-8 list-none pl-0">
								<li
									class="relative mb-5 pl-10 text-lg leading-relaxed text-[#2c3e50] before:absolute before:left-2 before:text-2xl before:font-bold before:text-[#B34700] before:content-['▸']"
								>
									This prepares the air for entry into the flame burning area of the combustion
									section at a lower velocity so that the flame of combustion can burn continuously.
								</li>
								<li
									class="relative mb-5 pl-10 text-lg leading-relaxed text-[#2c3e50] before:absolute before:left-2 before:text-2xl before:font-bold before:text-[#B34700] before:content-['▸']"
								>
									If the air passed through the flame area at a high velocity, <b
										>it could extinguish the flame</b
									>.
								</li>
							</ul>
							<p class="mb-6 text-justify text-lg leading-loose text-[#2c3e50]">
								The <b>compressor manifold</b> distributes the air in a smooth flow to the combustion
								section.
							</p>
							<ul class="my-8 list-none pl-0">
								<li
									class="relative mb-5 pl-10 text-lg leading-relaxed text-[#2c3e50] before:absolute before:left-2 before:text-2xl before:font-bold before:text-[#B34700] before:content-['▸']"
								>
									The compressor manifold diverts the flow of air from the diffuser, which is an
									integral part of the manifold, into the combustion chambers.
								</li>
								<li
									class="relative mb-5 pl-10 text-lg leading-relaxed text-[#2c3e50] before:absolute before:left-2 before:text-2xl before:font-bold before:text-[#B34700] before:content-['▸']"
								>
									The manifold has one outlet port for each chamber so that the air is evenly
									divided.
								</li>
							</ul>

							<h5 class="font-heading my-8 text-center text-xl font-bold text-[#B34700] uppercase">
								CENTRIFUGAL FLOW COMPRESSOR
							</h5>
							<div
								class="mx-auto max-w-4xl overflow-x-auto rounded-xl border-2 border-black shadow-md"
							>
								<table class="w-full border-collapse text-[#1a2b47]">
									<thead>
										<tr class="bg-white">
											<th class="border-2 border-black p-4 text-center font-bold uppercase"
												>ADVANTAGES</th
											>
											<th class="border-2 border-black p-4 text-center font-bold uppercase"
												>DISADVANTAGES</th
											>
										</tr>
									</thead>
									<tbody>
										<tr class="bg-white">
											<td class="border-2 border-black p-4 text-center"
												>Simplicity in Manufacture</td
											>
											<td class="border-2 border-black p-4 text-center align-middle" rowspan="2"
												>Large frontal area required for a<br />given airflow increases aerodynamic
												drag.</td
											>
										</tr>
										<tr class="bg-white">
											<td class="border-2 border-black p-4 text-center">Relatively Low Cost</td>
										</tr>
										<tr class="bg-white">
											<td class="border-2 border-black p-4 text-center">Low Weight</td>
											<td class="border-2 border-black p-4 text-center align-middle" rowspan="2"
												>Practical limits on the number of stages restrict<br />its usefulness when
												designing larger and more<br />powerful engines.</td
											>
										</tr>
										<tr class="bg-white">
											<td class="border-2 border-black p-4 text-center"
												>Low Starting Power Requirements</td
											>
										</tr>
										<tr class="bg-white">
											<td class="border-2 border-black p-4 text-center"
												>Operating Efficiency over a wide<br />range of rotational speed</td
											>
											<td class="border-2 border-black p-4"></td>
										</tr>
									</tbody>
								</table>
							</div>
						</div>
					</section>

					<section class="opacity-100">
						<SectionHeader title="Axial Flow Compressor" color="#B34700" />
						<div
							class="relative z-[1] rounded-b-3xl border-[5px] border-[#B34700] bg-white p-6 text-[#1a2b47] md:p-8"
						>
							<p class="mb-6 text-justify text-lg leading-loose text-[#2c3e50]">
								In an axial flow compressor, the airflow is along the horizontal axis of the
								compressor. An axial flow compressor has two main elements, a <b>rotor</b> and a
								<b>stator</b>. The task of an axial compressor is to raise air pressure rather than
								air velocity.
							</p>

							<p class="mb-6 text-justify text-lg leading-loose text-[#2c3e50]">
								The <b>rotor</b> consists of rows of blades fixed on a rotating spindle. The angle and
								airfoil contour of the blades forces air rearward in the same manner as a propeller.
							</p>
							<ul class="my-8 list-none pl-0">
								<li
									class="relative mb-5 pl-10 text-lg leading-relaxed text-[#2c3e50] before:absolute before:left-2 before:text-2xl before:font-bold before:text-[#B34700] before:content-['▸']"
								>
									The rotor blades are usually made of <b>stainless steel</b> with the latter stages
									being made of <b>titanium</b>.
								</li>
								<li
									class="relative mb-5 pl-10 text-lg leading-relaxed text-[#2c3e50] before:absolute before:left-2 before:text-2xl before:font-bold before:text-[#B34700] before:content-['▸']"
								>
									The design of blade attachment to the rotor disk rims varies, but they are
									commonly fitted into disks by either <b>bulb-type</b> or <b>fir- tree methods</b>,
									<b>dovetail</b>.
								</li>
							</ul>
							<p class="mb-6 text-justify text-lg leading-loose text-[#2c3e50]">
								Some long fan blades have a mid-span shroud that helps support the blades, making
								them more resistant to the bending forces created by the airstream. The shrouds,
								however, do block some of the airflow and create additional aerodynamic drag that
								reduces fan efficiency. The rotor blades used in an axial flow compressor have an
								airfoil cross- section with a varying angle of incidence, or twist. This twist
								compensates for the blade velocity variation caused by its radius.
							</p>

							<ImageGrid
								images={[
									{ src: '/images/turbofan-module3/img_7.1.png', alt: 'Axial Flow Compressor' },
									{ src: '/images/turbofan-module3/img_7.2.png', alt: 'Axial Compressor Detail' }
								]}
								columns={2}
								height="260px"
							/>
							<ImageGrid
								images={[
									{ src: '/images/turbofan-module3/img_8.png', alt: 'Rotor Blade Attachment' },
									{ src: '/images/turbofan-module3/img_9.png', alt: 'Blade Twist' }
								]}
								columns={2}
								height="260px"
							/>

							<p class="mb-6 text-justify text-lg leading-loose text-[#2c3e50]">
								The <b>stator vanes</b>, on the other hand, are arranged in fixed rows between the
								rows of rotor blades and act as diffusers at each stage, decreasing air velocity and
								raising pressure. Like rotor blades, stator vanes have an airfoil shape. In
								addition, the angle of attack of stator vanes can be <b>fixed or variable</b>.
							</p>
							<p class="mb-6 text-justify text-lg leading-loose text-[#2c3e50]">
								The set of stator vanes immediately in front of the first stage rotor blades are
								called <b>inlet guide vanes</b>. These vanes direct the airflow into the first stage
								rotor blades at the best angle while imparting a swirling motion in the direction of
								engine rotation. This action improves the aerodynamics of the compressor by reducing
								the drag on the first stage rotor blades.
							</p>
							<ul class="my-8 list-none pl-0">
								<li
									class="relative mb-5 pl-10 text-lg leading-relaxed text-[#2c3e50] before:absolute before:left-2 before:text-2xl before:font-bold before:text-[#B34700] before:content-['▸']"
								>
									Stator vanes are normally constructed out of steel or nickel because those metals
									have high fatigue strength.
								</li>
								<li
									class="relative mb-5 pl-10 text-lg leading-relaxed text-[#2c3e50] before:absolute before:left-2 before:text-2xl before:font-bold before:text-[#B34700] before:content-['▸']"
								>
									Stator vanes are often shrouded at their tips to minimize vibration tendencies.
								</li>
								<li
									class="relative mb-5 pl-10 text-lg leading-relaxed text-[#2c3e50] before:absolute before:left-2 before:text-2xl before:font-bold before:text-[#B34700] before:content-['▸']"
								>
									Some axial compressors with high compressor pressure ratios utilize <b
										>variable inlet guide vanes</b
									>
									plus several stages of <b>variable stator vanes</b>.
								</li>
								<li
									class="relative mb-5 pl-10 text-lg leading-relaxed text-[#2c3e50] before:absolute before:left-2 before:text-2xl before:font-bold before:text-[#B34700] before:content-['▸']"
								>
									These variable inlet guide vanes and stators automatically reposition themselves
									to maintain proper airflow through the engine under varying operating conditions.
								</li>
							</ul>
							<p class="mb-6 text-justify text-lg leading-loose text-[#2c3e50]">
								The last set of vanes the compressor air passes through is the <b
									>outlet vane assembly</b
								>. These vanes straighten the airflow and eliminate any swirling motion or
								turbulence. The air velocity of the compressed air must be slowed before it enters
								the combustion chamber. The divergent shape of a <b>diffuser</b> slows compressor discharge
								while, at the same time, increasing air pressure to its highest value in the engine.
							</p>
							<ImageGrid
								images={[
									{ src: '/images/turbofan-module3/img_10.png', alt: 'Stator Vanes' },
									{ src: '/images/turbofan-module3/img_11.png', alt: 'Shrouded Stator Vanes' }
								]}
								columns={2}
								height="260px"
							/>

							<h5
								class="font-heading mb-4 text-lg font-bold text-[#B34700] underline decoration-2 underline-offset-4"
							>
								Pressure Stage
							</h5>
							<ul class="my-8 list-none pl-0">
								<li
									class="relative mb-5 pl-10 text-lg leading-relaxed text-[#2c3e50] before:absolute before:left-2 before:text-2xl before:font-bold before:text-[#B34700] before:content-['▸']"
								>
									Each consecutive row of rotor blades and stator vanes constitutes a <b
										>pressure stage</b
									>.
								</li>
								<li
									class="relative mb-5 pl-10 text-lg leading-relaxed text-[#2c3e50] before:absolute before:left-2 before:text-2xl before:font-bold before:text-[#B34700] before:content-['▸']"
								>
									The number of stages is determined by the amount of air and total pressure rise
									required.
								</li>
								<li
									class="relative mb-5 pl-10 text-lg leading-relaxed text-[#2c3e50] before:absolute before:left-2 before:text-2xl before:font-bold before:text-[#B34700] before:content-['▸']"
								>
									A single stage in an axial flow compressor is capable of producing a compressor
									pressure ratio of only <b>1.25:1</b>.
								</li>
								<li
									class="relative mb-5 pl-10 text-lg leading-relaxed text-[#2c3e50] before:absolute before:left-2 before:text-2xl before:font-bold before:text-[#B34700] before:content-['▸']"
								>
									Therefore, high compressor pressure ratios are obtained by adding more compressor
									stages. In order to add more compressor stages, multi-spool compressors are
									created.
								</li>
							</ul>

							<h5
								class="font-heading mb-4 text-lg font-bold text-[#B34700] underline decoration-2 underline-offset-4"
							>
								Process of Compression
							</h5>
							<ul class="my-8 list-none pl-0">
								<li
									class="relative mb-5 pl-10 text-lg leading-relaxed text-[#2c3e50] before:absolute before:left-2 before:text-2xl before:font-bold before:text-[#B34700] before:content-['▸']"
								>
									The air from the air inlet is guided by the inlet guide vanes to the rotors and
									stators.
								</li>
								<li
									class="relative mb-5 pl-10 text-lg leading-relaxed text-[#2c3e50] before:absolute before:left-2 before:text-2xl before:font-bold before:text-[#B34700] before:content-['▸']"
								>
									Each compressor stage raises the pressure of the incoming air while the air's
									velocity is alternately increased then decreased as airflow proceeds through the
									compressor.
								</li>
								<li
									class="relative mb-5 pl-10 text-lg leading-relaxed text-[#2c3e50] before:absolute before:left-2 before:text-2xl before:font-bold before:text-[#B34700] before:content-['▸']"
								>
									The rotor blades slightly accelerate the airflow then the stator vanes diffuse the
									air, slowing it and increasing the pressure.
								</li>
								<li
									class="relative mb-5 pl-10 text-lg leading-relaxed text-[#2c3e50] before:absolute before:left-2 before:text-2xl before:font-bold before:text-[#B34700] before:content-['▸']"
								>
									The overall result is increased air pressure and relatively constant air velocity
									from compressor inlet to outlet.
								</li>
								<li
									class="relative mb-5 pl-10 text-lg leading-relaxed text-[#2c3e50] before:absolute before:left-2 before:text-2xl before:font-bold before:text-[#B34700] before:content-['▸']"
								>
									The outlet guide vanes will now guide the compressed air into the diffuser to
									prepare the air mass for combustion.
								</li>
								<li
									class="relative mb-5 pl-10 text-lg leading-relaxed text-[#2c3e50] before:absolute before:left-2 before:text-2xl before:font-bold before:text-[#B34700] before:content-['▸']"
								>
									This process will repeat depending on the number of spools the compressor have.
								</li>
							</ul>

							<h5
								class="font-heading mb-4 text-lg font-bold text-[#B34700] underline decoration-2 underline-offset-4"
							>
								Multi Spool Compressors
							</h5>
							<p class="mb-6 text-justify text-lg leading-loose text-[#2c3e50]">
								Engine designers devised a way to overcome the limitations of single-spool
								compressors by splitting the compressor into two or three sections.
							</p>
							<ul class="my-8 list-none pl-0">
								<li
									class="relative mb-5 pl-10 text-lg leading-relaxed text-[#2c3e50] before:absolute before:left-2 before:text-2xl before:font-bold before:text-[#B34700] before:content-['▸']"
								>
									Each section is connected to a portion of the turbine section by shafts that run
									coaxially, one within the other.
								</li>
							</ul>

							<h5
								class="font-heading mb-4 text-lg font-bold text-[#B34700] underline decoration-2 underline-offset-4"
							>
								Dual Spool Compressor
							</h5>
							<ul class="my-8 list-none pl-0">
								<li
									class="relative mb-5 pl-10 text-lg leading-relaxed text-[#2c3e50] before:absolute before:left-2 before:text-2xl before:font-bold before:text-[#B34700] before:content-['▸']"
								>
									The <b>front section</b> of a dual- spool compressor is called the
									<b>low pressure, low speed, or N1 compressor</b>. This low pressure compressor is
									typically driven by a two-stage turbine at the rear of the turbine section.
								</li>
								<li
									class="relative mb-5 pl-10 text-lg leading-relaxed text-[#2c3e50] before:absolute before:left-2 before:text-2xl before:font-bold before:text-[#B34700] before:content-['▸']"
								>
									The <b>second compressor</b> section of a twin-spool compressor is called the
									<b>high pressure, high speed, or N2 compressor</b> and is typically driven by a single
									stage high-pressure turbine at the front of the turbine section.
								</li>
							</ul>
							<ImageGrid
								images={[
									{ src: '/images/turbofan-module3/img_13.png', alt: 'Dual Spool Compressor' }
								]}
								columns={1}
								height="260px"
							/>

							<h5
								class="font-heading mb-4 text-lg font-bold text-[#B34700] underline decoration-2 underline-offset-4"
							>
								Triple Spool Compressor
							</h5>
							<ul class="my-8 list-none pl-0">
								<li
									class="relative mb-5 pl-10 text-lg leading-relaxed text-[#2c3e50] before:absolute before:left-2 before:text-2xl before:font-bold before:text-[#B34700] before:content-['▸']"
								>
									In this arrangement the <b>fan</b> is referred to as the
									<b>low speed, or N1 compressor</b>
								</li>
								<li
									class="relative mb-5 pl-10 text-lg leading-relaxed text-[#2c3e50] before:absolute before:left-2 before:text-2xl before:font-bold before:text-[#B34700] before:content-['▸']"
								>
									The compressor next in line is called the <b>intermediate, or N2 compressor</b>,
								</li>
								<li
									class="relative mb-5 pl-10 text-lg leading-relaxed text-[#2c3e50] before:absolute before:left-2 before:text-2xl before:font-bold before:text-[#B34700] before:content-['▸']"
								>
									The innermost compressor is the <b>high pressure, or N3 compressor</b>.
								</li>
							</ul>
							<ImageGrid
								images={[
									{ src: '/images/turbofan-module3/img_14.png', alt: 'Triple Spool Compressor' }
								]}
								columns={1}
								height="260px"
							/>

							<h5 class="font-heading my-8 text-center text-xl font-bold text-[#B34700] uppercase">
								AXIAL FLOW COMPRESSOR
							</h5>
							<div
								class="mx-auto max-w-4xl overflow-x-auto rounded-xl border-2 border-black shadow-md"
							>
								<table class="w-full border-collapse text-[#1a2b47]">
									<thead>
										<tr class="bg-white">
											<th class="border-2 border-black p-4 text-center font-bold uppercase"
												>ADVANTAGES</th
											>
											<th class="border-2 border-black p-4 text-center font-bold uppercase"
												>DISADVANTAGES</th
											>
										</tr>
									</thead>
									<tbody>
										<tr class="bg-white">
											<td class="border-2 border-black p-4 text-center">High peak efficiencies</td>
											<td class="border-2 border-black p-4 text-center"
												>Good efficiencies over only narrow<br />rotational speed range</td
											>
										</tr>
										<tr class="bg-white">
											<td class="border-2 border-black p-4 text-center">Small frontal area</td>
											<td class="border-2 border-black p-4 text-center"
												>Difficulty of manufacture and high cost</td
											>
										</tr>
										<tr class="bg-white">
											<td class="border-2 border-black p-4 text-center"
												>Straight through flow, allowing high<br />ram efficiency</td
											>
											<td class="border-2 border-black p-4 text-center">Relatively high weight</td>
										</tr>
										<tr class="bg-white">
											<td class="border-2 border-black p-4 text-center"
												>Increased pressure rise by increasing<br />number of stages, with
												negligible loses</td
											>
											<td class="border-2 border-black p-4 text-center"
												>High starting power requirements</td
											>
										</tr>
									</tbody>
								</table>
							</div>

							<h5
								class="font-heading mt-8 mb-4 text-lg font-bold text-[#B34700] underline decoration-2 underline-offset-4"
							>
								Compressor Stall
							</h5>
							<p class="mb-6 text-justify text-lg leading-loose text-[#2c3e50]">
								A compressor blade has an angle of attack, therefore, are subject to the same
								aerodynamic principles that apply to aircraft wings. A compressor stall occurs when
								the compressor blades' angle of attack exceeds the critical angle of attack. It can
								be described as an imbalance between the two vector quantities, inlet velocity, and
								compressor rotational speed.
							</p>
							<div class="my-8 rounded-xl border-l-4 border-[#B34700] bg-orange-50 p-6 shadow-sm">
								<h5 class="font-heading mb-4 text-xl font-bold text-[#B34700]">
									Causes of Compressor Stall
								</h5>
								<ul class="list-none pl-0">
									<li
										class="relative mb-3 pl-6 text-base leading-relaxed text-[#2c3e50] before:absolute before:top-2 before:left-0 before:h-2 before:w-2 before:rounded-full before:bg-[#B34700]"
									>
										Compressor stalls typically occur when the engine inlet air becomes turbulent or
										disrupted when an aircraft flies in severe turbulence or performs abrupt flight
										maneuvers.
									</li>
									<li
										class="relative mb-3 pl-6 text-base leading-relaxed text-[#2c3e50] before:absolute before:top-2 before:left-0 before:h-2 before:w-2 before:rounded-full before:bg-[#B34700]"
									>
										Excessive fuel flow produced by a sudden engine acceleration, accompanied by
										incompatible engine rpm and airflow combinations.
									</li>
									<li
										class="relative mb-3 pl-6 text-base leading-relaxed text-[#2c3e50] before:absolute before:top-2 before:left-0 before:h-2 before:w-2 before:rounded-full before:bg-[#B34700]"
									>
										Contamination or damage to compressor blades, stator vanes, or turbine
										components can also cause a compressor stall.
									</li>
								</ul>
							</div>

							<h5
								class="font-heading mb-4 text-lg font-bold text-[#B34700] underline decoration-2 underline-offset-4"
							>
								Hung Stalls
							</h5>
							<p class="mb-6 text-justify text-lg leading-loose text-[#2c3e50]">
								Hung stalls are severe stalls that can significantly impair engine performance,
								cause loss of power, and can damage the engine.
							</p>
						</div>
					</section>
				</div>
			{/if}

			<!-- Page 3: HOT SECTION: COMBUSTION -->
			{#if currentPageSections === 3}
				<section class="opacity-100">
					<SectionHeader title="HOT SECTION: COMBUSTION" color="#B34700" />
					<div
						class="relative z-[1] rounded-3xl border-[5px] border-[#B34700] bg-white p-6 text-[#1a2b47] md:p-8"
					>
						<div
							class="relative mb-6 h-[400px] w-full rounded-xl border border-gray-200 bg-gray-50 shadow-inner"
						>
							<ModelViewer modelPath="/models/Combustion.glb" autoLoad={true} />
						</div>

						<ul class="my-8 list-none pl-0">
							<li
								class="relative mb-5 pl-10 text-lg leading-relaxed text-[#2c3e50] before:absolute before:left-2 before:text-2xl before:font-bold before:text-[#B34700] before:content-['▸']"
							>
								A combustion section is typically located directly between the compressor diffuser
								and turbine section.
							</li>
							<li
								class="relative mb-5 pl-10 text-lg leading-relaxed text-[#2c3e50] before:absolute before:left-2 before:text-2xl before:font-bold before:text-[#B34700] before:content-['▸']"
							>
								All combustion sections contain the same basic elements: one or more combustion
								chambers (combustors), a fuel injection system, an ignition source, and a fuel
								drainage system.
							</li>
							<li
								class="relative mb-5 pl-10 text-lg leading-relaxed text-[#2c3e50] before:absolute before:left-2 before:text-2xl before:font-bold before:text-[#B34700] before:content-['▸']"
							>
								The primary function of the combustion section is to burn the fuel/air mixture,
								thereby adding heat energy to the air.
							</li>
						</ul>

						<h5
							class="font-heading mb-4 text-lg font-bold text-[#B34700] underline decoration-2 underline-offset-4"
						>
							Fuel Injection System
						</h5>
						<p class="mb-6 text-justify text-lg leading-loose text-[#2c3e50]">
							The fuel injection system meters the appropriate amount of fuel through the fuel
							nozzles into the combustors. Fuel nozzles are located in the combustion chamber case.
							Fuel is delivered through the nozzles into the liners in a finely atomized spray to
							ensure thorough mixing with the incoming air.
						</p>

						<h5
							class="font-heading mb-4 text-lg font-bold text-[#B34700] underline decoration-2 underline-offset-4"
						>
							Fuel Drainage System
						</h5>
						<p class="mb-6 text-justify text-lg leading-loose text-[#2c3e50]">
							A fuel drainage system accomplishes the important task of draining the unburned fuel
							after engine shutdown. In addition, draining the unburned fuel helps to prevent gum
							deposits in the fuel manifold, nozzles, and combustion chambers, which are caused by
							fuel residue.
						</p>
						<ImageGrid
							images={[
								{ src: '/images/turbofan-module3/img_15.png', alt: 'Combustion Chamber Components' }
							]}
							columns={1}
							height="320px"
						/>

						<h5
							class="font-heading mb-4 text-lg font-bold text-[#B34700] underline decoration-2 underline-offset-4"
						>
							Combustion Chambers (Combustors)
						</h5>
						<p class="mb-6 text-justify text-lg leading-loose text-[#2c3e50]">
							The combustor chambers in a turbine engine are where the fuel and air are mixed and
							burned. Combustors may vary depending on their type.
						</p>
					</div>
				</section>

				<section class="opacity-100">
					<SectionHeader title="Types of Combustion Chambers" color="#B34700" />
					<div
						class="relative z-[1] rounded-3xl border-[5px] border-[#B34700] bg-white p-6 text-[#1a2b47] md:p-8"
					>
						<h5
							class="font-heading mb-4 text-lg font-bold text-[#B34700] underline decoration-2 underline-offset-4"
						>
							Multiple Can Type / Tubular
						</h5>
						<p class="mb-6 text-justify text-lg leading-loose text-[#2c3e50]">
							The multiple-can type combustion chamber consists of a series of individual combustor
							cans, which act as individual burner units. It is well-suited to centrifugal
							compressor engines because of the way the compressor discharge air is equally divided
							at the diffuser.
						</p>
						<ImageGrid
							images={[
								{ src: '/images/turbofan-module3/img_16.png', alt: 'Multiple Can Type Combustor' }
							]}
							columns={1}
							height="320px"
						/>
						<p class="mb-6 text-justify text-lg leading-loose text-[#2c3e50]">
							One of the major advantages of this type of combustor chamber is that multiple
							combustors can be individually removed for inspection. The individual combustors in a
							typical multiple-can combustion chamber are interconnected with small <b
								>flame propagation tubes</b
							>. The combustion starts in the two cans equipped with igniter plugs; the flame then
							travels through the tubes and ignites the fuel/air mixture in the other cans. There
							are 8 or 10 cans in a typical multiple-can combustion section.
						</p>

						<h5
							class="font-heading mb-4 text-lg font-bold text-[#B34700] underline decoration-2 underline-offset-4"
						>
							Annular Type or Basket Type Combustor
						</h5>
						<p class="mb-6 text-justify text-lg leading-loose text-[#2c3e50]">
							An annular combustion chamber consists of a housing and a perforated inner liner, or
							basket. It must be removed as a single unit for repair or replacement. Annular
							combustors are commonly used in both small and large engines. Normally, the ignition
							source consists of two spark igniters similar to the type found in multiple-can
							combustors. In a conventional annular combustor, airflow enters at the front and is
							discharged at the rear, with primary and secondary airflow much the same as in the
							multiple-can design.
						</p>
						<ImageGrid
							images={[
								{ src: '/images/turbofan-module3/img_17.png', alt: 'Annular Type Combustor' }
							]}
							columns={1}
							height="320px"
						/>

						<h5
							class="font-heading mb-4 text-lg font-bold text-[#B34700] underline decoration-2 underline-offset-4"
						>
							Can-Annular Type Combustor / Tuboannular
						</h5>
						<p class="mb-6 text-justify text-lg leading-loose text-[#2c3e50]">
							Can-annular combustion sections represent a combination of the multiple-can combustor
							and the annular type combustor. It was invented by Pratt & Whitney and consists of a
							removable steel shroud that encircles the entire combustion section. An individual can
							and liner is removed and installed as one unit for maintenance. This design combines
							the ease of overhaul and testing of the multiple-can arrangement with the compactness
							of the annular combustor.
						</p>
						<ImageGrid
							images={[
								{ src: '/images/turbofan-module3/img_18.png', alt: 'Can-Annular Type Combustor' }
							]}
							columns={1}
							height="320px"
						/>
					</div>
				</section>

				<section class="opacity-100">
					<SectionHeader title="Characteristics of a Good Combustion Chamber" color="#B34700" />
					<div
						class="relative z-[1] rounded-3xl border-[5px] border-[#B34700] bg-white p-6 text-[#1a2b47] md:p-8"
					>
						<ul class="my-8 list-none pl-0">
							<li
								class="relative mb-5 pl-10 text-lg leading-relaxed text-[#2c3e50] before:absolute before:left-2 before:text-2xl before:font-bold before:text-[#B34700] before:content-['▸']"
							>
								Mix fuel and air effectively in the best ratio for good combustion.
							</li>
							<li
								class="relative mb-5 pl-10 text-lg leading-relaxed text-[#2c3e50] before:absolute before:left-2 before:text-2xl before:font-bold before:text-[#B34700] before:content-['▸']"
							>
								Burn the mixture as efficiently as possible.
							</li>
							<li
								class="relative mb-5 pl-10 text-lg leading-relaxed text-[#2c3e50] before:absolute before:left-2 before:text-2xl before:font-bold before:text-[#B34700] before:content-['▸']"
							>
								Cool the hot combustion gases to a temperature the turbine blades can tolerate.
							</li>
							<li
								class="relative mb-5 pl-10 text-lg leading-relaxed text-[#2c3e50] before:absolute before:left-2 before:text-2xl before:font-bold before:text-[#B34700] before:content-['▸']"
							>
								Distribute hot gases evenly to the turbine section
							</li>
						</ul>
					</div>
				</section>

				<section class="opacity-100">
					<SectionHeader title="Primary and Secondary Air" color="#B34700" />
					<div
						class="relative z-[1] rounded-3xl border-[5px] border-[#B34700] bg-white p-6 text-[#1a2b47] md:p-8"
					>
						<ul class="my-8 list-none pl-0">
							<li
								class="relative mb-5 pl-10 text-lg leading-relaxed text-[#2c3e50] before:absolute before:left-2 before:text-2xl before:font-bold before:text-[#B34700] before:content-['▸']"
							>
								In order to allow the combustion section to mix the incoming fuel and air, ignite
								the mixture, and cool the combustion gases, airflow through a combustor is divided
								into primary and secondary paths.
							</li>
							<li
								class="relative mb-5 pl-10 text-lg leading-relaxed text-[#2c3e50] before:absolute before:left-2 before:text-2xl before:font-bold before:text-[#B34700] before:content-['▸']"
							>
								Approximately 25 to 35 percent of the incoming air is designated as primary while 65
								to 75 percent becomes secondary.
							</li>
							<li
								class="relative mb-5 pl-10 text-lg leading-relaxed text-[#2c3e50] before:absolute before:left-2 before:text-2xl before:font-bold before:text-[#B34700] before:content-['▸']"
							>
								Primary, or combustion air, is directed inside the liner in the front end of a
								combustor. It is used to support the combustion.
							</li>
							<li
								class="relative mb-5 pl-10 text-lg leading-relaxed text-[#2c3e50] before:absolute before:left-2 before:text-2xl before:font-bold before:text-[#B34700] before:content-['▸']"
							>
								The secondary airflow in the combustion section forms a cooling air blanket on both
								sides of the liner and centers the combustion flames so they do not contact the
								liner. It also cools the hot gases before they enter the turbine section.
							</li>
						</ul>
						<ImageGrid
							images={[
								{ src: '/images/turbofan-module3/img_19.png', alt: 'Primary and Secondary Air' }
							]}
							columns={1}
							height="320px"
						/>
					</div>
				</section>

				<section class="opacity-100">
					<SectionHeader title="Flameout" color="#B34700" />
					<div
						class="relative z-[1] rounded-3xl border-[5px] border-[#B34700] bg-white p-6 text-[#1a2b47] md:p-8"
					>
						<ul class="my-8 list-none pl-0">
							<li
								class="relative mb-5 pl-10 text-lg leading-relaxed text-[#2c3e50] before:absolute before:left-2 before:text-2xl before:font-bold before:text-[#B34700] before:content-['▸']"
							>
								The situation wherein an excessively high velocity airflow could literally blow the
								flame out of the engine/combustion chamber.
							</li>
						</ul>
						<h5
							class="font-heading mb-4 text-lg font-bold text-[#B34700] underline decoration-2 underline-offset-4"
						>
							Two Types of Flameout
						</h5>
						<ul class="my-8 list-none pl-0">
							<li
								class="relative mb-5 pl-10 text-lg leading-relaxed text-[#2c3e50] before:absolute before:left-2 before:text-2xl before:font-bold before:text-[#B34700] before:content-['▸']"
							>
								<b>Lean Die Out</b> - usually occurs at high altitude, where low engine speeds and low
								fuel pressure form a weak flame that can die out in a normal airflow.
							</li>
							<li
								class="relative mb-5 pl-10 text-lg leading-relaxed text-[#2c3e50] before:absolute before:left-2 before:text-2xl before:font-bold before:text-[#B34700] before:content-['▸']"
							>
								<b>Rich Blow Out</b> - occurs during rapid engine acceleration when an overly-rich mixture
								causes the fuel temperature to drop below the combustion temperature or when there is
								insufficient airflow to support combustion.
							</li>
						</ul>
					</div>
				</section>

				<section class="opacity-100">
					<SectionHeader title="Combustion Process" color="#B34700" />
					<div
						class="relative z-[1] rounded-3xl border-[5px] border-[#B34700] bg-white p-6 text-[#1a2b47] md:p-8"
					>
						<p class="mb-6 text-justify text-lg leading-loose text-[#2c3e50]"></p>
						<p class="mb-6 text-justify text-lg leading-loose text-[#2c3e50]">
							Air from the compressor enters the combustion chamber at high velocity and is slowed
							down to increase its pressure. A flame tube (combustion liner) controls the air
							distribution to maintain an air-fuel ratio between 45:1 and 130:1. About 20% of the
							air enters through the snout into the primary combustion zone, while the rest flows
							around the flame tube. Additional air passes through secondary holes, creating a
							recirculation zone that mixes air and fuel for stable combustion. The fuel spray from
							the nozzle intersects this vortex, enhancing mixing and atomization. Combustion must
							finish before dilution air enters to avoid cooling and incomplete burning. Ignition
							starts with an electric spark, after which the flame sustains itself. Fuel is usually
							delivered as a fine atomized spray through nozzles.
						</p>
					</div>
				</section>
			{/if}

			<!-- Page 4: TURBINE SECTION -->
			{#if currentPageSections === 4}
				<section class="opacity-100">
					<SectionHeader title="TURBINE" color="#B34700" />
					<div
						class="relative z-[1] rounded-3xl border-[5px] border-[#B34700] bg-white p-6 text-[#1a2b47] md:p-8"
					>
						<div
							class="mb-6 h-[250px] w-full overflow-hidden rounded-xl border border-white/20 shadow-inner md:h-[400px]"
						>
							<ModelViewer modelPath="/models/Turbine.glb" autoLoad={true} />
						</div>
						<p class="mb-4 text-center font-bold text-[#B34700] italic">
							(3D SECTIONED VIEW OF TURBINE ONLY)
						</p>
						<p class="mb-6 text-justify text-lg leading-loose text-[#2c3e50]">
							A turbine transforms a portion of the kinetic energy in the hot exhaust gases into
							mechanical energy to drive the compressor and accessories. The turbine section of a
							turbojet engine is located downstream of the combustion section and consists of four
							basic elements: <b>a case, a stator, a shroud, and a rotor</b>.
						</p>
						<ImageGrid
							images={[
								{ src: '/images/turbofan-module3/img_20.1.png', alt: 'Turbine Components' },
								{ src: '/images/turbofan-module3/img_20.2.png', alt: 'Turbine Assembly' }
							]}
							columns={2}
							height="260px"
						/>

						<h5
							class="font-heading mb-4 text-lg font-bold text-[#B34700] underline decoration-2 underline-offset-4"
						>
							Case
						</h5>
						<p class="mb-6 text-justify text-lg leading-loose text-[#2c3e50]">
							The turbine casing encloses the turbine rotor and stator assembly, giving either
							direct or indirect support to the stator elements. A typical case has flanges on both
							ends that provide a means of attaching the turbine section to the combustion section
							and the exhaust assembly.
						</p>

						<h5
							class="font-heading mb-4 text-lg font-bold text-[#B34700] underline decoration-2 underline-offset-4"
						>
							Turbine Stator
						</h5>
						<p class="mb-6 text-justify text-lg leading-loose text-[#2c3e50]">
							A stator element is most commonly referred to as the <b
								>turbine nozzle, turbine guide vanes</b
							>, or the <b>nozzle diaphragm</b>. The turbine nozzle is located directly aft of the
							combustion section and immediately forward of the turbine wheel. It is typically
							exposed to the highest temperatures. Its purpose is to collect the high-energy airflow
							from the combustors and direct the flow to strike the turbine rotor at the appropriate
							angle. The vanes of a turbine nozzle are set at such an angle that they form several
							converging nozzles that convert some of the exhaust gases' pressure energy to velocity
							energy. The nozzle vanes must be constructed to allow for thermal expansion.
						</p>

						<h5
							class="font-heading mb-4 text-lg font-bold text-[#B34700] underline decoration-2 underline-offset-4"
						>
							Turbine Rotor
						</h5>
						<p class="mb-6 text-justify text-lg leading-loose text-[#2c3e50]">
							The rotating elements of a turbine section consist of a <b>shaft</b> and a
							<b>turbine rotor (wheel)</b>.
						</p>
						<ul class="my-8 list-none pl-0">
							<li
								class="relative mb-5 pl-10 text-lg leading-relaxed text-[#2c3e50] before:absolute before:left-2 before:text-2xl before:font-bold before:text-[#B34700] before:content-['▸']"
							>
								The turbine wheel is a dynamically balanced unit consisting of blades attached to a
								rotating disk.
							</li>
							<li
								class="relative mb-5 pl-10 text-lg leading-relaxed text-[#2c3e50] before:absolute before:left-2 before:text-2xl before:font-bold before:text-[#B34700] before:content-['▸']"
							>
								The turbine disk is the anchoring component for the turbine blades and is bolted or
								welded to the main shaft.
							</li>
						</ul>
						<p class="mb-6 text-justify text-lg leading-loose text-[#2c3e50]">
							As the high-velocity gases pass through the turbine nozzle and impact the turbine
							blades, the turbine wheel rotates. Many engines use multiple turbine stages, each
							stage consisting of a turbine nozzle and wheel.
						</p>
						<p class="mb-6 text-justify text-lg leading-loose text-[#2c3e50]">
							<b><i>Growth or Creep</i></b> – it is a phenomenon in which extreme stress on turbine blades
							may cause the turbine blades to grow in length due to severe centrifugal loads imposed by
							high rotational speeds.
						</p>
						<ImageGrid
							images={[
								{
									src: '/images/turbofan-module3/img_21.png',
									alt: 'Case, Stator, Shroud, and Rotor',
									caption: 'Case, Stator, Shroud, and Rotor'
								}
							]}
							columns={1}
							height="320px"
						/>
					</div>
				</section>

				<section class="opacity-100">
					<SectionHeader title="Turbine Blades" color="#B34700" />
					<div
						class="relative z-[1] rounded-3xl border-[5px] border-[#B34700] bg-white p-6 text-[#1a2b47] md:p-8"
					>
						<p class="mb-6 text-justify text-lg leading-loose text-[#2c3e50]">
							Turbine blades are airfoil-shaped components designed to extract the maximum amount of
							energy from the flow of hot gases. Turbine blades fit loosely into a turbine disk when
							an engine is cold, but expand to fit tightly at normal operating temperatures. The
							most commonly used method for attaching turbine blades is by <b>fir tree slots</b> cut into
							the turbine disk rim and matching bases cast or machined into the turbine blade base. It
							can be classified as impulse blades, reaction blades, and impulse-reaction blades.
						</p>
						<ul class="my-8 list-none pl-0">
							<li
								class="relative mb-5 pl-10 text-lg leading-relaxed text-[#2c3e50] before:absolute before:left-2 before:text-2xl before:font-bold before:text-[#B34700] before:content-['▸']"
							>
								<b>Impulse Turbine Blades</b> – the blades merely change the direction of airflow coming
								from the turbine nozzle and cause relatively no change in gas pressure or velocity.
							</li>
							<li
								class="relative mb-5 pl-10 text-lg leading-relaxed text-[#2c3e50] before:absolute before:left-2 before:text-2xl before:font-bold before:text-[#B34700] before:content-['▸']"
							>
								<b>Reaction Turbine Blades</b> – produce a turning force based on an aerodynamic action.
								To do this, the turbine blades form a series of converging ducts that increase gas velocity
								and reduce pressure.
							</li>
						</ul>
						<ImageGrid
							images={[
								{
									src: '/images/turbofan-module3/img_22.png',
									alt: 'Impulse and Reaction Turbine Blades'
								},
								{
									src: '/images/turbofan-module3/img_24.1.png',
									alt: 'Turbine Blade Attachment Detail'
								},
								{
									src: '/images/turbofan-module3/img_24.2.png',
									alt: 'Turbine Blade Shroud and Tip Detail'
								}
							]}
							columns={3}
							height="260px"
						/>
						<ul class="my-8 list-none pl-0">
							<li
								class="relative mb-5 pl-10 text-lg leading-relaxed text-[#2c3e50] before:absolute before:left-2 before:text-2xl before:font-bold before:text-[#B34700] before:content-['▸']"
							>
								<b>Impulse-Reaction Turbine Blades</b> – a combination of impulse and reaction blades,
								the workload along the length of the blade is evenly distributed. The blade base is impulse-shaped
								while the blade tip is reaction-shaped.
							</li>
						</ul>

						<h5
							class="font-heading mb-4 text-lg font-bold text-[#B34700] underline decoration-2 underline-offset-4"
						>
							Shrouded Turbine Blades
						</h5>
						<p class="mb-6 text-justify text-lg leading-loose text-[#2c3e50]">
							Turbine blades can be open or shrouded at their ends. Shroud is attached to the tips
							of the turbine blades to reduce vibration.
						</p>
					</div>
				</section>

				<section class="opacity-100">
					<SectionHeader title="Cooling of the Turbine Section" color="#B34700" />
					<div
						class="relative z-[1] rounded-3xl border-[5px] border-[#B34700] bg-white p-6 text-[#1a2b47] md:p-8"
					>
						<p class="mb-6 text-justify text-lg leading-loose text-[#2c3e50]">
							The most common ways of cooling the components in the turbine section is to use engine
							bleed air. There are two types of blade cooling: convection cooling/film cooling and
							transpiration cooling.
						</p>
						<ul class="my-8 list-none pl-0">
							<li
								class="relative mb-5 pl-10 text-lg leading-relaxed text-[#2c3e50] before:absolute before:left-2 before:text-2xl before:font-bold before:text-[#B34700] before:content-['▸']"
							>
								<b>Convection Cooling/Film Cooling</b> – compressor bleed air is typically directed in
								through the hollow blades and out through holes in the tip, leading edge, and trailing
								edge.
							</li>
							<li
								class="relative mb-5 pl-10 text-lg leading-relaxed text-[#2c3e50] before:absolute before:left-2 before:text-2xl before:font-bold before:text-[#B34700] before:content-['▸']"
							>
								<b>Transpiration Cooling</b> – only used on stationary nozzle vanes, bleed air is ducted
								into the vanes and exits through the porous material.
							</li>
						</ul>
						<p class="mb-6 text-justify text-lg leading-loose text-[#2c3e50]">
							<b>Active Tip Clearance Control (ACC)</b> – ACC controls the thermal expansion rate of the
							turbine case by regulating the flow of cooling air around the turbine case.
						</p>
						<ImageGrid
							images={[
								{
									src: '/images/turbofan-module3/img_23.1.png',
									alt: 'Active Tip Clearance Control 1'
								},
								{
									src: '/images/turbofan-module3/img_23.2.png',
									alt: 'Active Tip Clearance Control 2'
								}
							]}
							columns={2}
							height="320px"
						/>
						<p class="mb-6 text-justify text-lg leading-loose text-[#2c3e50]">
							<b>Counter Counter-rotating turbines</b> – are chosen by engine designers for their effectiveness
							in dampening gyroscopic effects and reducing engine vibration, not for aerodynamic reasons.
						</p>
					</div>
				</section>
			{/if}

			<!-- Page 5: EXHAUST SECTION & ACCESSORIES -->
			{#if currentPageSections === 5}
				<section class="opacity-100">
					<SectionHeader title="EXHAUST SECTION" color="#B34700" />
					<div
						class="relative z-[1] rounded-3xl border-[5px] border-[#B34700] bg-white p-6 text-[#1a2b47] md:p-8"
					>
						<div
							class="mb-6 h-[250px] w-full overflow-hidden rounded-xl border border-white/20 shadow-inner md:h-[400px]"
						>
							<ModelViewer modelPath="/models/Exhaust.glb" autoLoad={true} />
						</div>
						<p class="mb-4 text-center font-bold text-[#B34700] italic">
							(3D SECTIONED VIEW OF EXHAUST ONLY)
						</p>
						<p class="mb-6 text-justify text-lg leading-loose text-[#2c3e50]">
							A typical exhaust section extends from the rear of the turbine section to the point
							where the exhaust gases leave the engine. It must direct the flow of hot gases
							rearward in such a manner as to prevent turbulence and, at the same time, impart a
							high final or exit velocity to the gases. It is comprised of several components
							including the <b>exhaust cone, exhaust duct</b> or <b>tailpipe,</b> and
							<b>exhaust nozzle.</b>
						</p>
						<ImageGrid
							images={[{ src: '/images/turbofan-module3/img_26.png', alt: 'Exhaust Components' }]}
							columns={1}
							height="320px"
						/>

						<h5
							class="font-heading mb-4 text-lg font-bold text-[#B34700] underline decoration-2 underline-offset-4"
						>
							Exhaust Cone
						</h5>
						<p class="mb-6 text-justify text-lg leading-loose text-[#2c3e50]">
							A typical exhaust cone assembly consists of an outer duct, or shell, an inner cone, or
							tail cone, three or more radial hollow struts, and a group of tie rods. Its purpose is
							to channel and collect turbine discharge gases into a single jet.
						</p>

						<h5
							class="font-heading mb-4 text-lg font-bold text-[#B34700] underline decoration-2 underline-offset-4"
						>
							Tailpipe
						</h5>
						<p class="mb-6 text-justify text-lg leading-loose text-[#2c3e50]">
							A tailpipe is an extension of the exhaust section that directs exhaust gases safely
							from the exhaust cone to the exhaust, or jet nozzle. It is used almost exclusively
							with engines that are installed within an aircraft's fuselage to protect the
							surrounding airframe.
						</p>

						<h5
							class="font-heading mb-4 text-lg font-bold text-[#B34700] underline decoration-2 underline-offset-4"
						>
							Exhaust Nozzle
						</h5>
						<p class="mb-6 text-justify text-lg leading-loose text-[#2c3e50]">
							An exhaust, or jet nozzle, provides the exhaust gases with a final boost in velocity.
							The two types of exhaust nozzle designs used on aircraft are the converging design,
							and the converging-diverging design.
						</p>
						<ul class="my-8 list-none pl-0">
							<li
								class="relative mb-5 pl-10 text-lg leading-relaxed text-[#2c3e50] before:absolute before:left-2 before:text-2xl before:font-bold before:text-[#B34700] before:content-['▸']"
							>
								<b>Converging Exhaust Nozzle</b> – the convergent shape produces a venturi that accelerates
								the exhaust gases and increases engine thrust.
							</li>
							<li
								class="relative mb-5 pl-10 text-lg leading-relaxed text-[#2c3e50] before:absolute before:left-2 before:text-2xl before:font-bold before:text-[#B34700] before:content-['▸']"
							>
								<b>Converging-Diverging Nozzle</b> – the converging portion of the exhaust nozzle accelerates
								the turbine exhaust gases to supersonic speed at the narrowest part of the duct, then,
								they are accelerated further in the nozzle's divergent portion, so the exhaust gases exit
								the nozzle well above the speed of sound.
							</li>
						</ul>
						<ImageGrid
							images={[
								{ src: '/images/turbofan-module3/img_27.1.png', alt: 'Converging Exhaust Nozzle' },
								{ src: '/images/turbofan-module3/img_27.2.png', alt: 'Converging-Diverging Nozzle' }
							]}
							columns={2}
							height="260px"
						/>

						<h5
							class="font-heading mb-4 text-lg font-bold text-[#B34700] underline decoration-2 underline-offset-4"
						>
							Mixer Unit
						</h5>
						<p class="mb-6 text-justify text-lg leading-loose text-[#2c3e50]">
							On fan or bypass type engines, there are two gas streams venting to the atmosphere;
							high temperature gases are discharged by the turbine and cool air mass moved rearward
							by the fan section. In a low by-pass engine, the flow of cool and hot air are combined
							in a mixer unit that ensures mixing of the two streams prior to exiting the engine.
						</p>
						<ImageGrid
							images={[
								{ src: '/images/turbofan-module3/img_28.1.png', alt: 'Mixer Unit 1' },
								{ src: '/images/turbofan-module3/img_28.2.png', alt: 'Mixer Unit 2' }
							]}
							columns={2}
							height="260px"
						/>

						<h5
							class="font-heading mb-4 text-lg font-bold text-[#B34700] underline decoration-2 underline-offset-4"
						>
							Variable Geometry Nozzle
						</h5>
						<p class="mb-6 text-justify text-lg leading-loose text-[#2c3e50]">
							An exhaust nozzle opening can have either a fixed or variable area. A variable
							geometry nozzle is sometimes necessary on engines that utilize an afterburner. It is
							operated with pneumatic, hydraulic, or electric controls.
						</p>

						<h5
							class="font-heading mb-4 text-lg font-bold text-[#B34700] underline decoration-2 underline-offset-4"
						>
							Afterburners
						</h5>
						<p class="mb-6 text-justify text-lg leading-loose text-[#2c3e50]">
							Afterburners are used to accelerate the exhaust gases, which in turn, increases
							thrust. The components that make up an afterburner include the fuel manifold, an
							ignition source, and a flame holder.
						</p>

						<h5
							class="font-heading mb-4 text-lg font-bold text-[#B34700] underline decoration-2 underline-offset-4"
						>
							Thrust Reversers
						</h5>
						<p class="mb-6 text-justify text-lg leading-loose text-[#2c3e50]">
							Most turbojet and turbofan-powered aircraft are fitted with thrust reversers to assist
							in braking. Thrust reversers redirect the flow of exhaust gases to provide thrust in
							the opposite direction.
						</p>

						<h5
							class="font-heading mb-4 text-lg font-bold text-[#B34700] underline decoration-2 underline-offset-4"
						>
							Noise Suppressors
						</h5>
						<p class="mb-6 text-justify text-lg leading-loose text-[#2c3e50]">
							Noise suppressors used on the ground include portable devices that can be positioned
							near the rear of an engine whenever prolonged ground operation is anticipated.
							Internal noise due to fan, compressor, and turbine blades is also suppressed by the
							design of the compressor and turbine blades - appropriate spacing between the blades
							and vanes to reduce wake and turbulence.
						</p>
					</div>
				</section>

				<section class="opacity-100">
					<SectionHeader title="Accessory Section" color="#B34700" />
					<div
						class="relative z-[1] rounded-3xl border-[5px] border-[#B34700] bg-white p-6 text-[#1a2b47] md:p-8"
					>
						<p class="mb-6 text-justify text-lg leading-loose text-[#2c3e50]">
							The accessory section, or accessory drive, of a gas turbine engine is used to power
							both engine and aircraft accessories such as electric generators, hydraulic pumps,
							fuel pumps, and oil pumps. Secondary functions include acting as an oil reservoir, or
							sump, and housing the accessory drive gears and reduction gears.
						</p>
						<p class="mb-6 text-justify text-lg leading-loose text-[#2c3e50]">
							Typical places where an accessory drive is located include the engine's midsection, or
							the front or rear of the engine. The power needed for Accessory drives is typically
							designed to blend with the engine profile to minimize drag.
						</p>
						<p class="mb-6 text-justify text-lg leading-loose text-[#2c3e50]">
							A set of beveled gears is used to drive an accessory shaft, which, in turn, drives an
							accessory gearbox. Since turbine engines operate at a relatively high rpm, reduction
							gearing is necessary in the accessory drive system to provide appropriate drive speeds
							for the accessories. In some installations, an intermediate or transfer gearbox is
							necessary to obtain the appropriate reduction gearing for the accessories.
						</p>
						<ImageGrid
							images={[{ src: '/images/turbofan-module3/img_29.png', alt: 'Accessory Section' }]}
							columns={1}
							height="260px"
						/>
					</div>
				</section>

				<section class="opacity-100">
					<SectionHeader title="Auxiliary Power Units" color="#B34700" />
					<div
						class="relative z-[1] rounded-3xl border-[5px] border-[#B34700] bg-white p-6 text-[#1a2b47] md:p-8"
					>
						<p class="mb-6 text-justify text-lg leading-loose text-[#2c3e50]">
							The Auxiliary Power Unit (APU) is a constant-speed gas turbine engine. The APU is a
							self-contained unit, which enables the aircraft to be independent of external
							pneumatic and electrical power sources. To meet the demands for ground power when the
							aircraft engines are not running, for example, large amounts of electrical power for
							passenger amenities such as lighting, entertainment, and food preparation, most large
							turbine aircraft are equipped with auxiliary power units, or APUs. APU provides:
						</p>
						<ul class="my-8 list-none pl-0">
							<li
								class="relative mb-5 pl-10 text-lg leading-relaxed text-[#2c3e50] before:absolute before:left-2 before:text-2xl before:font-bold before:text-[#B34700] before:content-['▸']"
							>
								Electrical power for the aircraft systems,
							</li>
							<li
								class="relative mb-5 pl-10 text-lg leading-relaxed text-[#2c3e50] before:absolute before:left-2 before:text-2xl before:font-bold before:text-[#B34700] before:content-['▸']"
							>
								Bleed air for engine starting and air conditioning on the ground,
							</li>
							<li
								class="relative mb-5 pl-10 text-lg leading-relaxed text-[#2c3e50] before:absolute before:left-2 before:text-2xl before:font-bold before:text-[#B34700] before:content-['▸']"
							>
								Bleed air for air conditioning/pressurization and wing anti-ice in flight.
							</li>
						</ul>
						<ImageGrid
							images={[
								{ src: '/images/turbofan-module3/img_30.png', alt: 'APU 1' },
								{ src: '/images/turbofan-module3/img_31.png', alt: 'APU 2' },
								{ src: '/images/turbofan-module3/img_33.1.png', alt: 'APU 3' },
								{ src: '/images/turbofan-module3/img_33.2.png', alt: 'APU 4' }
							]}
							columns={2}
							height="260px"
						/>
						<ImageGrid
							images={[
								{ src: '/images/turbofan-module3/img_32.1.png', alt: 'APU 3' },
								{ src: '/images/turbofan-module3/img_32.2.png', alt: 'APU 4' }
							]}
							columns={2}
							height="260px"
						/>
					</div>
				</section>
			{/if}

			<!-- Bottom Navigation (Engine Sections) -->
			<div
				class="fixed right-0 bottom-16 left-0 z-40 border-t border-white/20 bg-black/90 p-4 backdrop-blur-md md:static md:mt-12 md:bg-transparent md:p-0 md:pt-6 md:backdrop-blur-none"
			>
				<div class="mx-auto grid max-w-7xl grid-cols-[1fr_auto_1fr] items-center gap-4">
					<button
						onclick={prevPageSections}
						class="group flex items-center gap-2 justify-self-start rounded-xl border-2 border-[#B34700]/30 bg-white/90 px-4 py-3 font-bold text-[#1b3558] backdrop-blur-md transition-all hover:-translate-y-1 hover:border-[#B34700] hover:shadow-lg md:px-6"
					>
						<span class="text-xl text-[#B34700]">←</span>
						<span class="hidden font-bold text-[#0A1628] md:inline"
							>{currentPageSections === 1 ? 'Previous: Overview' : 'Previous'}</span
						>
					</button>

					<div class="flex items-center gap-2">
						{#each Array(totalPagesSections) as _, i}
							<button
								class="flex h-10 w-10 items-center justify-center rounded-full font-bold transition-all {currentPageSections ===
								i + 1
									? 'scale-110 bg-[#B34700] text-white'
									: 'bg-[#1b3558] text-white hover:bg-[#1b3558]/80'}"
								onclick={() => goToPageSections(i + 1)}
								aria-label="Go to page {i + 1}"
							>
								{i + 1}
							</button>
						{/each}
					</div>

					<button
						onclick={nextPageSections}
						class="group flex items-center gap-2 justify-self-end rounded-xl border-2 border-[#B34700]/30 bg-white/90 px-4 py-3 font-bold text-[#1b3558] backdrop-blur-md transition-all hover:-translate-y-1 hover:border-[#B34700] hover:shadow-lg md:px-6"
					>
						<span class="hidden font-bold text-[#0A1628] md:inline"
							>{currentPageSections === totalPagesSections
								? 'Next: Overhaul Station'
								: 'Next'}</span
						>
						<span class="text-xl text-[#B34700]">→</span>
					</button>
				</div>
			</div>
		</div>
	{/if}
</div>

<style>
	:global(body) {
		overflow-x: hidden;
		margin: 0;
		padding: 0;
		background: transparent;
		color: var(--font-secondary);
		color: var(--font-primary, #e8f4fa);
		font-family: var(--font-body), 'Open Sans', sans-serif;
	}
</style>
