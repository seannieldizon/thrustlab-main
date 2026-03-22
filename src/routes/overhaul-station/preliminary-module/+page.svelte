<script lang="ts">
	import { goto } from '$app/navigation';
	import { onMount } from 'svelte';
	import { page } from '$app/stores';
	import { fade, fly } from 'svelte/transition';
	import ImageModal from '$lib/components/ui/ImageModal.svelte';
	import ImageGrid from '$lib/components/ui/ImageGrid.svelte';
	import SectionHeader from '$lib/components/ui/SectionHeader.svelte';
	import { searchQuery, showSearchModal, performSearch } from '$lib/stores/searchStore';
	import { MODULE_CONTENT } from '$lib/data/searchContent';
	import SearchModal from '$lib/components/SearchModal.svelte';

	let totalPages = 3;
	$: currentPage = parseInt($page.url.searchParams.get('page') || '1');

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
			goto(`/overhaul-station/preliminary-module?page=${pageNum}`);
			scrollToTop();
		}
	}

	function nextPage() {
		if (currentPage < totalPages) {
			goToPage(currentPage + 1);
		} else {
			goto('/overhaul-station/assembly-disassembly');
		}
	}

	function prevPage() {
		if (currentPage > 1) {
			goToPage(currentPage - 1);
		} else {
			goto('/overhaul-station');
		}
	}

	function handleKeydown(event: KeyboardEvent) {
		if (event.key === 'ArrowLeft') {
			prevPage();
		} else if (event.key === 'ArrowRight') {
			nextPage();
		} else if (event.key === 'Enter') {
			handleSearch();
		}
	}

	onMount(() => {
		document.body.classList.add('zone-overhaul');
		return () => document.body.classList.remove('zone-overhaul');
	});
</script>

<svelte:window on:keydown={handleKeydown} />

<!-- Page Container -->
<div
	class="relative z-10 mx-auto min-h-screen max-w-7xl px-4 pt-32 pb-24 md:px-8 md:pt-40 md:pb-16"
>
	<ImageModal />
	<SearchModal />

	<!-- Header Section -->
	<div class="mb-12 flex flex-col items-center gap-6">
		<h1
			class="animate-gradient-flash gradient-animated font-heading text-center text-5xl font-black tracking-tight drop-shadow-lg md:text-6xl"
			style="--active-gradient: linear-gradient(90deg, #0ea5e9 0%, #e0f7fa 50%, #0ea5e9 100%); filter: drop-shadow(0 2px 4px rgba(0,0,0,0.8)) drop-shadow(0 4px 15px rgba(14,165,233,0.6));"
		>
			PRELIMINARY LABORATORY MODULE:<br class="hidden md:block" /> GAS TURBINE ENGINE OVERHAUL
		</h1>

		<!-- Search Bar -->
		<div
			class="mx-auto flex w-full max-w-md min-w-[300px] items-center gap-4 rounded-full border-2 border-[#0ea5e9]/30 bg-white/95 px-4 py-2 shadow-sm backdrop-blur-md transition-all focus-within:border-[#0ea5e9] focus-within:shadow-[0_0_20px_rgba(14,165,233,0.3)]"
		>
			<input
				type="text"
				placeholder="Search modules..."
				bind:value={$searchQuery}
				onkeydown={(e) => e.key === 'Enter' && handleSearch()}
				class="flex-1 bg-transparent text-base text-[#0A1628] placeholder-[#0A1628]/50 outline-none"
			/>
			<button
				onclick={handleSearch}
				class="flex items-center justify-center p-1 text-[#0ea5e9] transition-colors hover:text-[#00CED1]"
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
	<div class="mb-16 flex flex-col gap-12">
		<!-- Page 1: Introduction -->
		{#if currentPage === 1}
			<div in:fly={{ y: 20, duration: 400, delay: 200 }} out:fade={{ duration: 200 }}>
				<section class="opacity-100">
					<SectionHeader title="Gas Turbine Engine Overhaul" color="#0ea5e9" />
					<div
						class="relative z-[1] min-h-[300px] rounded-tr-3xl rounded-b-3xl border-[5px] border-[#0ea5e9] bg-white p-6 text-[#1a2b47] md:p-8"
					>
						<div class="mb-6 leading-loose">
							<p class="mb-6 pr-4 text-justify text-lg leading-loose text-[#2c3e50]">
								It is most important that the cost of maintaining an engine in service is considered
								at the design stage. All aspects of engine repairability are also considered, both
								to reduce the requirement for overhaul or repair and to avoid, where possible,
								designs which make repairs difficult to effect. Engine construction must allow the
								operator to complete the overhaul or repair work as quickly and cheaply as possible.
							</p>

							<p class="mb-6 pr-4 text-justify text-lg leading-loose text-[#2c3e50]">
								In service, the engine is inspected at routine periods based on manufacturers'
								recommendations and agreed between the operator and the relevant airworthiness
								authority. In the past, most engines had specified numbers of hours they could
								operate before they needed to be overhauled. This period became known as the <strong
									>time between overhauls (TBO)</strong
								>. The length of time between overhauls varies widely with different types of
								engines. When a new type of engine enters service, its TBO is fairly short, but as
								condition monitoring, the engine's service record, and inspections prove the engine
								to be reliable, the TBO is generally extended. Many engines have proven to be so
								reliable that they are overhauled only when they need major maintenance. This
								concept is a form of "on condition" maintenance or overhaul.
							</p>

							<p class="mb-6 pr-4 text-justify text-lg leading-loose text-[#2c3e50]">
								<b>Modular construction</b> is a concept that treats an engine as a set of separate modules
								assembled together. The inspection, line maintenance, and overhaul requirements of each
								module can be addressed separately. The modular concept reduces down time and expense
								for operators because maintenance and overhaul activities are spread over a longer period
								of time. In most cases, replacement of a module is considered to be a minor repair, requiring
								no FAA Form 337. On the other hand, a form 337 is required for the overhaul of an engine
								module since it is considered a major repair.
							</p>

							<p class="mb-6 pr-4 text-justify text-lg leading-loose text-[#2c3e50]">
								The length of time between overhauls varies considerably between different engine
								types, being established as a result of discussions between the operator, the
								airworthiness authority and the manufacturer, when such considerations as the total
								experience gained with the particular engine series, the type of operation, the
								utilization, and sometimes climatic conditions, are taken into account. In improving
								the overhaul period the airworthiness authority may take into consideration the
								background of the operator, his servicing facilities and the experience of his
								maintenance personnel.
							</p>

							<!-- YouTube Video -->
							<div class="relative my-8 aspect-video w-full overflow-hidden rounded-xl shadow-lg">
								<iframe
									src="https://www.youtube.com/embed/hQri0heCepA"
									title="Gas Turbine Engine Overhaul"
									class="absolute top-0 left-0 h-full w-full border-0"
									allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
									allowfullscreen
								></iframe>
							</div>
						</div>
					</div>
				</section>
			</div>
		{/if}

		<!-- Page 2: Overhaul Procedures -->
		{#if currentPage === 2}
			<div in:fly={{ y: 20, duration: 400, delay: 200 }} out:fade={{ duration: 200 }}>
				<section class="opacity-100">
					<SectionHeader title="Overhaul Procedures" color="#0ea5e9" />
					<div
						class="relative z-[1] min-h-[300px] rounded-tr-3xl rounded-b-3xl border-[5px] border-[#0ea5e9] bg-white p-6 text-[#1a2b47] md:p-8"
					>
						<div class="mb-6 leading-loose">
							<p class="mb-6 pr-4 text-justify text-lg leading-loose text-[#2c3e50]">
								Turbine engines are overhauled by the manufacturer or an approved overhaul facility.
								One reason for this is that there are several specialized tools required during the
								disassembly, inspection, and reassembly of turbine engines. The process is similar
								in many ways to the overhaul of piston engines; however, there are processes
								required which are not necessary for piston engines. In addition, an overhaul
								facility for gas-turbine engines requires many special tools and some equipment
								specially designed for work on particular types and models of engines.
							</p>

							<h3
								class="font-heading mt-8 mb-4 border-b-2 border-blue-200 pb-2 text-xl font-bold text-[#0A2F35]"
							>
								DISASSEMBLY
							</h3>
							<p class="mb-6 pr-4 text-justify text-lg leading-loose text-[#2c3e50]">
								The engine can be disassembled in the vertical or horizontal position. When it is
								disassembled in the vertical position, the engine is mounted, usually front end
								downward, on a floor fixture. To enable it to be disassembled horizontally, the
								engine is mounted in a special turnover stand. The engine is disassembled into main
								subassemblies or modules, which are fitted in separate stands and sent to other
								areas where they are further disassembled into individual parts. The individual
								parts are taken to a cleaning area in preparation for inspection.
							</p>

							<h3
								class="font-heading mt-8 mb-4 border-b-2 border-blue-200 pb-2 text-xl font-bold text-[#0A2F35]"
							>
								CLEANING
							</h3>
							<p class="mb-6 pr-4 text-justify text-lg leading-loose text-[#2c3e50]">
								Once disassembled, each engine component is cleaned so flaws and defects can be more
								easily detected. In addition, cleaning is required so that oxide deposits and dirt
								can be removed from a serviceable part to prepare it for special applications such
								as plating, anodizing, or painting before it is placed back in service. All engine
								components are cleaned using approved cleaning methods and agents to prevent
								unintentional damage. For example, some cleaning solutions may strip plating from a
								part or cause a reaction with a base metal. As another example, you should refrain
								from cleaning titanium components with trichlorethylene. The reason for this is that
								entrapped traces of trichlorethylene can cause corrosion. Some commonly used
								cleaning methods include washing with organic solvents, vapor degreasing, steam
								cleaning, and tumbling in a grit solution. An effective cleaning method for hot
								section components consists of a series of controlled acid or alkali baths and water
								rinses. Grit blasting may also be useful on either cold or hot section components.
							</p>

							<p class="mb-6 pr-4 text-justify text-lg leading-loose text-[#2c3e50]">
								The cleaning agents used during overhaul range from organic solvents to acid and
								other chemical cleaners, and extend to electrolytic cleaning solutions. Organic
								solvents include kerosine for washing, trichloroethane for degreasing and paint
								stripping solutions which can generally be used on the majority of components for
								carbon and paint removal. The more restricted and sometimes rigidly controlled acid
								and other chemical cleaners are used for corrosion, heat scale and carbon removal
								from certain components. To give the highest degree of cleanliness to achieve the
								integrity of inspection that is considered necessary on certain major rotating
								parts, such as turbine discs, electrolytic cleaning solutions are often used.
								Aircraft which operate at high altitudes can become contaminated with radio-active
								particles held in the atmosphere, this radio-activity is retained in the dirt and
								carbon deposits in the engine. If contamination is suspected the radio-activity
								level of the engine must be determined to ensure the limitations agreed by the
								health authorities are not exceeded, Evidence of contamination will entail
								additional cleaning in a designated region, separate from the overhaul area, to
								safeguard the health of personnel in the workshop. Arrangements have to be made with
								the health authorities for disposal of the waste radio-active cleaning material.
							</p>

							<h3
								class="font-heading mt-8 mb-4 border-b-2 border-blue-200 pb-2 text-xl font-bold text-[#0A2F35]"
							>
								INSPECTION
							</h3>
							<ImageGrid
								images={[
									{
										src: '/images/overhaul-preliminary/img_1.png',
										alt: 'Typical overhaul workshop layout'
									}
								]}
								columns={1}
								height="320px"
							/>
							<p class="mb-6 pr-4 text-justify text-lg leading-loose text-[#2c3e50]">
								After cleaning, and prior to inspection, the surfaces of some parts, e.g. turbine
								discs, are etched. This process removes a small amount of material from the surface
								of the part, leaving an even matt finish which reveals surface defects that cannot
								normally be seen with the naked eye. The metal removal is normally achieved either
								by an electrolytic process in which the part forms the anode, or by immersing the
								part for a short time in a special acid bath. Both methods must be carefully
								controlled to avoid the removal of too much material.
							</p>

							<p class="mb-6 pr-4 text-justify text-lg leading-loose text-[#2c3e50]">
								After the components have been cleaned they are visually and, when necessary,
								dimensionally inspected to establish general condition and then subjected to crack
								inspection. This may include binocular and magnetic or penetrant inspection
								techniques, used either alone or consecutively, depending on the components being
								inspected and the degree of inspection considered necessary.
							</p>

							<h3
								class="font-heading mt-8 mb-4 border-b-2 border-blue-200 pb-2 text-xl font-bold text-[#0A2F35]"
							>
								REPAIRS
							</h3>
							<p class="mb-6 pr-4 text-justify text-lg leading-loose text-[#2c3e50]">
								To ensure that costs are maintained at the lowest possible level, a wide variety of
								techniques are used to repair engine parts to make them suitable for further
								service. Welding, the fitting of interference sleeves or liners, machining and
								electro-plating are some of the techniques employed during repair. The welding
								techniques detailed are extensively used and range from welding of cracks by inert
								gas welding to the renewing of sections of flame tubes and jet pipes by electric
								resistance welding.
							</p>

							<p class="mb-6 pr-4 text-justify text-lg leading-loose text-[#2c3e50]">
								On some materials now being used for gas turbine engine parts, different techniques
								may have to be employed. An example of this is the high strength titanium alloys
								which suffer from brittle welds if they are allowed to become contaminated by oxygen
								during the cooling period. Parts made in these alloys, which have to withstand high
								stress loadings in service, are often welded in a bag or plastic dome that is purged
								by an inert gas before welding commences.
							</p>

							<p class="mb-6 pr-4 text-justify text-lg leading-loose text-[#2c3e50]">
								More advanced materials and constructions may have to be welded by electron-beam
								welding. This method not only enables dissimilar metals to be welded, but also
								complete sections of the more advanced fabricated constructions, e.g. a section of a
								fabricated rotor drum, to be replaced at a low percentage cost of a new drum. Some
								repair methods, such as welding, may affect the properties of the materials and, to
								restore the materials to a satisfactory condition, it may be necessary to heat treat
								the parts to remove the stresses, reduce the hardness of the weld area or restore
								the strength of the material in the heat affected area, Heat treatment techniques
								are also used for removing distortions after welding. The parts are heated to a
								temperature sufficient to remove the stresses and, during the heat treatment
								process, fixtures are often used to ensure the parts maintain their correct
								configuration.
							</p>

							<p class="mb-6 pr-4 text-justify text-lg leading-loose text-[#2c3e50]">
								Electro-plating methods are also widely used for repair purposes and these range
								from chromium plating, which can be used to provide a very hard surface, to thin
								coatings of copper or silver plating, which can be applied to such areas as bearing
								locations on a shaft to restore a fitting diameter that is only slightly worn. Many
								repairs are effected by machining diameters and/or faces to undersize dimensions or
								bores to oversize dimensions and then fitting shims, liners or metal spraying
								coatings of wear resistant material. The effected surfaces are then restored to
								their original dimensions by machining or grinding.
							</p>
						</div>
					</div>
				</section>
			</div>
		{/if}

		<!-- Page 3: Balancing, Assembly, Testing -->
		{#if currentPage === 3}
			<div in:fly={{ y: 20, duration: 400, delay: 200 }} out:fade={{ duration: 200 }}>
				<section class="opacity-100">
					<SectionHeader title="Balancing, Assembly & Testing" color="#0ea5e9" />
					<div
						class="relative z-[1] min-h-[300px] rounded-tr-3xl rounded-b-3xl border-[5px] border-[#0ea5e9] bg-white p-6 text-[#1a2b47] md:p-8"
					>
						<div class="mb-6 leading-loose">
							<h3
								class="font-heading mt-8 mb-4 border-b-2 border-blue-200 pb-2 text-xl font-bold text-[#0A2F35]"
							>
								BALANCING
							</h3>
							<ImageGrid
								images={[
									{
										src: '/images/overhaul-preliminary/img_2.png',
										alt: 'Dynamic balancing diagram'
									}
								]}
								columns={1}
								height="320px"
							/>
							<p class="mb-6 pr-4 text-justify text-lg leading-loose text-[#2c3e50]">
								Because of the high rotational speeds, any unbalance in the main rotating assembly
								of a gas turbine engine is capable of producing vibration and stresses which
								increase as the square of the rotational speed. Therefore very accurate balancing of
								the rotating assembly is necessary. The two main methods of measuring and correcting
								unbalance are single plane (static) balancing and two plane (dynamic) balancing.
								With single plane, the unbalance is only in one plane i.e., centrally through the
								component at 90 degrees to the axis. This is appropriate for components such as
								individual compressor or turbine discs. For compressor and/or turbine rotor
								assemblies possessing appreciable axial length, unbalance may be present at many
								positions along the axis. In general it is not possible to correct this combination
								of distributed unbalance in a single plane. However, if two correction planes are
								chosen, usually at axially opposed ends of the assembly, it is always possible to
								find a combination of two unbalance weights which are equivalent for the unbalances
								present in the assembled rotor, hence two plane balancing.
							</p>

							<p class="mb-6 pr-4 text-justify text-lg leading-loose text-[#2c3e50]">
								The distribution of unbalance in the rotor has been reduced to an equivalent system
								of two unbalances 'A' and 'B'. The rotor is already in static balance because in
								this example 'A' and 'B' are equal and opposed. However, when the part is rotating,
								each weight produces its own centrifugal force in opposition to the other causing
								unbalance couples, with the tendency to turn the part end-over-end. This action is
								restricted by the bearings, with resultant stresses and vibration. It will be seen,
								therefore, that to bring the part to a state of dynamic balance, an equal amount of
								weight must be removed at 'A' and 'B' or added at 'P' and 'O'. When the couples set
								up by the centrifugal forces are equal, it is said that a part is dynamically
								balanced. Unbalance is expressed in units of ounce-inches, thus one ounce of excess
								weight displaced two inches from the axis of a rotor is two ounce inches of
								unbalance.
							</p>

							<ImageGrid
								images={[
									{
										src: '/images/overhaul-preliminary/img_3.png',
										alt: 'Dynamic balancing machine'
									}
								]}
								columns={1}
								height="320px"
							/>
							<p class="mb-6 pr-4 text-justify text-lg leading-loose text-[#2c3e50]">
								A typical dynamic balancing machine for indicating the magnitude and angular
								position of unbalance in each plane is shown below. Correction of unbalance may be
								achieved by one or a combination of the following basic methods; redistribution of
								weight, addition of weight and removal of weight.
							</p>

							<h3
								class="font-heading mt-8 mb-4 border-b-2 border-blue-200 pb-2 text-xl font-bold text-[#0A2F35]"
							>
								ASSEMBLING
							</h3>
							<ImageGrid
								images={[{ src: '/images/overhaul-preliminary/img_4.png', alt: 'Engine assembly' }]}
								columns={1}
								height="320px"
							/>
							<p class="mb-6 pr-4 text-justify text-lg leading-loose text-[#2c3e50]">
								The engine can be built in the vertical or horizontal position, using a ram or
								stand. Assembling of the engine sub-assemblies or modules is done in separate areas,
								thus minimizing the build time on the build rams or stands.
							</p>

							<p class="mb-6 pr-4 text-justify text-lg leading-loose text-[#2c3e50]">
								During assembling, inspection checks are made. These checks can establish dimensions
								to enable axial and radial clearances to be calculated and adjustments to be made,
								or they can ascertain that vital fitting operations have been correctly effected.
								Dimensional checks are effected during disassembly to establish datums which must be
								repeated on subsequent re-assembly. To ensure that the nuts, bolts and setscrews
								throughout the engine and its accessories are uniformly tight, controlled torque
								tightening is applied, the torque loading figure is determined by the thread
								diameter and the differing coefficients of friction allied with thread finish i.e.,
								silver or cadmium plating and the lubricant used.
							</p>

							<h3
								class="font-heading mt-8 mb-4 border-b-2 border-blue-200 pb-2 text-xl font-bold text-[#0A2F35]"
							>
								TESTING
							</h3>
							<ImageGrid
								images={[{ src: '/images/overhaul-preliminary/img_5.png', alt: 'Engine testing' }]}
								columns={1}
								height="320px"
							/>
							<p class="mb-6 pr-4 text-justify text-lg leading-loose text-[#2c3e50]">
								On completion of assembly, every production and/or overhauled engine must be tested
								in a 'sea level' test cell i.e. a test cell in which the engine is run at ambient
								temperature and pressure conditions, the resultant performance figures being
								corrected to International Standard Atmosphere (I.S.A.) sea-level conditions. To
								ensure that the engine performance meets that guaranteed to the customer and the
								requirements of the Government licensing and purchasing authorities, each engine is
								tested to an acceptance test schedule.
							</p>
						</div>
					</div>
				</section>
			</div>
		{/if}
	</div>

	<!-- Bottom Navigation (Sticky) -->
	<div
		class="fixed right-0 bottom-16 left-0 z-40 border-t border-white/20 bg-black/90 p-4 backdrop-blur-md transition-all duration-300 md:static md:mt-12 md:bg-transparent md:p-0 md:pt-6 md:backdrop-blur-none"
	>
		<div class="mx-auto grid max-w-7xl grid-cols-[1fr_auto_1fr] items-center gap-4">
			<button
				onclick={prevPage}
				class="group flex items-center gap-2 justify-self-start rounded-xl border-2 border-[#0ea5e9]/30 bg-white/90 px-4 py-3 font-bold text-[#1b3558] backdrop-blur-md transition-all hover:-translate-y-1 hover:border-[#0ea5e9] hover:shadow-lg md:px-6"
			>
				<span class="text-xl text-[#0ea5e9]">←</span>
				<span class="hidden font-bold text-[#0A1628] md:inline"
					>{currentPage === 1 ? 'Previous: Overhaul Station' : 'Previous'}</span
				>
			</button>

			<div class="flex items-center gap-2">
				{#each Array(totalPages) as _, i}
					<button
						class="flex h-10 w-10 items-center justify-center rounded-full font-bold transition-all {currentPage ===
						i + 1
							? 'scale-110 bg-[#0ea5e9] text-white'
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
				class="group flex items-center gap-2 justify-self-end rounded-xl border-2 border-[#0ea5e9]/30 bg-white/90 px-4 py-3 font-bold text-[#1b3558] backdrop-blur-md transition-all hover:-translate-y-1 hover:border-[#0ea5e9] hover:shadow-lg md:px-6"
			>
				<span class="hidden font-bold text-[#0A1628] md:inline"
					>{currentPage === totalPages ? 'Next: Assembly & Disassembly' : 'Next'}</span
				>
				<span class="text-xl text-[#0ea5e9]">→</span>
			</button>
		</div>
	</div>
</div>
