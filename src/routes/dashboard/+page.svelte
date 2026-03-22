<script lang="ts">
	import { onMount } from 'svelte';
	import type { PageData } from './$types';
	import { fade, fly, scale, slide } from 'svelte/transition';
	import { quintOut } from 'svelte/easing';
	import SkyBackground from '$lib/components/ui/SkyBackground.svelte';

	let { data } = $props<{ data: PageData }>();

	// --- State ---
	let selectedTest = $state<any>(null);
	let showFeedbackModal = $state(false);
	let aiFeedback = $state<any[] | null>(null);
	let isLoadingFeedback = $state(false);

	// --- Actions ---
	function openFeedback(test: any) {
		selectedTest = test;
		showFeedbackModal = true;
		aiFeedback = null;
	}

	function closeFeedback() {
		showFeedbackModal = false;
		selectedTest = null;
		aiFeedback = null;
	}

	async function getAiAnalysis() {
		if (!selectedTest) return;

		const incorrectQuestions = selectedTest.questions.filter(
			(q: any) => q.userAnswer !== q.correctAnswer
		);

		if (incorrectQuestions.length === 0) {
			aiFeedback = [
				{
					questionText: 'Perfect Score!',
					explanation: 'You answered all questions correctly. Keep up the great work!',
					topicToReview: 'Advanced Topics'
				}
			];
			return;
		}

		isLoadingFeedback = true;
		try {
			const res = await fetch('/api/ai-feedback', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ questions: incorrectQuestions })
			});

			const data = await res.json();

			if (data.feedback) {
				aiFeedback = data.feedback;
			} else {
				throw new Error('Invalid response format');
			}
		} catch (e) {
			console.error('Error getting AI feedback:', e);
			// Fallback for network errors
			aiFeedback = [
				{
					questionText: 'Network Error',
					explanation:
						'Could not connect to the analysis service. Please check your internet connection and try again.',
					topicToReview: 'Connectivity'
				}
			];
		} finally {
			isLoadingFeedback = false;
		}
	}

	// --- Helpers ---
	function getGreeting() {
		const hour = new Date().getHours();
		if (hour >= 5 && hour < 12) return 'Good Morning';
		if (hour >= 12 && hour < 17) return 'Good Afternoon';
		if (hour >= 17 && hour < 21) return 'Good Evening';
		return 'Good Night';
	}

	function getInitials(name: string) {
		return name?.charAt(0).toUpperCase() || 'P';
	}

	onMount(() => {
		if (typeof document === 'undefined') return;
		document.body.classList.add('dashboard-page');
		document.documentElement.classList.add('dashboard-page');
		return () => {
			document.body.classList.remove('dashboard-page');
			document.documentElement.classList.remove('dashboard-page');
		};
	});
</script>

<SkyBackground useRealTime={true} />

<div class="page-overlay">
	<!-- ==================== MOBILE LAYOUT ONLY ==================== -->
	<div class="fixed inset-0 z-10 flex flex-col bg-transparent md:hidden">
		<!-- Header -->
		<header class="flex items-center justify-between px-6 pt-20 pb-4">
			<div>
				<h1 class="text-3xl font-black tracking-tight text-white drop-shadow-lg">
					{getGreeting()}
				</h1>
				<p class="mt-1 text-sm font-semibold tracking-wide text-sky-300">
					{new Date().toLocaleDateString('en-US', {
						weekday: 'long',
						month: 'short',
						day: 'numeric'
					})}
				</p>
			</div>
			<div
				class="relative h-14 w-14 rounded-full bg-gradient-to-br from-slate-800/60 to-slate-900/80 p-0.5 shadow-xl ring-2 ring-white/30 backdrop-blur-sm"
			>
				{#if data.user?.avatarUrl}
					<img
						src={data.user.avatarUrl}
						alt="Pilot"
						class="h-full w-full rounded-full object-cover"
					/>
				{:else}
					<div
						class="flex h-full w-full items-center justify-center rounded-full bg-slate-700 text-xl font-bold text-white"
					>
						{getInitials(data.user?.fullName || '')}
					</div>
				{/if}
				<div
					class="absolute -right-0.5 -bottom-0.5 h-4 w-4 rounded-full bg-emerald-400 shadow-lg ring-2 ring-black"
				></div>
			</div>
		</header>

		<!-- Main Content Area - Scrollable -->
		<div class="flex-1 overflow-y-auto px-6 pb-24">
			<!-- Progress HUD -->
			<div class="mb-8 flex flex-col items-center">
				<div class="relative mb-6 h-56 w-56">
					<!-- Glow effect -->
					<div class="absolute inset-0 rounded-full bg-sky-500/10 blur-2xl"></div>
					<!-- Progress circle -->
					<svg class="relative z-10 h-full w-full -rotate-90 transform" viewBox="0 0 100 100">
						<circle
							cx="50"
							cy="50"
							r="42"
							fill="none"
							class="stroke-slate-800/40"
							stroke-width="6"
						/>
						<circle
							cx="50"
							cy="50"
							r="42"
							fill="none"
							class="text-sky-400 drop-shadow-[0_0_12px_rgba(56,189,248,0.6)]"
							stroke="currentColor"
							stroke-width="6"
							stroke-dasharray="264"
							stroke-dashoffset={264 - (264 * data.stats.progress) / 100}
							stroke-linecap="round"
						/>
					</svg>
					<div class="absolute inset-0 z-20 flex flex-col items-center justify-center text-center">
						<span class="text-5xl font-black tracking-tighter text-white drop-shadow-2xl"
							>{data.stats.progress}%</span
						>
						<span class="mt-1 text-xs font-bold tracking-widest text-sky-200 uppercase"
							>Readiness</span
						>
					</div>
				</div>

				<!-- Stats Grid -->
				<div class="mb-8 grid w-full grid-cols-3 gap-3">
					<div
						class="rounded-2xl border border-white/10 bg-slate-900/50 p-4 text-center shadow-lg backdrop-blur-md"
					>
						<div class="mb-1 text-2xl font-black text-white">{data.stats.totalTests}</div>
						<div class="text-[10px] font-bold tracking-wider text-slate-400 uppercase">
							Missions
						</div>
					</div>
					<div
						class="rounded-2xl border border-white/10 bg-slate-900/50 p-4 text-center shadow-lg backdrop-blur-md"
					>
						<div class="mb-1 text-2xl font-black text-emerald-400 drop-shadow-sm">
							{#if data.stats.averageScore >= 90}A
							{:else if data.stats.averageScore >= 80}B
							{:else if data.stats.averageScore >= 70}C
							{:else}D{/if}
						</div>
						<div class="text-[10px] font-bold tracking-wider text-slate-400 uppercase">Grade</div>
					</div>
					<div
						class="rounded-2xl border border-white/10 bg-slate-900/50 p-4 text-center shadow-lg backdrop-blur-md"
					>
						<div class="mb-1 text-2xl font-black text-amber-400 drop-shadow-sm">
							{Math.round(data.stats.averageScore)}
						</div>
						<div class="text-[10px] font-bold tracking-wider text-slate-400 uppercase">Score</div>
					</div>
				</div>
			</div>

			<!-- Quick Access Grid -->
			<div class="space-y-3">
				<h2 class="mb-4 px-1 text-sm font-bold tracking-wider text-slate-300 uppercase">
					Quick Access
				</h2>

				<!-- 1. Hangar Zone -->
				<a href="/hangar-zone" class="group block">
					<div
						class="relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-slate-900/70 to-slate-900/50 p-5 shadow-lg backdrop-blur-xl transition-all active:scale-[0.98] active:bg-slate-800/80"
					>
						<div class="flex items-center gap-4">
							<div
								class="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-500/20 text-blue-400 transition-all group-active:scale-110 group-active:bg-blue-500 group-active:text-white"
							>
								<img
									src="/icons/hangar-zone.png"
									alt="Hangar Zone"
									class="h-8 w-8 object-contain"
								/>
							</div>
							<div class="flex-1">
								<div class="text-lg font-bold text-white">Hangar Zone</div>
								<div class="text-xs text-slate-400">Explore Components</div>
							</div>
							<svg
								class="h-5 w-5 text-slate-500 transition-colors group-active:text-white"
								fill="none"
								viewBox="0 0 24 24"
								stroke="currentColor"
								><path
									stroke-linecap="round"
									stroke-linejoin="round"
									stroke-width="2"
									d="M9 5l7 7-7 7"
								/></svg
							>
						</div>
					</div>
				</a>

				<!-- 2. Turbofan Engine -->
				<a href="/turbofan-engine" class="group block">
					<div
						class="relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-slate-900/70 to-slate-900/50 p-5 shadow-lg backdrop-blur-xl transition-all active:scale-[0.98] active:bg-slate-800/80"
					>
						<div class="flex items-center gap-4">
							<div
								class="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-500/20 text-indigo-400 transition-all group-active:scale-110 group-active:bg-indigo-500 group-active:text-white"
							>
								<img
									src="/icons/turbofan-engine.png"
									alt="Turbofan Engine"
									class="h-8 w-8 object-contain"
								/>
							</div>
							<div class="flex-1">
								<div class="text-lg font-bold text-white">Turbofan Engine</div>
								<div class="text-xs text-slate-400">Deep Dive Mechanics</div>
							</div>
							<svg
								class="h-5 w-5 text-slate-500 transition-colors group-active:text-white"
								fill="none"
								viewBox="0 0 24 24"
								stroke="currentColor"
								><path
									stroke-linecap="round"
									stroke-linejoin="round"
									stroke-width="2"
									d="M9 5l7 7-7 7"
								/></svg
							>
						</div>
					</div>
				</a>

				<!-- 3. Overhaul Station -->
				<a href="/overhaul-station" class="group block">
					<div
						class="relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-slate-900/70 to-slate-900/50 p-5 shadow-lg backdrop-blur-xl transition-all active:scale-[0.98] active:bg-slate-800/80"
					>
						<div class="flex items-center gap-4">
							<div
								class="flex h-12 w-12 items-center justify-center rounded-xl bg-orange-500/20 text-orange-400 transition-all group-active:scale-110 group-active:bg-orange-500 group-active:text-white"
							>
								<img
									src="/icons/overhaul-station.png"
									alt="Overhaul Station"
									class="h-8 w-8 object-contain"
								/>
							</div>
							<div class="flex-1">
								<div class="text-lg font-bold text-white">Overhaul Station</div>
								<div class="text-xs text-slate-400">Maintenance & Repair</div>
							</div>
							<svg
								class="h-5 w-5 text-slate-500 transition-colors group-active:text-white"
								fill="none"
								viewBox="0 0 24 24"
								stroke="currentColor"
								><path
									stroke-linecap="round"
									stroke-linejoin="round"
									stroke-width="2"
									d="M9 5l7 7-7 7"
								/></svg
							>
						</div>
					</div>
				</a>

				<!-- 4. Test Bay -->
				<a href="/test-bay" class="group block">
					<div
						class="relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-slate-900/70 to-slate-900/50 p-5 shadow-lg backdrop-blur-xl transition-all active:scale-[0.98] active:bg-slate-800/80"
					>
						<div class="flex items-center gap-4">
							<div
								class="flex h-12 w-12 items-center justify-center rounded-xl bg-sky-500/20 text-sky-400 transition-all group-active:scale-110 group-active:bg-sky-500 group-active:text-white"
							>
								<img src="/icons/test-bay.png" alt="Test Bay" class="h-8 w-8 object-contain" />
							</div>
							<div class="flex-1">
								<div class="text-lg font-bold text-white">Test Bay</div>
								<div class="text-xs text-slate-400">Simulation & Testing</div>
							</div>
							<svg
								class="h-5 w-5 text-slate-500 transition-colors group-active:text-white"
								fill="none"
								viewBox="0 0 24 24"
								stroke="currentColor"
								><path
									stroke-linecap="round"
									stroke-linejoin="round"
									stroke-width="2"
									d="M9 5l7 7-7 7"
								/></svg
							>
						</div>
					</div>
				</a>

				<!-- 5. Profile -->
				<a href="/profile" class="group block">
					<div
						class="relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-slate-900/70 to-slate-900/50 p-5 shadow-lg backdrop-blur-xl transition-all active:scale-[0.98] active:bg-slate-800/80"
					>
						<div class="flex items-center gap-4">
							<div
								class="flex h-12 w-12 items-center justify-center rounded-xl bg-rose-500/20 text-rose-400 transition-all group-active:scale-110 group-active:bg-rose-500 group-active:text-white"
							>
								<svg class="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor"
									><path
										stroke-linecap="round"
										stroke-linejoin="round"
										stroke-width="2"
										d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
									/></svg
								>
							</div>
							<div class="flex-1">
								<div class="text-lg font-bold text-white">Profile</div>
								<div class="text-xs text-slate-400">Account Settings</div>
							</div>
							<svg
								class="h-5 w-5 text-slate-500 transition-colors group-active:text-white"
								fill="none"
								viewBox="0 0 24 24"
								stroke="currentColor"
								><path
									stroke-linecap="round"
									stroke-linejoin="round"
									stroke-width="2"
									d="M9 5l7 7-7 7"
								/></svg
							>
						</div>
					</div>
				</a>
			</div>
		</div>
	</div>

	<!-- ==================== DESKTOP LAYOUT ONLY ==================== -->
	<div class="dashboard-container hidden md:flex">
		<!-- Scrollable Content Wrapper -->
		<div class="dashboard-scroll-content">
			<!-- Header Section - Full Width -->
			<header class="header-section animate-on-scroll" in:fly={{ y: -20, duration: 800 }}>
				<div class="pilot-info">
					<div class="avatar-ring">
						<div class="avatar">
							{#if data.user?.avatarUrl}
								<img src={data.user.avatarUrl} alt="Avatar" class="avatar-img" />
							{:else}
								{getInitials(data.user?.fullName || '')}
							{/if}
						</div>
					</div>
					<div class="text-content">
						<h1 class="pilot-name">{getGreeting()}, {data.user?.fullName}</h1>
						<div class="date-widget">
							<span class="date-day"
								>{new Date().toLocaleDateString('en-US', { weekday: 'long' })}</span
							>
							<span class="date-sep">•</span>
							<span class="date-full">
								{new Date().toLocaleDateString('en-US', {
									month: 'long',
									day: 'numeric',
									year: 'numeric'
								})}
							</span>
						</div>
					</div>
				</div>
			</header>

			<!-- 2-Column Grid Layout -->
			<div class="dashboard-grid">
				<!-- LEFT COLUMN: Mission Log -->
				<div class="left-column">
					<!-- 2. Main Content Stack (Middle: Activity) -->
					<!-- 2. Main Content Stack (Middle: Activity) -->
					<section class="panel activity-panel animate-on-scroll animate-delay-200">
						<div class="panel-header">
							<h2>Mission Log</h2>
							<a href="/dashboard/history" class="view-all">View History →</a>
						</div>

						<div class="activity-list">
							{#if data.recentActivity.length > 0}
								{#each data.recentActivity as activity, i}
									<div
										class="activity-row"
										in:slide={{ axis: 'y', duration: 300, delay: 500 + i * 50 }}
									>
										<div
											class="activity-status-indicator {activity.passed ? 'pass' : 'fail'}"
										></div>
										<div class="activity-main">
											<div class="activity-info">
												<span class="activity-type"
													>{activity.type === 'test' ? 'Assessment' : 'Simulation'}</span
												>
												<h3 class="activity-title">{activity.moduleName}</h3>
											</div>
											<div class="activity-meta">
												<span class="activity-date"
													>{new Date(activity.date).toLocaleDateString()}</span
												>
												<span
													class="activity-score {activity.passed ? 'score-pass' : 'score-fail'}"
												>
													{activity.score}%
												</span>
											</div>
										</div>
										{#if activity.type === 'test'}
											<button
												class="btn-icon"
												onclick={() => openFeedback(activity)}
												aria-label="View Feedback"
											>
												<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
													<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
													<polyline points="14 2 14 8 20 8" />
													<line x1="16" y1="13" x2="8" y2="13" />
													<line x1="16" y1="17" x2="8" y2="17" />
													<polyline points="10 9 9 9 8 9" />
												</svg>
											</button>
										{/if}
									</div>
								{/each}
							{:else}
								<div class="empty-state">
									<div class="empty-icon-box">
										<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
											<circle cx="12" cy="12" r="10"></circle>
											<line x1="12" y1="8" x2="12" y2="12"></line>
											<line x1="12" y1="16" x2="12.01" y2="16"></line>
										</svg>
									</div>
									<p>No missions recorded yet.</p>
									<a href="/test-bay" class="btn-primary-small">Start First Mission</a>
								</div>
							{/if}
						</div>
					</section>
				</div>

				<!-- RIGHT COLUMN: Stats + Quick Access -->
				<div class="right-column">
					<!-- Stats Cards (Stacked Vertically) -->
					<section class="stats-column animate-on-scroll animate-delay-100">
						<!-- Progress Card -->
						<div
							class="stat-card progress-card"
							in:scale={{ duration: 500, delay: 200, start: 0.9 }}
						>
							<div class="stat-icon-wrapper blue">
								<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
									<path
										d="M22 11.08V12a10 10 0 1 1-5.93-9.14"
										stroke-linecap="round"
										stroke-linejoin="round"
									/>
									<polyline
										points="22 4 12 14.01 9 11.01"
										stroke-linecap="round"
										stroke-linejoin="round"
									/>
								</svg>
							</div>
							<div class="stat-details">
								<span class="stat-label">Training Progress</span>
								<div class="stat-value-row">
									<span class="stat-number">{data.stats.progress}%</span>
								</div>
								<div class="progress-track">
									<div class="progress-bar" style="width: {data.stats.progress}%"></div>
								</div>
							</div>
						</div>

						<!-- Modules Card -->
						<div class="stat-card" in:scale={{ duration: 500, delay: 300, start: 0.9 }}>
							<div class="stat-icon-wrapper green">
								<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
									<path
										d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"
										stroke-linecap="round"
										stroke-linejoin="round"
									/>
									<polyline
										points="14 2 14 8 20 8"
										stroke-linecap="round"
										stroke-linejoin="round"
									/>
									<line
										x1="16"
										y1="13"
										x2="8"
										y2="13"
										stroke-linecap="round"
										stroke-linejoin="round"
									/>
									<line
										x1="16"
										y1="17"
										x2="8"
										y2="17"
										stroke-linecap="round"
										stroke-linejoin="round"
									/>
									<polyline points="10 9 9 9 8 9" stroke-linecap="round" stroke-linejoin="round" />
								</svg>
							</div>
							<div class="stat-details">
								<span class="stat-label">Modules Completed</span>
								<div class="stat-value-row">
									<span class="stat-number">{data.stats.totalTests}</span>
									<span class="stat-unit">missions</span>
								</div>
							</div>
						</div>

						<!-- Performance Card -->
						<div class="stat-card" in:scale={{ duration: 500, delay: 400, start: 0.9 }}>
							<div class="stat-icon-wrapper orange">
								<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
									<circle cx="12" cy="12" r="10" />
									<path d="M8 14s1.5 2 4 2 4-2 4-2" />
									<line x1="9" y1="9" x2="9.01" y2="9" />
									<line x1="15" y1="9" x2="15.01" y2="9" />
								</svg>
							</div>
							<div class="stat-details">
								<span class="stat-label">Performance Rating</span>
								<div class="stat-value-row">
									<span class="stat-number">{data.stats.averageScore}%</span>
									<span class="stat-grade">
										{#if data.stats.averageScore >= 90}A
										{:else if data.stats.averageScore >= 80}B
										{:else if data.stats.averageScore >= 70}C
										{:else}D{/if}
									</span>
								</div>
							</div>
						</div>
					</section>

					<!-- Quick Access -->
					<section class="panel actions-panel animate-on-scroll animate-delay-300">
						<div class="panel-header">
							<h2>Quick Access</h2>
						</div>
						<div class="actions-grid">
							<a href="/test-bay" class="action-tile">
								<img src="/icons/test-bay.png" alt="Test Bay" class="tile-icon" />
								<span>Test Bay</span>
							</a>
							<a href="/hangar-zone" class="action-tile">
								<img src="/icons/hangar-zone.png" alt="Hangar Zone" class="tile-icon" />
								<span>Hangar Zone</span>
							</a>
							<a href="/turbofan-engine" class="action-tile">
								<img src="/icons/turbofan-engine.png" alt="Turbofan Engine" class="tile-icon" />
								<span>Turbofan Engine</span>
							</a>
							<a href="/overhaul-station" class="action-tile">
								<img src="/icons/overhaul-station.png" alt="Overhaul Station" class="tile-icon" />
								<span>Overhaul Station</span>
							</a>

							<a href="/profile" class="action-tile">
								<img src="/icons/profile.svg" alt="Profile" class="tile-icon" />
								<span>Profile</span>
							</a>
						</div>
					</section>
				</div>
			</div>
		</div>
	</div>
</div>

<!-- Feedback Modal -->
{#if showFeedbackModal && selectedTest}
	<div
		class="modal-overlay"
		transition:fade={{ duration: 200 }}
		onclick={closeFeedback}
		role="button"
		tabindex="0"
		onkeydown={(e) => e.key === 'Escape' && closeFeedback()}
	>
		<div
			class="modal-card"
			onclick={(e) => e.stopPropagation()}
			onkeydown={(e) => e.stopPropagation()}
			transition:scale={{ duration: 300, start: 0.95, easing: quintOut }}
			role="dialog"
			aria-modal="true"
			tabindex="-1"
		>
			<div class="modal-header">
				<div>
					<h2
						class="modal-title font-heading text-2xl font-black tracking-wide text-slate-800 uppercase"
					>
						Mission Debrief
					</h2>
					<p class="modal-subtitle mt-1 text-sm font-bold tracking-widest text-slate-500 uppercase">
						{selectedTest.moduleName}
					</p>
				</div>
				<button
					class="btn-close flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-slate-500 transition-all hover:bg-slate-200 hover:text-slate-800"
					onclick={closeFeedback}
					aria-label="Close feedback"
				>
					<svg
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						stroke-width="2.5"
						class="h-5 w-5"
					>
						<line x1="18" y1="6" x2="6" y2="18"></line>
						<line x1="6" y1="6" x2="18" y2="18"></line>
					</svg>
				</button>
			</div>

			<div class="modal-body">
				<div class="score-banner {selectedTest.passed ? 'banner-pass' : 'banner-fail'}">
					<div class="score-value">{selectedTest.score}%</div>
					<div class="score-label">
						{selectedTest.passed ? 'MISSION ACCOMPLISHED' : 'MISSION FAILED'}
					</div>
				</div>

				{#if !aiFeedback && !isLoadingFeedback}
					<div class="ai-prompt">
						<p>Request AI analysis of mission performance?</p>
						<button class="btn-ai" onclick={getAiAnalysis}>
							<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
								<path
									d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"
								/>
							</svg>
							Analyze Data
						</button>
					</div>
				{/if}

				{#if isLoadingFeedback}
					<div class="loading-indicator">
						<div class="spinner"></div>
						<span>Processing mission data...</span>
					</div>
				{/if}

				{#if aiFeedback}
					<div
						class="ai-results mt-6 mb-8 rounded-2xl border border-indigo-100 bg-indigo-50/50 p-6"
						in:slide
					>
						<h3
							class="mb-4 flex items-center gap-2 text-lg font-black tracking-wide text-indigo-900 uppercase"
						>
							<span class="text-xl">🤖</span> AI Tactical Analysis
						</h3>
						<div class="flex flex-col gap-4">
							{#each aiFeedback as item}
								<div
									class="ai-item rounded-xl border border-white bg-white/80 p-5 shadow-sm transition-all hover:shadow-md"
								>
									<div class="ai-q mb-3 text-base font-bold text-slate-800">
										{item.questionText}
									</div>
									<div class="ai-exp mb-3 text-sm leading-relaxed text-slate-600">
										{item.explanation}
									</div>
									<div
										class="ai-topic inline-flex items-center gap-2 rounded-lg bg-indigo-100 px-3 py-1.5 text-xs font-bold tracking-wider text-indigo-700 uppercase"
									>
										<svg
											class="h-3 w-3"
											fill="none"
											viewBox="0 0 24 24"
											stroke="currentColor"
											stroke-width="3"
										>
											<path
												stroke-linecap="round"
												stroke-linejoin="round"
												d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
											/>
										</svg>
										Review: {item.topicToReview}
									</div>
								</div>
							{/each}
						</div>
					</div>
				{/if}

				<div class="questions-list">
					<h3>Flight Recorder Data</h3>
					{#if selectedTest.questions && selectedTest.questions.length > 0}
						{#each selectedTest.questions as q, i}
							<div class="q-item {q.userAnswer === q.correctAnswer ? 'q-correct' : 'q-incorrect'}">
								<div class="q-header">
									<span class="q-idx">#{i + 1}</span>
									<span class="q-status"
										>{q.userAnswer === q.correctAnswer ? 'CORRECT' : 'INCORRECT'}</span
									>
								</div>
								<p class="q-text">{q.questionText}</p>
								<div class="q-details">
									<div class="q-ans">
										<span class="label">Pilot Input:</span>
										<span class="val">{q.userAnswer}</span>
									</div>
									{#if q.userAnswer !== q.correctAnswer}
										<div class="q-ans correct">
											<span class="label">Optimal Input:</span>
											<span class="val">{q.correctAnswer}</span>
										</div>
									{/if}
								</div>
							</div>
						{/each}
					{:else}
						<p class="no-data">Telemetry data unavailable.</p>
					{/if}
				</div>
			</div>
		</div>
	</div>
{/if}

<style>
	.page-overlay {
		position: relative;
		padding: 2rem;
		padding-top: 2rem;
		min-height: calc(100vh - 5rem);
		width: 100%;
		box-sizing: border-box;
	}

	.dashboard-container {
		width: 100%;
		max-width: 1400px;
		min-height: auto;
		background: #ffffff;
		border-radius: 24px;
		box-shadow:
			0 25px 50px -12px rgba(0, 0, 0, 0.25),
			0 10px 15px -3px rgba(0, 0, 0, 0.1);
		flex-direction: column;
		margin: auto;
	}

	.dashboard-scroll-content {
		flex: 1;
		overflow-y: auto;
		padding: 1.5rem; /* Reduced from 2rem */
		display: flex;
		flex-direction: column;
		gap: 1rem; /* Reduced from 1.5rem */
		min-height: min-content;
	}

	/* 2-Column Grid Layout */
	.dashboard-grid {
		display: grid;
		grid-template-columns: 1.6fr 1fr; /* Left column wider than right */
		gap: 1.5rem;
		align-items: start;
	}

	/* Left Column - Mission Log */
	.left-column {
		display: flex;
		flex-direction: column;
	}

	/* Right Column - Stats + Quick Access */
	.right-column {
		display: flex;
		flex-direction: column;
		gap: 1.5rem;
	}

	/* Stats Column (Vertical Stack) */
	.stats-column {
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}

	/* Responsive: Single column on smaller screens */
	@media (max-width: 1024px) {
		.dashboard-grid {
			grid-template-columns: 1fr;
		}
	}

	.header-section {
		display: flex;
		align-items: center;
		gap: 1.5rem;
	}

	/* REMOVED @media (max-width: 768px) block entirely as mobile is now a separate HTML structure */

	.pilot-info {
		display: flex;
		align-items: center;
		gap: 1.5rem;
	}

	.avatar-ring {
		width: 80px;
		height: 80px;
		border-radius: 50%;
		padding: 3px;
		background: linear-gradient(135deg, #e2e8f0 0%, #cbd5e1 100%);
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
		font-size: 2rem;
		font-weight: 700;
		overflow: hidden; /* Added to clip image */
	}

	.avatar-img {
		width: 100%;
		height: 100%;
		object-fit: cover;
	}

	.text-content {
		display: flex;
		flex-direction: column;
	}

	.pilot-name {
		font-family: 'Poppins', sans-serif;
		font-size: 2rem;
		font-weight: 700;
		margin: 0;
		color: var(--font-primary);
		line-height: 1.2;
	}

	/* Date Widget */
	.date-widget {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		margin-top: 0.25rem;
		color: #64748b;
		font-size: 0.95rem;
		font-weight: 500;
	}

	.date-day {
		font-weight: 700;
		color: var(--font-primary);
	}

	.date-sep {
		opacity: 0.5;
	}

	@media (max-width: 768px) {
		/* Ensure cards are solid white on mobile */
		.stat-card {
			background: #ffffff !important;
			box-shadow:
				0 4px 6px -1px rgba(0, 0, 0, 0.05),
				0 2px 4px -1px rgba(0, 0, 0, 0.03) !important;
			border: none !important;
		}

		.activity-row {
			background: #ffffff !important;
			box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05) !important;
			border: none !important;
		}
	}

	.stat-card {
		background: #f8fafc;
		border: 1px solid #e2e8f0;
		border-radius: 16px; /* Reduced from 20px */
		padding: 1rem; /* Reduced from 1.5rem */
		display: flex;
		align-items: center;
		gap: 0.875rem; /* Reduced from 1rem */
		transition: transform 0.2s ease;
	}

	.stat-card:hover {
		transform: translateY(-4px);
		background: #ffffff;
		box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.05);
	}

	.stat-icon-wrapper {
		width: 48px;
		height: 48px;
		border-radius: 14px;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.stat-icon-wrapper svg {
		width: 24px;
		height: 24px;
	}

	.stat-icon-wrapper.blue {
		background: #e0f2fe;
		color: #0284c7;
	}
	.stat-icon-wrapper.green {
		background: #dcfce7;
		color: #16a34a;
	}
	.stat-icon-wrapper.orange {
		background: #ffedd5;
		color: #ea580c;
	}

	.stat-details {
		flex: 1;
	}

	.stat-label {
		display: block;
		font-size: 0.8rem;
		color: #64748b;
		text-transform: uppercase;
		font-weight: 700;
		letter-spacing: 0.5px;
		margin-bottom: 0.25rem;
	}

	.stat-value-row {
		display: flex;
		align-items: baseline;
		gap: 0.5rem;
	}

	.stat-number {
		font-size: 1.75rem;
		font-weight: 800;
		color: var(--font-primary);
		line-height: 1;
	}

	.stat-unit {
		font-size: 0.9rem;
		color: #94a3b8;
	}

	.stat-grade {
		font-size: 1.5rem;
		font-weight: 800;
		color: #ea580c;
	}

	.progress-track {
		width: 100%;
		height: 6px;
		background: #cbd5e1;
		border-radius: 3px;
		margin-top: 0.5rem;
		overflow: hidden;
	}

	.progress-bar {
		height: 100%;
		background: linear-gradient(90deg, #38bdf8, #818cf8);
		border-radius: 3px;
	}

	/* --- Panels --- */
	.panel-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 1rem;
		padding-bottom: 0.75rem;
		border-bottom: 2px solid #f1f5f9;
	}

	.panel-header h2 {
		font-family: 'Poppins', sans-serif;
		font-size: 1.25rem;
		margin: 0;
		color: var(--font-primary);
	}

	.view-all {
		font-size: 0.9rem;
		color: #38bdf8;
		text-decoration: none;
		font-weight: 600;
	}

	/* --- Activity List --- */
	.activity-list {
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
	}

	.activity-row {
		display: flex;
		align-items: center;
		gap: 0.875rem; /* Reduced from 1rem */
		padding: 0.875rem; /* Reduced from 1rem */
		background: #f8fafc;
		border-radius: 12px; /* Reduced from 14px */
		border: 1px solid #e2e8f0;
		transition: all 0.2s;
	}

	.activity-row:hover {
		border-color: #cbd5e1;
		background: #ffffff;
		transform: translateX(4px);
	}

	.activity-status-indicator {
		width: 4px;
		height: 36px;
		border-radius: 2px;
	}
	.activity-status-indicator.pass {
		background: #22c55e;
	}
	.activity-status-indicator.fail {
		background: #ef4444;
	}

	.activity-main {
		flex: 1;
		display: flex;
		justify-content: space-between;
		align-items: center;
	}

	.activity-type {
		display: block;
		font-size: 0.75rem;
		color: #94a3b8;
		text-transform: uppercase;
		font-weight: 700;
		letter-spacing: 0.5px;
	}

	.activity-title {
		margin: 0;
		font-size: 1.05rem;
		font-weight: 700;
		color: var(--font-primary);
	}

	.activity-meta {
		display: flex;
		align-items: center;
		gap: 1.5rem;
	}

	.activity-date {
		font-size: 0.85rem;
		color: #94a3b8;
	}

	.activity-score {
		font-size: 1rem;
		font-weight: 800;
	}
	.score-pass {
		color: #22c55e;
	}
	.score-fail {
		color: #ef4444;
	}

	.btn-icon {
		background: #ffffff;
		border: 1px solid #e2e8f0;
		color: #64748b;
		width: 36px;
		height: 36px;
		border-radius: 10px;
		display: flex;
		align-items: center;
		justify-content: center;
		cursor: pointer;
		transition: all 0.2s;
	}

	.btn-icon svg {
		width: 18px;
		height: 18px;
	}

	.btn-icon:hover {
		background: #eff6ff;
		color: #3b82f6;
		border-color: #bfdbfe;
	}

	.empty-state {
		text-align: center;
		padding: 2rem;
		color: #94a3b8;
	}
	.empty-icon-box {
		width: 48px;
		height: 48px;
		margin: 0 auto 1rem;
		color: #cbd5e1;
	}
	.empty-icon-box svg {
		width: 100%;
		height: 100%;
	}
	.btn-primary-small {
		display: inline-block;
		margin-top: 1rem;
		padding: 0.5rem 1rem;
		background: #0f172a;
		color: white;
		border-radius: 8px;
		text-decoration: none;
		font-size: 0.9rem;
		font-weight: 600;
	}

	/* --- Quick Actions --- */
	.actions-grid {
		display: grid;
		grid-template-columns: repeat(2, 1fr); /* Changed from 6 to 2 columns */
		gap: 0.875rem; /* Reduced from 1rem */
	}

	.action-tile {
		background: #f8fafc;
		border: 1px solid #e2e8f0;
		border-radius: 14px; /* Reduced from 16px */
		padding: 1rem 0.5rem; /* Reduced from 1.25rem */
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 0.625rem; /* Reduced from 0.75rem */
		text-decoration: none;
		color: var(--font-primary);
		transition: all 0.2s;
		text-align: center;
	}

	.action-tile:hover {
		background: #ffffff;
		transform: translateY(-4px);
		border-color: #cbd5e1;
		box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
	}

	.tile-icon {
		width: 48px;
		height: 48px;
		object-fit: contain;
	}

	.action-tile span {
		font-size: 0.85rem;
		font-weight: 700;
		color: var(--sky-text);
		line-height: 1.2;
	}

	/* --- Feedback Modal (Simplified for Context) --- */
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
		max-width: 600px;
		max-height: 90vh;
		border-radius: 20px;
		overflow: hidden;
		display: flex;
		flex-direction: column;
	}
	.modal-header {
		padding: 1.5rem;
		border-bottom: 1px solid #e2e8f0;
		display: flex;
		justify-content: space-between;
		align-items: flex-start;
	}
	.modal-title {
		font-size: 1.25rem;
		color: #0f172a;
		margin: 0;
	}
	.modal-subtitle {
		color: #64748b;
		margin: 0.25rem 0 0;
		font-size: 0.9rem;
	}
	.btn-close {
		background: none;
		border: none;
		cursor: pointer;
		color: #94a3b8;
		padding: 0.5rem;
	}
	.btn-close:hover {
		color: #ef4444;
	}
	.btn-close svg {
		width: 24px;
		height: 24px;
	}
	.modal-body {
		padding: 1.5rem;
		overflow-y: auto;
	}
	.score-banner {
		padding: 1rem;
		border-radius: 12px;
		text-align: center;
		margin-bottom: 2rem;
	}
	.score-banner.banner-pass {
		background: #f0fdf4;
		color: #166534;
		border: 1px solid #bbf7d0;
	}
	.score-banner.banner-fail {
		background: #fef2f2;
		color: #991b1b;
		border: 1px solid #fecaca;
	}
	.score-value {
		font-size: 2rem;
		font-weight: 800;
	}
	.score-label {
		font-weight: 700;
		letter-spacing: 1px;
	}
	.questions-list {
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}
	.q-item {
		padding: 1rem;
		border-radius: 12px;
		background: #f8fafc;
		border: 1px solid #e2e8f0;
	}
	.q-correct {
		border-left: 4px solid #22c55e;
	}
	.q-incorrect {
		border-left: 4px solid #ef4444;
	}
	.q-header {
		display: flex;
		justify-content: space-between;
		margin-bottom: 0.5rem;
		font-size: 0.85rem;
		font-weight: 700;
	}
	.q-text {
		font-weight: 600;
		color: #0f172a;
		margin: 0 0 1rem;
	}
	.q-details {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
		font-size: 0.9rem;
	}
	.q-ans .label {
		color: #64748b;
		margin-right: 0.5rem;
	}
	.q-ans .val {
		font-weight: 600;
		color: #334155;
	}
	.btn-ai {
		width: 100%;
		padding: 0.75rem;
		background: linear-gradient(135deg, #6366f1, #8b5cf6);
		color: white;
		border: none;
		border-radius: 12px;
		font-weight: 600;
		cursor: pointer;
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 0.5rem;
	}
	.btn-ai:hover {
		opacity: 0.9;
	}
	.btn-ai svg {
		width: 18px;
		height: 18px;
	}

	/* Responsive Overlay & Layout handled above */
</style>
