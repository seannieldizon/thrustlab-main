<script lang="ts">
	import { page } from '$app/stores';
	import type { User } from '@supabase/supabase-js';
	import { slide, fade } from 'svelte/transition';
	import { isChatOpen } from '$lib/stores/chatStore';

	export let user: User | null = null;

	let isSectionsOpen = false;

	function toggleSections() {
		isSectionsOpen = !isSectionsOpen;
	}

	function closeSections() {
		isSectionsOpen = false;
		isAccountOpen = false;
	}

	function toggleJaja() {
		$isChatOpen = !$isChatOpen;
		closeSections();
	}

	let isAccountOpen = false;
	function toggleAccount() {
		isAccountOpen = !isAccountOpen;
		if (isAccountOpen) isSectionsOpen = false;
	}
	function closeAccount() {
		isAccountOpen = false;
	}

	$: isCurrent = (path: string) => $page.url.pathname === path;
</script>

<!-- Bottom Navigation Bar -->
<div
	class="fixed right-0 bottom-0 left-0 z-50 border-t border-white/20 bg-slate-900/90 shadow-lg backdrop-blur-xl md:hidden"
>
	<div class="flex h-16 items-center justify-around">
		<!-- Home -->
		<a
			href="/"
			title="Go to Home"
			class="flex h-full w-full flex-col items-center justify-center transition-colors {isCurrent(
				'/'
			)
				? 'text-cyan-300'
				: 'text-slate-300'} drop-shadow-md hover:text-cyan-300"
			on:click={closeSections}
		>
			<svg class="mb-1 h-6 w-6 drop-shadow-sm" fill="currentColor" viewBox="0 0 24 24">
				<path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z" />
			</svg>
			<span class="text-xs font-bold drop-shadow-sm">Home</span>
		</a>

		<!-- Sections (Menu Trigger) -->
		<button
			title="Open Sections Menu"
			class="flex h-full w-full flex-col items-center justify-center transition-colors {isSectionsOpen
				? 'text-cyan-300'
				: 'text-slate-300'} drop-shadow-md hover:text-cyan-300"
			on:click={toggleSections}
		>
			<svg class="mb-1 h-6 w-6 drop-shadow-sm" fill="currentColor" viewBox="0 0 24 24">
				<path
					d="M3 13h2v-2H3v2zm0 4h2v-2H3v2zm0-8h2V7H3v2zm4 4h14v-2H7v2zm0 4h14v-2H7v2zM7 7v2h14V7H7z"
				/>
			</svg>
			<span class="text-xs font-bold drop-shadow-sm">Sections</span>
		</button>

		<!-- Ask Jaja -->
		<button
			title="Ask Jaja"
			class="flex h-full w-full flex-col items-center justify-center transition-colors {$isChatOpen
				? 'text-cyan-300'
				: 'text-slate-300'} drop-shadow-md hover:text-cyan-300"
			on:click={toggleJaja}
		>
			<img
				src="/icons/jaja.png"
				alt="Ask Jaja"
				class="mb-1 h-6 w-6 object-contain drop-shadow-sm"
			/>
			<span class="text-xs font-bold drop-shadow-sm">Ask Jaja</span>
		</button>

		<!-- Dashboard (Conditional) -->
		{#if user}
			<a
				href="/dashboard"
				title="Go to Dashboard"
				class="flex h-full w-full flex-col items-center justify-center transition-colors {isCurrent(
					'/dashboard'
				)
					? 'text-cyan-300'
					: 'text-slate-300'} drop-shadow-md hover:text-cyan-300"
				on:click={closeSections}
			>
				<svg
					class="mb-1 h-6 w-6 drop-shadow-sm"
					fill="none"
					viewBox="0 0 24 24"
					stroke="currentColor"
				>
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="2"
						d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"
					/>
				</svg>
				<span class="text-xs font-bold drop-shadow-sm">Dashboard</span>
			</a>
		{/if}

		<!-- Account (Link to Profile or Drawer Trigger) -->
		{#if user}
			<a
				href="/profile"
				title="View Profile"
				class="flex h-full w-full flex-col items-center justify-center transition-colors {isCurrent(
					'/profile'
				)
					? 'text-cyan-300'
					: 'text-slate-300'} drop-shadow-md hover:text-cyan-300"
				on:click={closeSections}
			>
				<svg class="mb-1 h-6 w-6 drop-shadow-sm" fill="currentColor" viewBox="0 0 24 24">
					<path
						d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"
					/>
				</svg>
				<span class="text-xs font-bold drop-shadow-sm">Account</span>
			</a>
		{:else}
			<button
				title="Open Account Menu"
				class="flex h-full w-full flex-col items-center justify-center transition-colors {isAccountOpen
					? 'text-cyan-300'
					: 'text-slate-300'} drop-shadow-md hover:text-cyan-300"
				on:click={toggleAccount}
			>
				<svg class="mb-1 h-6 w-6 drop-shadow-sm" fill="currentColor" viewBox="0 0 24 24">
					<path
						d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"
					/>
				</svg>
				<span class="text-xs font-bold drop-shadow-sm">Account</span>
			</button>
		{/if}
	</div>
</div>

<!-- Sections Drawer (Overlay) -->
{#if isSectionsOpen}
	<div
		class="fixed inset-0 z-40 bg-black/50 md:hidden"
		on:click={closeSections}
		on:keydown={(e) => e.key === 'Escape' && closeSections()}
		role="button"
		tabindex="0"
		aria-label="Close menu"
		transition:fade={{ duration: 200 }}
	></div>
	<div
		class="pb-safe fixed right-0 bottom-16 left-0 z-50 overflow-hidden rounded-t-2xl bg-white shadow-xl md:hidden"
		transition:slide={{ axis: 'y', duration: 300 }}
	>
		<div class="flex items-center justify-between border-b border-gray-100 bg-gray-50 p-4">
			<h3 class="font-bold text-gray-800">Sections</h3>
			<button
				on:click={closeSections}
				class="text-gray-500 hover:text-gray-700"
				aria-label="Close Sections"
			>
				<svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="2"
						d="M6 18L18 6M6 6l12 12"
					/>
				</svg>
			</button>
		</div>
		<div class="grid grid-cols-1 gap-1 p-2">
			<a
				href="/hangar-zone"
				title="Go to Hangar Zone"
				class="group flex items-center rounded-lg p-4 hover:bg-gray-50"
				on:click={closeSections}
			>
				<div
					class="mr-4 rounded-lg bg-blue-100 p-2 text-blue-600 transition-colors group-hover:bg-blue-200"
				>
					<img src="/icons/hangar-zone.png" class="h-6 w-6" alt="Hangar" />
				</div>
				<div>
					<span class="block font-semibold text-gray-800">Hangar Zone</span>
					<span class="text-xs text-gray-500">Explore aircraft components</span>
				</div>
			</a>
			<a
				href="/turbofan-engine"
				title="Go to Turbofan Engine"
				class="group flex items-center rounded-lg p-4 hover:bg-gray-50"
				on:click={closeSections}
			>
				<div
					class="mr-4 rounded-lg bg-indigo-100 p-2 text-indigo-600 transition-colors group-hover:bg-indigo-200"
				>
					<img src="/icons/turbofan-engine.png" class="h-6 w-6" alt="Engine" />
				</div>
				<div>
					<span class="block font-semibold text-gray-800">Turbofan Engine</span>
					<span class="text-xs text-gray-500">Deep dive into mechanics</span>
				</div>
			</a>
			<a
				href="/overhaul-station"
				title="Go to Overhaul Station"
				class="group flex items-center rounded-lg p-4 hover:bg-gray-50"
				on:click={closeSections}
			>
				<div
					class="mr-4 rounded-lg bg-orange-100 p-2 text-orange-600 transition-colors group-hover:bg-orange-200"
				>
					<img src="/icons/overhaul-station.png" class="h-6 w-6" alt="Overhaul" />
				</div>
				<div>
					<span class="block font-semibold text-gray-800">Overhaul Station</span>
					<span class="text-xs text-gray-500">Maintenance & Repair</span>
				</div>
			</a>
			{#if user}
				<a
					href="/test-bay"
					title="Go to Test Bay"
					class="group flex items-center rounded-lg p-4 hover:bg-gray-50"
					on:click={closeSections}
				>
					<div
						class="mr-4 rounded-lg bg-sky-100 p-2 text-sky-600 transition-colors group-hover:bg-sky-200"
					>
						<img src="/icons/test-bay.png" class="h-6 w-6" alt="Test Bay" />
					</div>
					<div>
						<span class="block font-semibold text-gray-800">Test Bay</span>
						<span class="text-xs text-gray-500">Experimental Testing</span>
					</div>
				</a>
			{/if}
		</div>
	</div>
{/if}

<!-- Account Drawer (Overlay) -->
{#if isAccountOpen}
	<div
		class="fixed inset-0 z-40 bg-black/50 md:hidden"
		on:click={closeAccount}
		on:keydown={(e) => e.key === 'Escape' && closeAccount()}
		role="button"
		tabindex="0"
		aria-label="Close menu"
		transition:fade={{ duration: 200 }}
	></div>
	<div
		class="pb-safe fixed right-0 bottom-16 left-0 z-50 overflow-hidden rounded-t-2xl bg-white shadow-xl md:hidden"
		transition:slide={{ axis: 'y', duration: 300 }}
	>
		<div class="flex items-center justify-between border-b border-gray-100 bg-gray-50 p-4">
			<h3 class="font-bold text-gray-800">Account</h3>
			<button
				on:click={closeAccount}
				class="text-gray-500 hover:text-gray-700"
				aria-label="Close Account"
			>
				<svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="2"
						d="M6 18L18 6M6 6l12 12"
					/>
				</svg>
			</button>
		</div>
		<div class="grid grid-cols-1 gap-1 p-2">
			{#if user}
				<!-- Logged In State -->
				<a
					href="/dashboard"
					title="Go to Dashboard"
					class="group flex items-center rounded-lg p-4 hover:bg-gray-50"
					on:click={closeAccount}
				>
					<div
						class="mr-4 rounded-lg bg-teal-100 p-2 text-teal-600 transition-colors group-hover:bg-teal-200"
					>
						<svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"
							/>
						</svg>
					</div>
					<div>
						<span class="block font-semibold text-gray-800">Dashboard</span>
						<span class="text-xs text-gray-500">Overview & Stats</span>
					</div>
				</a>
				<a
					href="/profile"
					title="View your profile"
					class="group flex items-center rounded-lg p-4 hover:bg-gray-50"
					on:click={closeAccount}
				>
					<div
						class="mr-4 rounded-lg bg-purple-100 p-2 text-purple-600 transition-colors group-hover:bg-purple-200"
					>
						<svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
							/>
						</svg>
					</div>
					<div>
						<span class="block font-semibold text-gray-800">Profile</span>
						<span class="text-xs text-gray-500">Settings & Security</span>
					</div>
				</a>
				<form action="/login?/logout" method="POST" class="w-full">
					<button
						type="submit"
						title="Sign out"
						class="group flex w-full items-center rounded-lg p-4 text-left hover:bg-gray-50"
						on:click={closeAccount}
					>
						<div
							class="mr-4 rounded-lg bg-red-100 p-2 text-red-600 transition-colors group-hover:bg-red-200"
						>
							<svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
								<path
									stroke-linecap="round"
									stroke-linejoin="round"
									stroke-width="2"
									d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
								/>
							</svg>
						</div>
						<div>
							<span class="block font-semibold text-gray-800">Logout</span>
							<span class="text-xs text-gray-500">Sign out of session</span>
						</div>
					</button>
				</form>
			{:else}
				<!-- Logged Out State -->
				<a
					href="/login"
					title="Log in"
					class="group flex items-center rounded-lg p-4 hover:bg-gray-50"
					on:click={closeAccount}
				>
					<div
						class="mr-4 rounded-lg bg-green-100 p-2 text-green-600 transition-colors group-hover:bg-green-200"
					>
						<svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"
							/>
						</svg>
					</div>
					<div>
						<span class="block font-semibold text-gray-800">Login</span>
						<span class="text-xs text-gray-500">Access your account</span>
					</div>
				</a>
				<a
					href="/sign-up"
					title="Create Account"
					class="group flex items-center rounded-lg p-4 hover:bg-gray-50"
					on:click={closeAccount}
				>
					<div
						class="mr-4 rounded-lg bg-cyan-100 p-2 text-cyan-600 transition-colors group-hover:bg-cyan-200"
					>
						<svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"
							/>
						</svg>
					</div>
					<div>
						<span class="block font-semibold text-gray-800">Sign Up</span>
						<span class="text-xs text-gray-500">Create a new account</span>
					</div>
				</a>
			{/if}
		</div>
	</div>
{/if}
