<script lang="ts">
	import type { PageData, ActionData } from './$types';
	import { enhance } from '$app/forms';
	import { onMount } from 'svelte';
	import SkyBackground from '$lib/components/ui/SkyBackground.svelte';
	import { fade, slide, scale } from 'svelte/transition';

	let { data, form } = $props<{ data: PageData; form: ActionData }>();

	// --- State ---
	let selectedTab = $state('account');
	let mobileView = $state('menu'); // 'menu' | 'details' | 'history' | 'security'
	let user = $derived(data.user);
	// Mobile Profile Edit State
	let firstName = $state('');
	let lastName = $state('');

	$effect(() => {
		const full =
			data.profile?.fullName ||
			(data.user?.user_metadata?.first_name
				? data.user.user_metadata.first_name + ' ' + (data.user.user_metadata?.last_name || '')
				: '');
		const parts = full.split(' ');
		// Only update if empty (initial load) or strict sync needed.
		// For now, simple sync.
		if (full) {
			firstName = parts[0] || '';
			lastName = parts.slice(1).join(' ') || '';
		}
	});
	let isSaving = $state(false);

	async function updateProfile() {
		isSaving = true;
		const formData = new FormData();
		formData.append('fullName', `${firstName} ${lastName}`.trim());
		formData.append('username', data.profile?.username || ''); // Keep existing username

		try {
			// Re-use the form action via fetch or similar if needed,
			// but for now let's just simulate or call the action endpoint manually if we weren't using use:enhance on a form.
			// Since the mobile UI uses a button outside a form (or we can wrap it), let's wrap it in a form for consistency OR just use the helper.
			// For this fix, let's just keep it simple: we submit the main desktop form via JS?
			// Actually, best to replicate the form submission logic or share it.
			// IMPROVEMENT: Bind these mobile inputs to the same hidden form fields or duplicate the form.
			// For now, let's just alert as placeholder or submit a hidden form.
			// Real fix: Just submit the form programmatically.
			const form = document.querySelector('form[action="?/updateProfile"]') as HTMLFormElement;
			if (form) {
				// Update the inputs in that form? Or just create a new FormData and submit via fetch.
				// Let's rely on standard form submission for now to avoid complex logic rewrite.
				// We will just create a hidden form for mobile submission.
				const mobileForm = document.getElementById('mobile-profile-form') as HTMLFormElement;
				if (mobileForm) mobileForm.requestSubmit();
			}
		} finally {
			// Simulate delay
			setTimeout(() => (isSaving = false), 1000);
		}
	}

	// --- Avatar Selection ---
	let showAvatarModal = $state(false);
	let tempAvatarUrl = $state('');
	let isUploading = $state(false);

	// Sample avatars (Dicebear / Robohash)
	const sampleAvatars = [
		'https://api.dicebear.com/7.x/avataaars/svg?seed=Felix',
		'https://api.dicebear.com/7.x/avataaars/svg?seed=Aneka',
		'https://api.dicebear.com/7.x/bottts/svg?seed=Rover',
		'https://api.dicebear.com/7.x/bottts/svg?seed=Jarvis',
		'https://api.dicebear.com/7.x/avataaars/svg?seed=Sky',
		'https://api.dicebear.com/7.x/avataaars/svg?seed=River',
		'https://api.dicebear.com/7.x/bottts/svg?seed=Astro',
		'https://api.dicebear.com/7.x/bottts/svg?seed=Cosmo',
		'https://api.dicebear.com/7.x/avataaars/svg?seed=Luna',
		'https://api.dicebear.com/7.x/bottts/svg?seed=Orion'
	];

	function openAvatarModal() {
		showAvatarModal = true;
		tempAvatarUrl = data.profile?.avatarUrl || '';
	}

	function selectAvatar(url: string) {
		tempAvatarUrl = url;
	}

	async function handleFileUpload(e: Event) {
		const input = e.target as HTMLInputElement;
		if (!input.files || input.files.length === 0) return;

		const file = input.files[0];
		isUploading = true;

		try {
			// Upload to Supabase Storage
			const fileExt = file.name.split('.').pop();
			const fileName = `${data.user.id}-${Math.random()}.${fileExt}`;
			const filePath = `avatars/${fileName}`;

			const { error: uploadError } = await data.supabase.storage
				.from('avatars') // Ensure this bucket exists or handle error
				.upload(filePath, file);

			if (uploadError) {
				// If bucket doesn't exist, we might fail.
				// For this demo, let's assume specific bucket setup is tricky without access.
				// Fallback: Convert to Base64 (not ideal for DB text limit) or just alert error.
				// Let's try to notify user.
				alert('Upload failed: ' + uploadError.message);
				return;
			}

			// Get Public URL
			const {
				data: { publicUrl }
			} = data.supabase.storage.from('avatars').getPublicUrl(filePath);

			tempAvatarUrl = publicUrl;
		} catch (err) {
			console.error(err);
			alert('Error uploading file.');
		} finally {
			isUploading = false;
		}
	}

	let currentAvatarUrl = $state('');

	$effect(() => {
		// Sync local state when server data updates (e.g. after save)
		if (data.profile?.avatarUrl) {
			currentAvatarUrl = data.profile.avatarUrl;
		}
	});

	function applyAvatarSelection() {
		currentAvatarUrl = tempAvatarUrl;
		showAvatarModal = false;
	}

	// --- Lifecycle ---
	onMount(() => {
		if (typeof document !== 'undefined') {
			document.body.classList.add('profile-page');
			document.documentElement.classList.add('profile-page');
			return () => {
				document.body.classList.remove('profile-page');
				document.documentElement.classList.remove('profile-page');
			};
		}
	});

	// --- Helpers ---
	function getInitials(name: string) {
		return name?.charAt(0).toUpperCase() || 'P';
	}
</script>

<SkyBackground useRealTime={true} />

<!-- ==================== MOBILE ONLY - FULL SCREEN ==================== -->
<div class="md:hidden">
	<div class="fixed inset-0 z-50 flex flex-col bg-transparent">
		{#if mobileView === 'menu'}
			<!-- Menu View -->
			<div
				class="flex flex-1 flex-col overflow-y-auto px-6 pt-16 pb-24"
				in:fade={{ duration: 200 }}
			>
				<!-- Avatar Header -->
				<div class="mb-10 flex flex-col items-center text-center">
					<div class="relative mb-5 h-32 w-32">
						<div class="absolute inset-0 rounded-full bg-sky-500/20 blur-2xl"></div>
						<div
							class="relative h-full w-full rounded-full bg-gradient-to-br from-slate-800 to-slate-900 p-1 shadow-2xl ring-2 ring-white/30"
						>
							{#if currentAvatarUrl}
								<img
									src={currentAvatarUrl}
									alt="Avatar"
									class="h-full w-full rounded-full object-cover"
								/>
							{:else}
								<div
									class="flex h-full w-full items-center justify-center rounded-full bg-slate-700 text-4xl font-bold text-white"
								>
									{user.email?.[0].toUpperCase()}
								</div>
							{/if}
							<button
								class="absolute -right-1 -bottom-1 rounded-full bg-sky-500 p-2.5 text-white shadow-[0_0_20px_rgba(14,165,233,0.6)] transition-all hover:scale-110 active:scale-95"
								onclick={openAvatarModal}
								aria-label="Change Avatar"
							>
								<svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
									<path
										stroke-linecap="round"
										stroke-linejoin="round"
										stroke-width="2"
										d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
									/>
								</svg>
							</button>
						</div>
					</div>
					<h1
						class="animate-gradient-flash gradient-animated mb-1 text-3xl font-black tracking-tight drop-shadow-lg"
					>
						{data.profile?.fullName ||
							data.user?.user_metadata?.full_name ||
							data.user?.email ||
							'Pilot'}
					</h1>
					<p class="mb-3 text-sm font-medium text-sky-300">{user.email}</p>
				</div>

				<!-- Menu Cards -->
				<div class="space-y-3">
					<button class="group w-full" onclick={() => (mobileView = 'details')}>
						<div
							class="relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-slate-900/70 to-slate-900/50 p-5 shadow-lg backdrop-blur-xl transition-all active:scale-[0.98]"
						>
							<div class="flex items-center gap-4">
								<div
									class="flex h-12 w-12 items-center justify-center rounded-xl bg-sky-500/20 text-sky-400 transition-all group-active:scale-110 group-active:bg-sky-500 group-active:text-white"
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
								<div class="flex-1 text-left">
									<div class="text-lg font-bold text-white">Account Data</div>
									<div class="text-xs text-slate-400">Personal Information</div>
								</div>
								<svg
									class="h-5 w-5 text-slate-500 transition-colors group-active:text-white"
									fill="none"
									viewBox="0 0 24 24"
									stroke="currentColor"
								>
									<path
										stroke-linecap="round"
										stroke-linejoin="round"
										stroke-width="2"
										d="M9 5l7 7-7 7"
									/>
								</svg>
							</div>
						</div>
					</button>

					<button class="group w-full" onclick={() => (mobileView = 'history')}>
						<div
							class="relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-slate-900/70 to-slate-900/50 p-5 shadow-lg backdrop-blur-xl transition-all active:scale-[0.98]"
						>
							<div class="flex items-center gap-4">
								<div
									class="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-500/20 text-indigo-400 transition-all group-active:scale-110 group-active:bg-indigo-500 group-active:text-white"
								>
									<svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
										<polyline points="22 12 18 12 15 21 9 3 6 12 2 12" stroke-width="2" />
									</svg>
								</div>
								<div class="flex-1 text-left">
									<div class="text-lg font-bold text-white">Mission Log</div>
									<div class="text-xs text-slate-400">Activity History</div>
								</div>
								<svg
									class="h-5 w-5 text-slate-500 transition-colors group-active:text-white"
									fill="none"
									viewBox="0 0 24 24"
									stroke="currentColor"
								>
									<path
										stroke-linecap="round"
										stroke-linejoin="round"
										stroke-width="2"
										d="M9 5l7 7-7 7"
									/>
								</svg>
							</div>
						</div>
					</button>

					<button class="group w-full" onclick={() => (mobileView = 'security')}>
						<div
							class="relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-slate-900/70 to-slate-900/50 p-5 shadow-lg backdrop-blur-xl transition-all active:scale-[0.98]"
						>
							<div class="flex items-center gap-4">
								<div
									class="flex h-12 w-12 items-center justify-center rounded-xl bg-rose-500/20 text-rose-400 transition-all group-active:scale-110 group-active:bg-rose-500 group-active:text-white"
								>
									<svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
										<path
											stroke-linecap="round"
											stroke-linejoin="round"
											stroke-width="2"
											d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
										/>
									</svg>
								</div>
								<div class="flex-1 text-left">
									<div class="text-lg font-bold text-white">Security</div>
									<div class="text-xs text-slate-400">Auth & Privacy</div>
								</div>
								<svg
									class="h-5 w-5 text-slate-500 transition-colors group-active:text-white"
									fill="none"
									viewBox="0 0 24 24"
									stroke="currentColor"
								>
									<path
										stroke-linecap="round"
										stroke-linejoin="round"
										stroke-width="2"
										d="M9 5l7 7-7 7"
									/>
								</svg>
							</div>
						</div>
					</button>

					<form action="/login?/logout" method="POST" use:enhance class="w-full">
						<button class="group w-full" type="submit">
							<div
								class="relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-slate-900/70 to-slate-900/50 p-5 shadow-lg backdrop-blur-xl transition-all active:scale-[0.98]"
							>
								<div class="flex items-center gap-4">
									<div
										class="flex h-12 w-12 items-center justify-center rounded-xl bg-red-500/20 text-red-400 transition-all group-active:scale-110 group-active:bg-red-500 group-active:text-white"
									>
										<svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
											<path
												stroke-linecap="round"
												stroke-linejoin="round"
												stroke-width="2"
												d="M17 16l4-4m0 0l4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
											/>
										</svg>
									</div>
									<div class="flex-1 text-left">
										<div class="text-lg font-bold text-white">Log Out</div>
										<div class="text-xs text-slate-400">Sign out of session</div>
									</div>
									<svg
										class="h-5 w-5 text-slate-500 transition-colors group-active:text-white"
										fill="none"
										viewBox="0 0 24 24"
										stroke="currentColor"
									>
										<path
											stroke-linecap="round"
											stroke-linejoin="round"
											stroke-width="2"
											d="M9 5l7 7-7 7"
										/>
									</svg>
								</div>
							</div>
						</button>
					</form>
				</div>
			</div>
		{/if}

		{#if mobileView !== 'menu'}
			<!-- Detail Views -->
			<div
				class="fixed inset-0 z-50 flex flex-col bg-slate-950"
				in:slide={{ axis: 'x', duration: 300 }}
				out:slide={{ axis: 'x', duration: 200 }}
			>
				<!-- Header -->
				<div
					class="flex items-center gap-3 border-b border-white/5 bg-slate-900/60 p-4 pt-6 shadow-lg backdrop-blur-md"
				>
					<button
						onclick={() => (mobileView = 'menu')}
						class="rounded-full p-2.5 text-slate-400 transition-all hover:bg-white/5 hover:text-white active:scale-95"
						aria-label="Go back"
					>
						<svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M15 19l-7-7 7-7"
							/>
						</svg>
					</button>
					<h2 class="text-xl font-black tracking-wide text-white">
						{#if mobileView === 'details'}ACCOUNT DATA{/if}
						{#if mobileView === 'history'}MISSION LOG{/if}
						{#if mobileView === 'security'}SECURITY{/if}
					</h2>
				</div>

				<!-- Content -->
				<div class="flex-1 overflow-y-auto p-6 pb-32">
					{#if mobileView === 'details'}
						<div
							class="rounded-2xl border border-white/5 bg-slate-900/40 p-6 shadow-xl backdrop-blur-sm"
						>
							<form
								method="POST"
								action="?/updateProfile"
								use:enhance
								id="mobile-profile-form"
								class="space-y-6"
							>
								<input type="hidden" name="avatarUrl" value={currentAvatarUrl} />
								<div>
									<label
										class="mb-2 block text-xs font-bold tracking-widest text-sky-400 uppercase"
										for="fullName">Full Name</label
									>
									<input
										type="text"
										id="fullName"
										name="fullName"
										value={firstName + ' ' + lastName}
										oninput={(e) => {
											const val = e.currentTarget.value;
											firstName = val.split(' ')[0] || '';
											lastName = val.split(' ').slice(1).join(' ') || '';
										}}
										class="w-full rounded-xl border border-white/10 bg-black/40 p-4 font-medium text-white placeholder-slate-600 shadow-inner focus:border-sky-500 focus:ring-1 focus:ring-sky-500 focus:outline-none"
									/>
								</div>
								<div>
									<label
										class="mb-2 block text-xs font-bold tracking-widest text-sky-400 uppercase"
										for="username">Username</label
									>
									<input
										type="text"
										id="username"
										name="username"
										value={data.profile?.username || ''}
										class="w-full rounded-xl border border-white/10 bg-black/40 p-4 font-medium text-white placeholder-slate-600 shadow-inner focus:border-sky-500 focus:ring-1 focus:ring-sky-500 focus:outline-none"
									/>
								</div>
								<div>
									<label
										class="mb-2 block text-xs font-bold tracking-widest text-slate-500 uppercase"
										for="email">Email Address</label
									>
									<input
										type="email"
										id="email"
										value={data.user?.email || ''}
										disabled
										class="w-full rounded-xl border border-white/5 bg-slate-900/20 p-4 font-medium text-slate-500 shadow-inner"
									/>
								</div>
								<div class="pt-4">
									<button
										type="submit"
										class="w-full rounded-xl bg-gradient-to-r from-sky-600 to-sky-500 py-4 font-bold text-white shadow-[0_4px_20px_0_rgba(2,132,199,0.4)] transition-all hover:shadow-[0_6px_30px_0_rgba(2,132,199,0.5)] active:scale-[0.98]"
										disabled={isSaving}
									>
										{isSaving ? 'SAVING...' : 'SAVE CHANGES'}
									</button>
								</div>
							</form>
						</div>
					{/if}

					{#if mobileView === 'history'}
						<div class="space-y-4">
							<div
								class="flex items-center gap-4 rounded-xl border border-white/5 bg-slate-900/40 p-4 backdrop-blur-sm"
							>
								<div class="rounded-full bg-blue-500/20 p-3 text-blue-400">
									<svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
										<path
											stroke-linecap="round"
											stroke-linejoin="round"
											stroke-width="2"
											d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
										/>
									</svg>
								</div>
								<div>
									<h4 class="font-bold text-white">Login Detected</h4>
									<p class="text-sm text-slate-400">Just now • Mobile App</p>
								</div>
							</div>
							<div
								class="flex items-center gap-4 rounded-xl border border-white/5 bg-slate-900/40 p-4 backdrop-blur-sm"
							>
								<div class="rounded-full bg-indigo-500/20 p-3 text-indigo-400">
									<svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
										<path
											stroke-linecap="round"
											stroke-linejoin="round"
											stroke-width="2"
											d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"
										/>
										<path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
									</svg>
								</div>
								<div>
									<h4 class="font-bold text-white">Profile Updated</h4>
									<p class="text-sm text-slate-400">1 hour ago</p>
								</div>
							</div>
						</div>
					{/if}

					{#if mobileView === 'security'}
						<div class="space-y-8">
							<div class="rounded-2xl border border-white/5 bg-slate-900/40 p-6 backdrop-blur-sm">
								<h3 class="mb-4 text-lg font-bold text-white">Change Password</h3>
								<form method="POST" action="?/changePassword" use:enhance class="space-y-4">
									<div>
										<input
											type="password"
											name="password"
											placeholder="New Password"
											class="w-full rounded-xl border border-white/10 bg-black/40 p-4 font-medium text-white placeholder-slate-600 focus:border-sky-500 focus:ring-1 focus:ring-sky-500 focus:outline-none"
											required
										/>
									</div>
									<div>
										<input
											type="password"
											name="confirmPassword"
											placeholder="Confirm Password"
											class="w-full rounded-xl border border-white/10 bg-black/40 p-4 font-medium text-white placeholder-slate-600 focus:border-sky-500 focus:ring-1 focus:ring-sky-500 focus:outline-none"
											required
										/>
									</div>
									<button
										type="submit"
										class="w-full rounded-xl border border-white/20 bg-white/5 py-3 font-bold text-white transition hover:bg-white/10"
									>
										UPDATE PASSWORD
									</button>
								</form>
							</div>

							<div
								class="rounded-2xl border border-rose-900/20 bg-rose-900/10 p-6 backdrop-blur-sm"
							>
								<h3 class="mb-2 text-lg font-bold text-rose-400">Danger Zone</h3>
								<p class="mb-6 text-sm text-rose-200/60">
									Permanently remove your account and all data.
								</p>
								<form method="POST" action="?/deleteAccount" use:enhance>
									<button
										type="submit"
										class="w-full rounded-xl border border-rose-500/30 bg-rose-500/10 py-4 font-bold text-rose-500 transition hover:bg-rose-500/20"
										onclick={(e) => {
											if (!confirm('Are you sure? This cannot be undone.')) e.preventDefault();
										}}
									>
										DELETE ACCOUNT
									</button>
								</form>
							</div>
						</div>
					{/if}
				</div>
			</div>
		{/if}
	</div>
</div>

<!-- ==================== DESKTOP LAYOUT ONLY ==================== -->
<!-- Desktop Layout -->
<div class="page-overlay hidden md:flex">
	<div class="profile-card animate-on-scroll">
		<!-- Left Sidebar -->
		<aside class="sidebar">
			<div class="user-summary">
				<div class="avatar-ring">
					<div class="avatar">
						{#if currentAvatarUrl}
							<img src={currentAvatarUrl} alt="Avatar" class="avatar-img" />
						{:else}
							{getInitials(data.profile?.fullName || data.user?.email || '')}
						{/if}
					</div>
					<button class="avatar-edit-btn" aria-label="Change Avatar" onclick={openAvatarModal}>
						<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
							<path d="M12 20h9" />
							<path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
						</svg>
					</button>
				</div>
				<div class="user-details">
					<h2>
						{data.profile?.fullName ||
							data.user?.user_metadata?.full_name ||
							data.user?.email ||
							'Pilot'}
					</h2>
					<p>@{data.profile?.username || 'username'}</p>
				</div>
			</div>

			<nav class="nav-menu">
				<button
					class="nav-item {selectedTab === 'account' ? 'active' : ''}"
					onclick={() => (selectedTab = 'account')}
				>
					<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
						<path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
						<circle cx="12" cy="7" r="4" />
					</svg>
					<span class="label">Account</span>
				</button>
				<button
					class="nav-item {selectedTab === 'activity' ? 'active' : ''}"
					onclick={() => (selectedTab = 'activity')}
				>
					<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
						<polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
					</svg>
					<span class="label">Activity</span>
				</button>
				<button
					class="nav-item {selectedTab === 'security' ? 'active' : ''}"
					onclick={() => (selectedTab = 'security')}
				>
					<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
						<rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
						<path d="M7 11V7a5 5 0 0 1 10 0v4" />
					</svg>
					<span class="label">Security</span>
				</button>
			</nav>

			<div class="sidebar-footer">
				<form action="/login?/logout" method="POST">
					<button type="submit" class="btn-logout">
						<svg
							class="icon"
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							stroke-width="2"
						>
							<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
							<polyline points="16 17 21 12 16 7" />
							<line x1="21" y1="12" x2="9" y2="12" />
						</svg>
						Sign Out
					</button>
				</form>
			</div>
		</aside>

		<!-- Right Content -->
		<main class="content-area">
			<!-- Alerts -->
			{#if form?.message}
				<div class="alert success" transition:slide>
					{form.message}
				</div>
			{/if}
			{#if form?.error}
				<div class="alert error" transition:slide>
					{form.error}
				</div>
			{/if}

			{#if selectedTab === 'account'}
				<section class="tab-content" in:fade={{ duration: 200 }}>
					<header class="tab-header">
						<h1 class="animate-gradient-flash gradient-animated">Account Settings</h1>
						<p>Manage your profile details and contact info.</p>
					</header>

					<form method="POST" action="?/updateProfile" use:enhance class="styled-form">
						<input type="hidden" name="avatarUrl" value={currentAvatarUrl} />
						<div class="form-row">
							<div class="form-group">
								<label for="fullName">Full Name</label>
								<div class="input-wrapper">
									<svg
										class="input-icon"
										viewBox="0 0 24 24"
										fill="none"
										stroke="currentColor"
										stroke-width="2"
									>
										<path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
										<circle cx="12" cy="7" r="4" />
									</svg>
									<input
										type="text"
										id="fullName"
										name="fullName"
										value={data.profile?.fullName || data.user?.user_metadata?.full_name || ''}
										placeholder="e.g. Maverick"
									/>
								</div>
							</div>
							<div class="form-group">
								<label for="username">Username</label>
								<div class="input-wrapper">
									<svg
										class="input-icon"
										viewBox="0 0 24 24"
										fill="none"
										stroke="currentColor"
										stroke-width="2"
									>
										<path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
										<circle cx="12" cy="7" r="4" />
									</svg>
									<input
										type="text"
										id="username"
										name="username"
										value={data.profile?.username || data.user?.user_metadata?.username || ''}
										placeholder="e.g. ghost_rider"
									/>
								</div>
							</div>
						</div>

						<div class="form-group">
							<label for="email">Email Address</label>
							<div class="input-wrapper">
								<svg
									class="input-icon"
									viewBox="0 0 24 24"
									fill="none"
									stroke="currentColor"
									stroke-width="2"
								>
									<path
										d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"
									/>
									<polyline points="22,6 12,13 2,6" />
								</svg>
								<input
									type="email"
									id="email"
									value={data.user?.email || ''}
									disabled
									class="disabled"
								/>
							</div>
							<p class="helper-text">Contact support to change your email address.</p>
						</div>

						<div class="form-actions">
							<button type="submit" class="btn-primary">Save Changes</button>
						</div>
					</form>
				</section>
			{/if}

			{#if selectedTab === 'activity'}
				<section class="tab-content" in:fade={{ duration: 200 }}>
					<header class="tab-header">
						<h1>Recent Activity</h1>
						<p>Track your logins and account updates.</p>
					</header>

					<div class="activity-list">
						<div class="activity-item">
							<div class="activity-icon-box">
								<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
									<path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
									<polyline points="10 17 15 12 10 7" />
									<line x1="15" y1="12" x2="3" y2="12" />
								</svg>
							</div>
							<div class="activity-info">
								<span class="act-title">Login Detected</span>
								<span class="act-time">Just now • Web Client</span>
							</div>
						</div>
						<div class="activity-item">
							<div class="activity-icon-box">
								<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
									<path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
									<path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
								</svg>
							</div>
							<div class="activity-info">
								<span class="act-title">Profile Updated</span>
								<span class="act-time">1 hour ago</span>
							</div>
						</div>
					</div>
				</section>
			{/if}

			{#if selectedTab === 'security'}
				<section class="tab-content" in:fade={{ duration: 200 }}>
					<header class="tab-header">
						<h1>Security</h1>
						<p>Protect your account with a strong password.</p>
					</header>

					<div class="section-block">
						<h3>Change Password</h3>
						<form method="POST" action="?/changePassword" use:enhance class="styled-form">
							<div class="form-row">
								<div class="form-group">
									<label for="password">New Password</label>
									<div class="input-wrapper">
										<svg
											class="input-icon"
											viewBox="0 0 24 24"
											fill="none"
											stroke="currentColor"
											stroke-width="2"
										>
											<rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
											<path d="M7 11V7a5 5 0 0 1 10 0v4" />
										</svg>
										<input
											type="password"
											id="password"
											name="password"
											placeholder="••••••••"
											required
										/>
									</div>
								</div>
								<div class="form-group">
									<label for="confirmPassword">Confirm Password</label>
									<div class="input-wrapper">
										<svg
											class="input-icon"
											viewBox="0 0 24 24"
											fill="none"
											stroke="currentColor"
											stroke-width="2"
										>
											<rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
											<path d="M7 11V7a5 5 0 0 1 10 0v4" />
										</svg>
										<input
											type="password"
											id="confirmPassword"
											name="confirmPassword"
											placeholder="••••••••"
											required
										/>
									</div>
								</div>
							</div>
							<div class="form-actions fit-content">
								<button type="submit" class="btn-secondary">Update Password</button>
							</div>
						</form>
					</div>

					<div class="danger-zone">
						<div class="danger-info">
							<h3>Delete Account</h3>
							<p>Permanently remove your account and all data. This action cannot be undone.</p>
						</div>
						<form method="POST" action="?/deleteAccount" use:enhance>
							<button
								type="submit"
								class="btn-danger"
								onclick={(e) => {
									if (
										!confirm(
											'Are you sure you want to delete your account? This action cannot be undone.'
										)
									)
										e.preventDefault();
								}}>Delete Account</button
							>
						</form>
					</div>
				</section>
			{/if}
		</main>
	</div>
</div>

<!-- Avatar Modal -->
{#if showAvatarModal}
	<div
		class="modal-overlay"
		transition:fade={{ duration: 200 }}
		onclick={() => (showAvatarModal = false)}
		role="button"
		tabindex="0"
		onkeydown={(e) => e.key === 'Escape' && (showAvatarModal = false)}
	>
		<div
			class="modal-card avatar-modal"
			onclick={(e) => e.stopPropagation()}
			onkeydown={(e) => e.stopPropagation()}
			transition:scale={{ duration: 300, start: 0.95 }}
			role="dialog"
			aria-modal="true"
			tabindex="-1"
		>
			<div class="modal-header">
				<h2 class="modal-title">Select Avatar</h2>
				<button class="btn-close" aria-label="avatar" onclick={() => (showAvatarModal = false)}>
					<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
						<line x1="18" y1="6" x2="6" y2="18"></line>
						<line x1="6" y1="6" x2="18" y2="18"></line>
					</svg>
				</button>
			</div>
			<div class="modal-body">
				<div class="avatar-grid">
					{#each sampleAvatars as url}
						<button
							class="avatar-option {tempAvatarUrl === url ? 'selected' : ''}"
							onclick={() => selectAvatar(url)}
						>
							<img src={url} alt="Avatar Option" />
						</button>
					{/each}
				</div>

				<div class="divider">
					<span>OR</span>
				</div>

				<div class="upload-section">
					<label for="avatar-upload" class="btn-upload">
						{#if isUploading}
							Uploading...
						{:else}
							Upload Custom Image
						{/if}
					</label>
					<input
						type="file"
						id="avatar-upload"
						accept="image/*"
						onchange={handleFileUpload}
						style="display: none;"
						disabled={isUploading}
					/>
				</div>
			</div>
			<div class="modal-footer">
				<button class="btn-primary" onclick={applyAvatarSelection}>Confirm Selection</button>
			</div>
		</div>
	</div>
{/if}

<style>
	.page-overlay {
		position: relative;
		padding: 2rem;
		padding-top: 6rem; /* Navbar spacing */
		min-height: 100vh;
		width: 100%;
		box-sizing: border-box;
		justify-content: center;
		align-items: flex-start;
	}

	@media (max-width: 1000px), (max-height: 800px) {
		.page-overlay {
			position: absolute;
			inset: auto;
			top: 0;
			left: 0;
			right: 0;
			min-height: 100vh;
			padding: 6rem 1rem 2rem;
			align-items: flex-start;
			overflow-y: visible;
		}
		.profile-card {
			grid-template-columns: 1fr; /* Stack sidebar and content */
			height: auto;
			max-height: none;
		}
		.sidebar {
			border-right: none;
			border-bottom: 1px solid #e2e8f0;
		}
		.content-area {
			overflow-y: visible;
		}
	}

	.profile-card {
		display: grid;
		grid-template-columns: 280px 1fr;
		width: 100%;
		max-width: 1000px;
		height: 650px;
		background: #ffffff;
		border-radius: 24px;
		box-shadow:
			0 20px 25px -5px rgba(0, 0, 0, 0.1),
			0 10px 10px -5px rgba(0, 0, 0, 0.04);
		overflow: hidden;
	}

	/* --- Sidebar --- */
	.sidebar {
		background: rgba(248, 250, 252, 0.9);
		backdrop-filter: blur(10px);
		border-right: 1px solid #e2e8f0;
		padding: 2rem;
		display: flex;
		flex-direction: column;
		gap: 2rem;
	}

	.user-summary {
		text-align: center;
		padding-bottom: 2rem;
		border-bottom: 1px solid #e2e8f0;
	}

	.avatar-ring {
		position: relative;
		width: 100px;
		height: 100px;
		margin: 0 auto 1rem;
	}

	.avatar {
		width: 100%;
		height: 100%;
		background: #1e3a5f;
		color: white;
		border-radius: 50%;
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 2.5rem;
		font-weight: 700;
	}

	.avatar-edit-btn {
		position: absolute;
		bottom: 0;
		right: 0;
		width: 32px;
		height: 32px;
		background: #38bdf8;
		border: 2px solid white;
		border-radius: 50%;
		display: flex;
		align-items: center;
		justify-content: center;
		color: white;
		cursor: pointer;
		transition: all 0.2s;
	}

	.avatar-edit-btn:hover {
		transform: scale(1.1);
	}

	.avatar-edit-btn svg {
		width: 16px;
		height: 16px;
	}

	.user-details h2 {
		font-size: 1.25rem;
		color: var(--font-primary);
		margin: 0;
		font-weight: 700;
	}

	.user-details p {
		color: #64748b;
		margin: 0.25rem 0 0;
		font-size: 0.9rem;
	}

	/* Navigation */
	.nav-menu {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
		flex: 1;
	}

	.nav-item {
		display: flex;
		align-items: center;
		gap: 1rem;
		padding: 0.85rem 1rem;
		border: none;
		background: transparent;
		color: #64748b;
		border-radius: 12px;
		cursor: pointer;
		font-size: 0.95rem;
		font-weight: 600;
		transition: all 0.2s;
		text-align: left;
	}

	.nav-item:hover {
		background: rgba(255, 255, 255, 0.5);
		color: var(--font-primary);
	}

	.nav-item.active {
		background: #ffffff;
		color: var(--font-primary);
		box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
	}

	.nav-item .icon {
		width: 20px;
		height: 20px;
	}

	.sidebar-footer {
		margin-top: auto;
		padding-top: 1rem;
		border-top: 1px solid #e2e8f0;
	}

	.btn-logout {
		width: 100%;
		padding: 0.75rem;
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 0.75rem;
		background: #fff1f2;
		color: #e11d48;
		border: 1px solid #fecdd3;
		border-radius: 12px;
		font-weight: 600;
		cursor: pointer;
		transition: all 0.2s;
	}

	.btn-logout .icon {
		width: 20px;
		height: 20px;
	}

	.btn-logout:hover {
		background: #ffe4e6;
		transform: translateY(-1px);
	}

	/* --- Content Area --- */
	.content-area {
		background: #ffffff;
		padding: 3rem;
		overflow-y: auto;
		position: relative;
	}

	.tab-header {
		margin-bottom: 2.5rem;
	}

	.tab-header h1 {
		font-size: 1.75rem;
		color: var(--font-primary);
		margin: 0 0 0.5rem;
	}

	.tab-header p {
		color: #64748b;
		font-size: 1rem;
		margin: 0;
	}

	/* Forms */
	.styled-form {
		display: flex;
		flex-direction: column;
		gap: 1.5rem;
	}

	.form-row {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 1.5rem;
	}

	.form-group {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}

	label {
		font-weight: 600;
		color: #475569;
		font-size: 0.85rem;
		text-transform: uppercase;
		letter-spacing: 0.5px;
	}

	.input-wrapper {
		position: relative;
		display: flex;
		align-items: center;
	}

	.input-icon {
		position: absolute;
		left: 1rem;
		width: 20px;
		height: 20px;
		color: #94a3b8;
	}

	input {
		width: 100%;
		padding: 0.75rem 1rem 0.75rem 3rem; /* Left padding for icon */
		border: 1px solid #e2e8f0;
		border-radius: 12px;
		background: #f8fafc;
		font-size: 1rem;
		color: var(--font-primary);
		transition: all 0.2s;
	}

	input:focus {
		outline: none;
		border-color: #38bdf8;
		background: #ffffff;
		box-shadow: 0 0 0 4px rgba(56, 189, 248, 0.1);
	}

	input.disabled {
		background: #f1f5f9;
		color: #94a3b8;
		cursor: not-allowed;
	}

	.helper-text {
		font-size: 0.8rem;
		color: #94a3b8;
		margin-top: 0.5rem;
	}

	.avatar-img {
		width: 100%;
		height: 100%;
		object-fit: cover;
		border-radius: 50%;
	}

	/* Modal Styles */
	.modal-overlay {
		position: fixed;
		inset: 0;
		background: rgba(0, 0, 0, 0.6);
		backdrop-filter: blur(4px);
		z-index: 2000;
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 1rem;
	}
	.modal-card {
		background: #ffffff;
		width: 100%;
		max-width: 500px;
		border-radius: 20px;
		overflow: hidden;
		display: flex;
		flex-direction: column;
	}
	.avatar-modal {
		max-width: 600px;
	}
	.modal-header {
		padding: 1.5rem;
		border-bottom: 1px solid #e2e8f0;
		display: flex;
		justify-content: space-between;
		align-items: center;
	}
	.modal-title {
		font-size: 1.25rem;
		color: #0f172a;
		margin: 0;
		font-weight: 700;
	}
	.btn-close {
		background: none;
		border: none;
		cursor: pointer;
		color: #94a3b8;
		padding: 0.5rem;
	}
	.btn-close svg {
		width: 24px;
		height: 24px;
	}
	.modal-body {
		padding: 1.5rem;
		overflow-y: auto;
	}
	.modal-footer {
		padding: 1.5rem;
		border-top: 1px solid #e2e8f0;
		text-align: right;
	}

	.avatar-grid {
		display: grid;
		grid-template-columns: repeat(5, 1fr);
		gap: 1rem;
		margin-bottom: 1.5rem;
	}
	.avatar-option {
		width: 100%;
		aspect-ratio: 1;
		border-radius: 50%;
		border: 2px solid transparent;
		overflow: hidden;
		cursor: pointer;
		padding: 0;
		background: #f1f5f9;
		transition: all 0.2s;
	}
	.avatar-option:hover {
		transform: scale(1.1);
		border-color: #cbd5e1;
	}
	.avatar-option.selected {
		border-color: #38bdf8;
		box-shadow: 0 0 0 3px rgba(56, 189, 248, 0.2);
	}
	.avatar-option img {
		width: 100%;
		height: 100%;
		object-fit: cover;
	}

	.divider {
		display: flex;
		align-items: center;
		text-align: center;
		margin: 1.5rem 0;
		color: #94a3b8;
		font-size: 0.8rem;
		font-weight: 700;
		letter-spacing: 1px;
	}
	.divider::before,
	.divider::after {
		content: '';
		flex: 1;
		border-bottom: 1px solid #e2e8f0;
	}
	.divider span {
		padding: 0 1rem;
	}

	.btn-upload {
		display: block;
		width: 100%;
		padding: 0.75rem;
		border: 2px dashed #cbd5e1;
		border-radius: 12px;
		color: #64748b;
		font-weight: 600;
		text-align: center;
		cursor: pointer;
		transition: all 0.2s;
	}
	.btn-upload:hover {
		border-color: #38bdf8;
		color: #38bdf8;
		background: #f0f9ff;
	}

	.form-actions {
		margin-top: 1rem;
	}

	.form-actions.fit-content {
		width: max-content;
	}

	.btn-primary {
		padding: 0.8rem 2rem;
		background: #0f172a;
		color: white;
		border: none;
		border-radius: 12px;
		font-weight: 600;
		cursor: pointer;
		transition: all 0.2s ease;
		display: inline-flex;
		align-items: center;
		gap: 0.5rem;
	}

	.btn-primary:hover {
		background: #1e293b;
		transform: translateY(-2px);
		box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
	}

	.btn-secondary {
		padding: 0.8rem 2rem;
		background: white;
		color: var(--font-primary);
		border: 1px solid #e2e8f0;
		border-radius: 12px;
		font-weight: 600;
		cursor: pointer;
		transition: all 0.2s;
	}

	.btn-secondary:hover {
		background: #f8fafc;
		border-color: #cbd5e1;
	}

	/* Activity List */
	.activity-list {
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}

	.activity-item {
		display: flex;
		align-items: center;
		gap: 1rem;
		padding: 1rem;
		background: #f8fafc;
		border: 1px solid #e2e8f0;
		border-radius: 16px;
	}

	.activity-icon-box {
		width: 48px;
		height: 48px;
		background: #ffffff;
		border: 1px solid #e2e8f0;
		border-radius: 12px;
		display: flex;
		align-items: center;
		justify-content: center;
		color: #0f172a;
	}

	.activity-icon-box svg {
		width: 24px;
		height: 24px;
	}

	.act-title {
		display: block;
		font-weight: 700;
		color: var(--font-primary);
		font-size: 1rem;
	}

	.act-time {
		display: block;
		font-size: 0.85rem;
		color: #64748b;
		margin-top: 0.25rem;
	}

	/* Danger Zone */
	.danger-zone {
		margin-top: 3rem;
		border: 1px solid #fecdd3;
		border-radius: 16px;
		padding: 1.5rem;
		background: #fff1f2;
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 2rem;
	}

	.danger-info h3 {
		color: #ef4444;
		margin: 0 0 0.5rem;
		font-size: 1.1rem;
	}

	.danger-info p {
		color: #b91c1c;
		font-size: 0.9rem;
		margin: 0;
	}

	.btn-danger {
		padding: 0.8rem 1.5rem;
		background: #ef4444;
		color: white;
		border: none;
		border-radius: 12px;
		font-weight: 600;
		cursor: pointer;
		white-space: nowrap;
		transition: all 0.2s;
	}

	.btn-danger:hover {
		background: #dc2626;
	}

	/* Validations / Alerts */
	.alert {
		margin-bottom: 2rem;
		padding: 1rem;
		border-radius: 12px;
		font-weight: 500;
	}
	.alert.success {
		background: #dcfce7;
		color: #166534;
		border: 1px solid #bbf7d0;
	}
	.alert.error {
		background: #fee2e2;
		color: #991b1b;
		border: 1px solid #fecaca;
	}

	/* Responsive */
	@media (max-width: 900px) {
		.page-overlay {
			padding: 1rem;
		}

		.profile-card {
			grid-template-columns: 80px 1fr;
			max-width: 100%;
			height: calc(100vh - 2rem);
		}

		.sidebar {
			padding: 1.5rem 0.5rem;
			align-items: center;
		}

		.user-summary {
			border: none;
			padding: 0;
			margin-bottom: auto;
		}

		.avatar-ring {
			width: 48px;
			height: 48px;
			margin: 0;
		}

		.avatar {
			font-size: 1.25rem;
		}

		.avatar-edit-btn,
		.user-details,
		.nav-item .label {
			display: none;
		}

		.nav-menu {
			flex: 0;
			gap: 1rem;
		}

		.nav-item {
			padding: 0.75rem;
			justify-content: center;
		}

		.sidebar-footer {
			margin-top: auto;
			width: 100%;
			border: none;
		}

		.btn-logout {
			padding: 0.75rem;
			width: auto;
			margin: 0 auto;
		}

		.danger-zone {
			flex-direction: column;
			text-align: center;
		}
	}
</style>
