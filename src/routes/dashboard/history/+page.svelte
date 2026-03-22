<script lang="ts">
	import { onMount } from 'svelte';
	import type { PageData } from './$types';
	import { fade, fly, slide, scale } from 'svelte/transition';
	import { quintOut } from 'svelte/easing';
	import SkyBackground from '$lib/components/ui/SkyBackground.svelte';

	let { data } = $props<{ data: PageData }>();

	// --- State ---
	let selectedTest = $state<any>(null);
	let showFeedbackModal = $state(false);
	let aiFeedback = $state<any[] | null>(null);
	let isLoadingFeedback = $state(false);
	let searchQuery = $state('');
	let filterType = $state('all'); // 'all', 'test', 'simulation'

	// --- Derived ---
	let filteredActivity = $derived(
		data.allActivity.filter((item: any) => {
			const matchesSearch = item.moduleName.toLowerCase().includes(searchQuery.toLowerCase());
			const matchesFilter = filterType === 'all' || item.type === filterType;
			return matchesSearch && matchesFilter;
		})
	);

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
			aiFeedback = data.feedback;
		} catch (e) {
			console.error('Error getting AI feedback:', e);
		} finally {
			isLoadingFeedback = false;
		}
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

<!-- ==================== MOBILE LAYOUT (Dark Glass) ==================== -->
<div
	class="fixed inset-0 z-10 flex flex-col overflow-y-auto bg-transparent px-6 pt-20 pb-24 md:hidden"
>
	<!-- Header -->
	<header class="mb-6 flex items-center justify-between">
		<div>
			<h1 class="text-3xl font-black tracking-tight text-white drop-shadow-lg">Mission History</h1>
			<p class="mt-1 text-sm font-semibold tracking-wide text-sky-300">Review your performance</p>
		</div>
		<a
			href="/dashboard"
			class="flex h-10 w-10 items-center justify-center rounded-full bg-slate-800/80 text-white shadow-lg backdrop-blur-md transition-transform active:scale-95"
			aria-label="Back to Dashboard"
		>
			<svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
				<path stroke-linecap="round" stroke-linejoin="round" d="M15 19l-7-7 7-7" />
			</svg>
		</a>
	</header>

	<!-- Search & Filter -->
	<div class="mb-6 space-y-3">
		<div class="relative">
			<svg
				class="absolute top-1/2 left-4 h-5 w-5 -translate-y-1/2 text-slate-400"
				fill="none"
				viewBox="0 0 24 24"
				stroke="currentColor"
			>
				<path
					stroke-linecap="round"
					stroke-linejoin="round"
					stroke-width="2"
					d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
				/>
			</svg>
			<input
				type="text"
				placeholder="Search missions..."
				bind:value={searchQuery}
				class="w-full rounded-xl border border-white/10 bg-slate-900/60 py-3 pr-4 pl-12 text-white placeholder-slate-400 shadow-inner backdrop-blur-md focus:border-sky-400 focus:ring-1 focus:ring-sky-400 focus:outline-none"
			/>
		</div>

		<div class="flex gap-2 overflow-x-auto pb-2">
			{#each ['all', 'test', 'simulation'] as type}
				<button
					class="rounded-lg px-4 py-2 text-sm font-bold tracking-wide uppercase transition-all {filterType ===
					type
						? 'bg-sky-500 text-white shadow-lg shadow-sky-500/30'
						: 'border border-white/5 bg-slate-900/60 text-slate-400 hover:bg-slate-800/80 hover:text-white'}"
					onclick={() => (filterType = type)}
				>
					{type === 'all' ? 'All' : type === 'test' ? 'Assessments' : 'Simulations'}
				</button>
			{/each}
		</div>
	</div>

	<!-- History List (Mobile) -->
	<div class="flex flex-col gap-4">
		{#if filteredActivity.length > 0}
			{#each filteredActivity as activity, i}
				<div
					class="relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-slate-900/80 to-slate-900/60 p-4 shadow-lg backdrop-blur-xl transition-all active:scale-[0.98]"
					in:slide={{ axis: 'y', duration: 300, delay: i * 50 }}
				>
					<div class="flex items-start gap-4">
						<div
							class="h-12 w-1.5 shrink-0 rounded-full {activity.passed
								? 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]'
								: 'bg-rose-500 shadow-[0_0_10px_rgba(244,63,94,0.5)]'}"
						></div>
						<div class="flex-1">
							<div class="mb-1 flex items-start justify-between">
								<div>
									<span
										class="block text-[10px] font-bold tracking-widest uppercase {activity.type ===
										'test'
											? 'text-sky-400'
											: 'text-amber-400'}"
									>
										{activity.type === 'test' ? 'Assessment' : 'Simulation'}
									</span>
									<h3 class="text-lg font-bold text-white shadow-black drop-shadow-md">
										{activity.moduleName}
									</h3>
								</div>
								<div
									class="rounded-lg px-2 py-1 text-sm font-black {activity.passed
										? 'border border-emerald-500/30 bg-emerald-500/20 text-emerald-400'
										: 'border border-rose-500/30 bg-rose-500/20 text-rose-400'}"
								>
									{activity.score}%
								</div>
							</div>
							<div class="mt-2 flex items-center justify-between">
								<span class="text-xs text-slate-400">
									{new Date(activity.date).toLocaleDateString()} • {new Date(
										activity.date
									).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
								</span>
								<button
									class="rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-bold text-white transition-colors hover:bg-white/10"
									onclick={() => openFeedback(activity)}
								>
									Debrief
								</button>
							</div>
						</div>
					</div>
				</div>
			{/each}
		{:else}
			<div class="mt-8 text-center text-slate-400">
				<p>No missions found matching your search.</p>
			</div>
		{/if}
	</div>
</div>

<!-- ==================== DESKTOP LAYOUT (Clean White Card) ==================== -->
<div class="page-overlay hidden md:block">
	<div class="history-card" in:fly={{ y: 20, duration: 600 }}>
		<header class="card-header">
			<div class="header-left">
				<a href="/dashboard" class="back-link group">
					<div
						class="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 transition-colors group-hover:bg-slate-200"
					>
						<svg
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							stroke-width="2"
							class="h-4 w-4 text-slate-600 group-hover:text-slate-900"
						>
							<path d="M19 12H5M12 19l-7-7 7-7" />
						</svg>
					</div>
					<span class="font-medium text-slate-600 group-hover:text-slate-900"
						>Back to Dashboard</span
					>
				</a>
				<h1 class="mt-4 text-3xl font-bold text-slate-900">Mission History</h1>
			</div>

			<div class="filter-controls">
				<!-- Search -->
				<div class="relative">
					<svg
						class="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-slate-400"
						fill="none"
						viewBox="0 0 24 24"
						stroke="currentColor"
					>
						<circle cx="11" cy="11" r="8"></circle>
						<line x1="21" y1="21" x2="16.65" y2="16.65"></line>
					</svg>
					<input
						type="text"
						placeholder="Search missions..."
						bind:value={searchQuery}
						class="w-64 rounded-lg border border-slate-200 bg-white py-2 pr-4 pl-10 text-sm font-medium text-slate-700 shadow-sm transition-all focus:border-sky-500 focus:ring-1 focus:ring-sky-500 focus:outline-none"
					/>
				</div>

				<!-- Custom Dropdown (Select Wrapper for simplicity but styled) -->
				<div class="relative">
					<select
						bind:value={filterType}
						class="cursor-pointer appearance-none rounded-lg border border-slate-200 bg-white py-2 pr-10 pl-4 text-sm font-bold text-slate-700 shadow-sm transition-all hover:bg-slate-50 focus:border-sky-500 focus:ring-1 focus:ring-sky-500 focus:outline-none"
					>
						<option value="all">All Types</option>
						<option value="test">Assessments</option>
						<option value="simulation">Simulations</option>
					</select>
					<div
						class="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-slate-500"
					>
						<svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M19 9l-7 7-7-7"
							/>
						</svg>
					</div>
				</div>
			</div>
		</header>

		<div class="history-list">
			{#if filteredActivity.length > 0}
				{#each filteredActivity as activity, i}
					<div class="activity-row group" in:slide={{ axis: 'y', duration: 300, delay: i * 50 }}>
						<div class="activity-status-indicator {activity.passed ? 'pass' : 'fail'}"></div>
						<div class="activity-main">
							<div class="activity-info">
								<span
									class="activity-type {activity.type === 'test'
										? 'text-sky-600'
										: 'text-amber-600'}"
								>
									{activity.type === 'test' ? 'Assessment' : 'Simulation'}
								</span>
								<h3 class="activity-title transition-colors group-hover:text-blue-600">
									{activity.moduleName}
								</h3>
								<span class="activity-date"
									>{new Date(activity.date).toLocaleDateString()} at {new Date(
										activity.date
									).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span
								>
							</div>

							<div class="activity-stats">
								<div class="score-badge {activity.passed ? 'score-pass' : 'score-fail'}">
									{activity.score}%
								</div>
							</div>
						</div>

						<button class="btn-details" onclick={() => openFeedback(activity)}>
							View Debrief
						</button>
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
					<p>No mission records found.</p>
				</div>
			{/if}
		</div>
	</div>
</div>

<!-- Feedback Modal (Shared) -->
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
					<h2 class="modal-title">Mission Debrief</h2>
					<p class="modal-subtitle">{selectedTest.moduleName}</p>
				</div>
				<button class="btn-close" onclick={closeFeedback} aria-label="Close debrief">
					<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
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
					<div class="ai-results" in:slide>
						<h3>AI Tactical Analysis</h3>
						{#each aiFeedback as item}
							<div class="ai-item">
								<div class="ai-q">{item.questionText}</div>
								<div class="ai-exp">{item.explanation}</div>
								<div class="ai-topic">Review: {item.topicToReview}</div>
							</div>
						{/each}
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
	/* Custom styles for desktop that Tailwind can't easily replace without full rewrite */
	.page-overlay {
		position: relative;
		padding: 2rem;
		padding-top: 6rem;
		min-height: 100vh;
		width: 100%;
		box-sizing: border-box;
	}

	.history-card {
		width: 100%;
		max-width: 1000px;
		min-height: auto;
		background: #ffffff;
		border-radius: 24px;
		box-shadow:
			0 25px 50px -12px rgba(0, 0, 0, 0.25),
			0 10px 15px -3px rgba(0, 0, 0, 0.1);
		display: flex;
		flex-direction: column;
		margin: 0 auto 2rem auto;
	}

	.card-header {
		padding: 2rem;
		border-bottom: 1px solid #e2e8f0;
		display: flex;
		justify-content: space-between;
		align-items: center;
		background: #f8fafc;
		border-top-left-radius: 24px;
		border-top-right-radius: 24px;
	}

	.header-left {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}

	.back-link {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		text-decoration: none;
		font-size: 0.9rem;
	}

	.filter-controls {
		display: flex;
		gap: 1rem;
		align-items: center;
	}

	.history-list {
		flex: 1;
		overflow-y: auto;
		padding: 2rem;
		display: flex;
		flex-direction: column;
		gap: 1rem;
		background: #ffffff;
		border-bottom-left-radius: 24px;
		border-bottom-right-radius: 24px;
	}

	.activity-row {
		display: flex;
		align-items: center;
		gap: 1rem;
		padding: 1rem;
		background: #f8fafc;
		border-radius: 14px;
		border: 1px solid #e2e8f0;
		transition: all 0.2s;
	}

	.activity-row:hover {
		border-color: #cbd5e1;
		background: #ffffff;
		transform: translateX(4px);
		box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
	}

	.activity-status-indicator {
		width: 4px;
		height: 48px;
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
		text-transform: uppercase;
		font-weight: 700;
		letter-spacing: 0.5px;
		margin-bottom: 0.25rem;
	}

	.activity-title {
		margin: 0;
		font-size: 1.15rem;
		font-weight: 700;
		color: #0f172a;
	}

	.activity-date {
		display: block;
		font-size: 0.85rem;
		color: #64748b;
		margin-top: 0.25rem;
	}

	.activity-stats {
		margin-right: 2rem;
	}

	.score-badge {
		font-size: 1.5rem;
		font-weight: 800;
		padding: 0.25rem 0.75rem;
		border-radius: 8px;
		background: #ffffff;
		border: 1px solid #e2e8f0;
	}
	.score-pass {
		color: #22c55e;
		background: #f0fdf4;
		border-color: #bbf7d0;
	}
	.score-fail {
		color: #ef4444;
		background: #fef2f2;
		border-color: #fecaca;
	}

	.btn-details {
		padding: 0.6rem 1.2rem;
		background: #ffffff;
		border: 1px solid #e2e8f0;
		border-radius: 10px;
		font-weight: 600;
		color: #475569;
		cursor: pointer;
		transition: all 0.2s;
	}

	.btn-details:hover {
		background: #f1f5f9;
		color: #0f172a;
		border-color: #cbd5e1;
	}

	.empty-state {
		text-align: center;
		padding: 4rem 2rem;
		color: #94a3b8;
	}
	.empty-icon-box {
		width: 64px;
		height: 64px;
		margin: 0 auto 1.5rem;
		color: #cbd5e1;
	}
	.empty-icon-box svg {
		width: 100%;
		height: 100%;
	}

	/* Modal Styles kept as is for consistency */
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
		padding: 1.5rem;
		border-radius: 16px;
		text-align: center;
		margin-bottom: 1.5rem;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
	}
	.score-banner.banner-pass {
		background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%);
		border: 1px solid #bbf7d0;
		color: #166534;
	}
	.score-banner.banner-fail {
		background: linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%);
		border: 1px solid #fecaca;
		color: #991b1b;
	}
	.score-value {
		font-size: 3rem;
		font-weight: 800;
		line-height: 1;
		margin-bottom: 0.5rem;
	}
	.score-label {
		font-size: 0.85rem;
		font-weight: 700;
		letter-spacing: 1px;
		opacity: 0.8;
	}

	.questions-list {
		margin-top: 1.5rem;
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}
	.questions-list h3 {
		font-size: 1rem;
		font-weight: 700;
		color: #0f172a;
		margin: 0 0 0.5rem 0;
		text-transform: uppercase;
		letter-spacing: 0.5px;
	}
	.q-item {
		background: #f8fafc;
		border: 1px solid #e2e8f0;
		border-radius: 12px;
		padding: 1rem;
		transition: all 0.2s;
	}
	.q-item.q-correct {
		border-left: 4px solid #22c55e;
	}
	.q-item.q-incorrect {
		border-left: 4px solid #ef4444;
	}
	.q-header {
		display: flex;
		justify-content: space-between;
		margin-bottom: 0.5rem;
	}
	.q-idx {
		font-size: 0.85rem;
		font-weight: 700;
		color: #94a3b8;
	}
	.q-status {
		font-size: 0.75rem;
		font-weight: 800;
	}
	.q-correct .q-status {
		color: #22c55e;
	}
	.q-incorrect .q-status {
		color: #ef4444;
	}

	.q-text {
		font-size: 1rem;
		font-weight: 600;
		color: #334155;
		margin: 0 0 0.75rem 0;
		line-height: 1.5;
	}
	.q-details {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
		font-size: 0.9rem;
	}
	.q-ans {
		display: flex;
		gap: 0.5rem;
	}
	.q-ans .label {
		color: #64748b;
		font-weight: 500;
		min-width: 80px;
	}
	.q-ans .val {
		color: #0f172a;
		font-weight: 600;
	}
	.q-ans.correct .val {
		color: #22c55e;
	}
	.ai-prompt {
		background: #eff6ff;
		border: 1px solid #bfdbfe;
		border-radius: 12px;
		padding: 1rem;
		margin-bottom: 1.5rem;
		display: flex;
		justify-content: space-between;
		align-items: center;
	}
	.ai-prompt p {
		margin: 0;
		color: #1e3a8a;
		font-weight: 600;
		font-size: 0.95rem;
	}
	.btn-ai {
		background: #3b82f6;
		color: white;
		border: none;
		padding: 0.5rem 1rem;
		border-radius: 8px;
		font-weight: 600;
		display: flex;
		align-items: center;
		gap: 0.5rem;
		cursor: pointer;
		transition: background 0.2s;
	}
	.btn-ai:hover {
		background: #2563eb;
	}
	.btn-ai svg {
		width: 18px;
		height: 18px;
	}

	.ai-results {
		background: #f0fdf4;
		border: 1px solid #bbf7d0;
		border-radius: 12px;
		padding: 1.5rem;
		margin-bottom: 1.5rem;
	}
	.ai-results h3 {
		color: #166534;
		margin: 0 0 1rem 0;
		font-size: 1.1rem;
	}
	.ai-item {
		margin-bottom: 1rem;
		padding-bottom: 1rem;
		border-bottom: 1px solid #dcfce7;
	}
	.ai-item:last-child {
		margin-bottom: 0;
		padding-bottom: 0;
		border-bottom: none;
	}
	.ai-q {
		font-weight: 600;
		color: #15803d;
		margin-bottom: 0.25rem;
		font-size: 0.95rem;
	}
	.ai-exp {
		color: #14532d;
		font-size: 0.95rem;
		line-height: 1.5;
		margin-bottom: 0.5rem;
	}
	.ai-topic {
		font-size: 0.85rem;
		font-weight: 600;
		text-transform: uppercase;
		color: #15803d;
		letter-spacing: 0.5px;
	}

	.loading-indicator {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 1rem;
		padding: 2rem;
		color: #64748b;
	}
	.spinner {
		width: 40px;
		height: 40px;
		border: 4px solid #e2e8f0;
		border-top-color: #3b82f6;
		border-radius: 50%;
		animation: spin 1s linear infinite;
	}
	@keyframes spin {
		to {
			transform: rotate(360deg);
		}
	}
</style>
