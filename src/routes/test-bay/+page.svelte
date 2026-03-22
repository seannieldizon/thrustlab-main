<script lang="ts">
	import SkyBackground from '$lib/components/ui/SkyBackground.svelte';

	import type { PageData } from './$types';
	import { onMount } from 'svelte';
	let { data } = $props<{ data: PageData }>();

	type Question = {
		id: number;
		text: string;
		options: string[];
		correctAnswer: number; // index of correct option (0-3)
	};

	type Module = {
		id: number;
		title: string;
		description: string;
		icon: string;
		questions: Question[];
	};

	let modules = $derived(data.modules);

	// State management
	let viewState = $state<'selection' | 'quiz' | 'results'>('selection');
	let selectedModule = $state<Module | null>(null);
	let currentQuestionIndex = $state(0);
	let userAnswers = $state<(number | null)[]>([]);
	let score = $state(0);
	let showReview = $state(false);

	type FeedbackItem = {
		questionText: string;
		explanation: string;
		topicToReview: string;
	};

	let aiFeedback = $state<FeedbackItem[] | null>(null);
	let isLoadingFeedback = $state(false);

	function escapeHtml(text: string) {
		return text
			.replace(/&/g, '&amp;')
			.replace(/</g, '&lt;')
			.replace(/>/g, '&gt;')
			.replace(/"/g, '&quot;')
			.replace(/'/g, '&#39;');
	}

	function applyInlineFormatting(text: string) {
		let formatted = escapeHtml(text);
		// Bold: **text** or __text__
		formatted = formatted.replace(/(\*\*|__)(.*?)\1/g, '<strong>$2</strong>');
		// Italic: *text* or _text_
		formatted = formatted.replace(/(\*|_)(.*?)\1/g, '<em>$2</em>');
		return formatted;
	}

	function formatAiExplanation(rawText: string) {
		if (!rawText) return '';
		const lines = rawText.split(/\r?\n/);
		let html = '';
		let listType: 'ul' | 'ol' | null = null;

		const closeList = () => {
			if (listType) {
				html += `</${listType}>`;
				listType = null;
			}
		};

		for (const original of lines) {
			const line = original.trim();
			if (!line) {
				closeList();
				continue;
			}

			// Headers
			const headerMatch = line.match(/^(#{1,6})\s+(.+)/);
			if (headerMatch) {
				closeList();
				const level = headerMatch[1].length;
				html += `<h${level}>${applyInlineFormatting(headerMatch[2])}</h${level}>`;
				continue;
			}

			// Unordered List
			if (/^(\*|-)\s+/.test(line)) {
				if (listType !== 'ul') {
					closeList();
					listType = 'ul';
					html += '<ul>';
				}
				const content = line.replace(/^(\*|-)\s+/, '');
				html += `<li>${applyInlineFormatting(content)}</li>`;
				continue;
			}

			// Ordered List
			if (/^\d+[\.)]\s+/.test(line)) {
				if (listType !== 'ol') {
					closeList();
					listType = 'ol';
					html += '<ol>';
				}
				const content = line.replace(/^\d+[\.)]\s+/, '');
				html += `<li>${applyInlineFormatting(content)}</li>`;
				continue;
			}

			closeList();
			html += `<p>${applyInlineFormatting(line)}</p>`;
		}

		closeList();
		return html;
	}

	// Derived state for current question
	let currentQuestion = $derived(selectedModule?.questions?.[currentQuestionIndex]);

	function shuffleArray<T>(array: T[]): T[] {
		const newArray = [...array];
		for (let i = newArray.length - 1; i > 0; i--) {
			const j = Math.floor(Math.random() * (i + 1));
			[newArray[i], newArray[j]] = [newArray[j], newArray[i]];
		}
		return newArray;
	}

	function getModuleColor(moduleId: number): string {
		const colors = ['#00CED1', '#4CAF50', '#D35400', '#FFD966'];
		return colors[(moduleId - 1) % colors.length];
	}

	function startModule(module: Module) {
		// Clone the module to avoid mutating the original data
		const moduleClone = { ...module, questions: [...module.questions] };

		// Shuffle questions
		moduleClone.questions = shuffleArray(moduleClone.questions);

		// Shuffle options for each question
		moduleClone.questions = moduleClone.questions.map((q) => {
			const originalCorrectAnswer = q.options[q.correctAnswer];
			const shuffledOptions = shuffleArray(q.options);
			const newCorrectAnswerIndex = shuffledOptions.indexOf(originalCorrectAnswer);

			return {
				...q,
				options: shuffledOptions,
				correctAnswer: newCorrectAnswerIndex
			};
		});

		selectedModule = moduleClone;
		userAnswers = new Array(moduleClone.questions.length).fill(null);
		currentQuestionIndex = 0;
		viewState = 'quiz';
		showReview = false;
	}

	function selectAnswer(answerIndex: number) {
		userAnswers[currentQuestionIndex] = answerIndex;
	}

	function nextQuestion() {
		if (selectedModule && currentQuestionIndex < selectedModule.questions.length - 1) {
			currentQuestionIndex++;
		}
	}

	function previousQuestion() {
		if (currentQuestionIndex > 0) {
			currentQuestionIndex--;
		}
	}

	async function submitTest() {
		if (!selectedModule) return;

		let correctCount = 0;
		const questionsDetails: any[] = [];

		selectedModule.questions.forEach((q, idx) => {
			const userAnswerIdx = userAnswers[idx];
			if (userAnswerIdx === q.correctAnswer) {
				correctCount++;
			}

			if (userAnswerIdx !== null && userAnswerIdx !== undefined) {
				questionsDetails.push({
					questionText: q.text,
					options: q.options,
					correctAnswer: q.options[q.correctAnswer],
					userAnswer: q.options[userAnswerIdx]
				});
			}
		});

		score = Math.round((correctCount / selectedModule.questions.length) * 100);
		viewState = 'results';
		aiFeedback = null;

		// Submit to backend
		try {
			const response = await fetch('/api/submit-test', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({
					moduleNo: selectedModule.id,
					moduleName: selectedModule.title,
					totalQuestions: selectedModule.questions.length,
					questionsCorrect: correctCount,
					questionsIncorrect: selectedModule.questions.length - correctCount,
					marks: score,
					questions: questionsDetails
				})
			});

			if (!response.ok) {
				console.error('Failed to submit test results');
			}
		} catch (e) {
			console.error('Error submitting test:', e);
		}

		// Get AI Feedback for incorrect answers
		const incorrectQuestions = questionsDetails.filter((q) => q.userAnswer !== q.correctAnswer);
		if (incorrectQuestions.length > 0) {
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
	}

	function retakeTest() {
		if (selectedModule) {
			startModule(selectedModule);
		}
	}

	function backToSelection() {
		selectedModule = null;
		currentQuestionIndex = 0;
		userAnswers = [];
		score = 0;
		showReview = false;
		viewState = 'selection';
	}

	function toggleReview() {
		showReview = !showReview;
	}

	$effect(() => {
		// Scroll to top when changing questions or views
		window.scrollTo({ top: 0, behavior: 'smooth' });

		// Re-trigger animations when returning to selection view
		if (viewState === 'selection') {
			setTimeout(() => {
				const animateElements = document.querySelectorAll(
					'.animate-on-scroll, .animate-slide-left, .animate-slide-right, .animate-scale, .animate-fade'
				);
				animateElements.forEach((el) => el.classList.add('visible'));
			}, 100);
		}
	});

	onMount(() => {
		document.body.classList.add('zone-testbay');

		// Safety: Ensure scrolling is enabled when page loads
		if (typeof document !== 'undefined') {
			document.body.classList.remove('page-transitioning');
			document.body.style.removeProperty('overflow');
			document.documentElement.style.removeProperty('overflow');
			console.log('Test Bay mounted - scroll enabled');
		}

		return () => {
			document.body.classList.remove('zone-testbay');
			// Safety: Ensure scroll remains enabled on cleanup
			if (typeof document !== 'undefined') {
				document.body.style.removeProperty('overflow');
				document.documentElement.style.removeProperty('overflow');
			}
		};
	});
</script>

<SkyBackground dawn={true} />

<div
	class="relative z-10 mx-auto min-h-screen max-w-[1400px] px-4 pt-16 pb-24 md:px-8 md:pt-20 md:pb-16"
>
	{#if viewState === 'selection'}
		<!-- Module Selection View -->
		<div class="content-wrapper animate-on-scroll mx-auto max-w-7xl">
			<h1
				class="page-title animate-on-scroll animate-gradient-flash gradient-animated font-heading mb-6 text-center text-5xl font-black tracking-tight drop-shadow-[0_4px_10px_rgba(132,97,244,0.4)] md:text-8xl"
			>
				Test Bay
			</h1>
			<p
				class="animate-on-scroll animate-delay-100 mx-auto mb-8 max-w-[900px] text-center text-xl leading-relaxed font-bold text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] md:text-2xl"
				style="font-family: 'Gotham', 'Gotham Bold', sans-serif;"
			>
				Welcome to the Test Bay, where learning turns into a challenge. Here, students face
				<span style="color: var(--testbay-accent);"
					>interactive assessments designed to gauge their understanding</span
				> of the Hangar Zone, Turbofan Engine Zone, and Overhaul Bay. It's not just an activity—it's a
				test of mastery, confidence, and readiness to take flight.
			</p>

			<div
				class="info-card animate-on-scroll mb-8 flex min-h-[220px] flex-col items-center justify-center gap-0 rounded-[25px] border-2 border-white/50 bg-white p-6 pb-0 shadow-lg transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl md:flex-row-reverse md:items-center md:gap-8 md:p-8 md:pb-8"
			>
				<div class="info-content max-w-2xl flex-1">
					<h3 class="font-heading mb-6 text-2xl font-black text-[#1b3558]">
						Assessment Info – Here's What You Need to Know:
					</h3>
					<ul class="m-0 list-none p-0">
						<li
							class="font-body relative mb-3 pl-8 text-base leading-relaxed text-[#222831] before:absolute before:left-2 before:text-[#4caf50] before:content-['▶']"
						>
							Each module has 10 multiple-choice questions – a quick dive into your knowledge!
						</li>
						<li
							class="font-body relative mb-3 pl-8 text-base leading-relaxed text-[#222831] before:absolute before:left-2 before:text-[#4caf50] before:content-['▶']"
						>
							You can navigate freely between questions before hitting submit.
						</li>
						<li
							class="font-body relative mb-3 pl-8 text-base leading-relaxed text-[#222831] before:absolute before:left-2 before:text-[#4caf50] before:content-['▶']"
						>
							After submission, you'll get a chance to review your answers and see how you did.
						</li>
						<li
							class="font-body relative mb-3 pl-8 text-base leading-relaxed text-[#222831] before:absolute before:left-2 before:text-[#4caf50] before:content-['▶']"
						>
							Want a better score? Retake any module to improve and master the material!
						</li>
					</ul>
				</div>
				<div
					class="jaja-character flex h-[180px] w-[180px] shrink-0 items-center justify-center md:h-[220px] md:w-[220px]"
				>
					<img
						src="/images/jaja-standing.png"
						alt="JAJA Character"
						class="h-full w-auto object-contain drop-shadow-md"
					/>
				</div>
			</div>

			<div
				class="test-grid animate-on-scroll animate-delay-300 grid grid-cols-1 gap-6 md:grid-cols-3"
			>
				{#each modules as module, idx}
					<div
						class="test-card module-{module.id} group relative flex flex-col items-center justify-center overflow-hidden rounded-[25px] border-3 bg-white p-8 text-center shadow-lg transition-all duration-400 hover:-translate-y-2 hover:scale-[1.02] hover:shadow-2xl"
						style="--delay: {idx * 0.1}s; border-color: {[
							'#00CED1',
							'#4CAF50',
							'#D35400',
							'#FFD966'
						][idx % 4]};"
					>
						<h3
							class="font-heading mb-2 font-bold"
							style="color: {['#00CED1', '#4CAF50', '#D35400', '#FFD966'][idx % 4]};"
						>
							MODULE {String(module.id).padStart(2, '0')}:
						</h3>
						<h4
							class="font-heading mb-4 text-2xl font-black md:text-3xl"
							style="color: {['#00CED1', '#4CAF50', '#D35400', '#FFD966'][idx % 4]};"
						>
							{module.title.toUpperCase()}
						</h4>
						<p class="font-body mb-6 text-sm text-[#222831]/80 md:text-base">
							{module.description}
						</p>
						<button
							class="start-button rounded-full px-8 py-3 font-bold text-white transition-all hover:scale-105 hover:shadow-lg"
							style="background-color: {['#00CED1', '#4CAF50', '#D35400', '#FFD966'][idx % 4]};"
							onclick={() => startModule(module)}
						>
							START ASSESSMENT
						</button>
					</div>
				{/each}
			</div>
		</div>
	{:else if viewState === 'quiz' && selectedModule}
		<!-- Quiz View -->
		<div
			class="quiz-container mx-auto flex min-h-screen max-w-[1200px] flex-col justify-center px-4 pt-16 pb-12 md:px-8 md:pt-20"
		>
			<!-- Main Question Card (Unified) -->
			{#if currentQuestion}
				<div
					class="relative overflow-hidden rounded-[3rem] border-4 bg-white p-8 shadow-2xl md:p-12"
					style="border-color: {getModuleColor(selectedModule.id)};"
				>
					<!-- Internal Header -->
					<div
						class="mb-8 flex flex-col justify-between gap-4 border-b border-gray-100 pb-6 md:flex-row md:items-center"
					>
						<button
							class="font-heading group flex items-center gap-2 text-lg font-bold transition-all hover:-translate-x-1"
							style="color: var(--testbay-accent);"
							onclick={backToSelection}
						>
							<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor">
								<path
									d="M19 12H5M12 19l-7-7 7-7"
									stroke-width="2.5"
									stroke-linecap="round"
									stroke-linejoin="round"
								/>
							</svg>
							Back to Modules
						</button>
						<h2
							class="font-heading text-xl font-extrabold uppercase md:text-2xl"
							style="color: var(--testbay-accent);"
						>
							Module {selectedModule.id}: {selectedModule.title}
						</h2>
					</div>
					<!-- Progress Bar -->
					<div class="mb-8">
						<div class="mb-2 flex items-center justify-end">
							<span class="font-heading text-sm font-bold text-[#1b3558]/70">
								Question {currentQuestionIndex + 1} of {selectedModule.questions.length}
							</span>
						</div>
						<div class="h-2 w-full overflow-hidden rounded-full bg-gray-100">
							<div
								class="h-full rounded-full bg-[#2196f3] transition-all duration-300 ease-out"
								style="width: {((currentQuestionIndex + 1) / selectedModule.questions.length) *
									100}%;"
							></div>
						</div>
					</div>

					<h3
						class="font-heading mb-10 text-2xl leading-tight font-black text-[#1b3558] md:text-3xl"
					>
						{currentQuestionIndex + 1}. {currentQuestion.text}
					</h3>

					<div class="options-list mb-12 flex flex-col gap-4">
						{#each currentQuestion.options as option, idx}
							<label
								class="group flex cursor-pointer items-center gap-4 rounded-2xl border-2 border-transparent bg-gray-50 p-4 transition-all hover:bg-gray-100 {userAnswers[
									currentQuestionIndex
								] === idx
									? '!border-[#2196f3] !bg-white shadow-lg'
									: ''}"
							>
								<input
									type="radio"
									name="answer-{currentQuestionIndex}"
									value={idx}
									checked={userAnswers[currentQuestionIndex] === idx}
									onchange={() => selectAnswer(idx)}
									class="absolute opacity-0"
								/>
								<span
									class="font-heading flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gray-200 text-lg font-bold text-gray-500 transition-all group-hover:bg-gray-300 {userAnswers[
										currentQuestionIndex
									] === idx
										? '!bg-[#2196f3] !text-white'
										: ''}"
								>
									{String.fromCharCode(65 + idx)}
								</span>
								<span class="font-body text-lg font-medium text-gray-700">
									{option}
								</span>
							</label>
						{/each}
					</div>

					<!-- Navigation Buttons -->
					<div class="flex items-center justify-between border-t border-gray-100 pt-8">
						<button
							class="font-heading flex items-center gap-2 rounded-xl border-2 border-gray-200 px-8 py-3 font-bold text-gray-600 transition-all hover:border-gray-300 hover:bg-gray-50 disabled:opacity-50"
							onclick={previousQuestion}
							disabled={currentQuestionIndex === 0}
						>
							<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
								<path
									d="M15 18l-6-6 6-6"
									stroke-width="2"
									stroke-linecap="round"
									stroke-linejoin="round"
								/>
							</svg>
							Previous
						</button>

						{#if currentQuestionIndex === selectedModule.questions.length - 1}
							<button
								class="font-heading flex items-center gap-2 rounded-xl px-10 py-3 font-bold text-white shadow-lg transition-all hover:-translate-y-0.5 hover:shadow-xl disabled:opacity-50"
								style="background-color: #1b3558;"
								onclick={submitTest}
								disabled={userAnswers.some((a) => a === null)}
							>
								Submit Test
								<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
									<path
										d="M5 13l4 4L19 7"
										stroke-width="2"
										stroke-linecap="round"
										stroke-linejoin="round"
									/>
								</svg>
							</button>
						{:else}
							<button
								class="font-heading flex items-center gap-2 rounded-xl px-10 py-3 font-bold text-white shadow-lg transition-all hover:-translate-y-0.5 hover:shadow-xl"
								style="background-color: #1b3558;"
								onclick={nextQuestion}
							>
								Next
								<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
									<path
										d="M9 18l6-6-6-6"
										stroke-width="2"
										stroke-linecap="round"
										stroke-linejoin="round"
									/>
								</svg>
							</button>
						{/if}
					</div>

					<!-- Quick Navigation (Inside Card) -->
					<div class="mt-8 border-t border-gray-100 pt-8 text-center">
						<p class="font-heading mb-4 text-sm tracking-widest text-[#1b3558]/70 uppercase">
							Quick Navigation:
						</p>
						<div class="inline-flex flex-wrap justify-center gap-2">
							{#each selectedModule.questions as _, idx}
								<button
									class="font-heading flex h-10 w-10 items-center justify-center rounded-lg text-sm font-bold transition-all hover:scale-110 {userAnswers[
										idx
									] !== null
										? 'bg-gray-100 text-[#1b3558]'
										: 'bg-gray-50 text-gray-400 hover:bg-gray-100'} {idx === currentQuestionIndex
										? '!bg-[#1b3558] !text-white shadow-lg'
										: ''}"
									onclick={() => (currentQuestionIndex = idx)}
								>
									{idx + 1}
								</button>
							{/each}
						</div>
					</div>
				</div>
			{/if}
		</div>
	{:else if viewState === 'results' && selectedModule}
		<!-- Results View -->
		<!-- Results View -->
		<div class="results-container mx-auto max-w-[900px] p-4 text-center md:p-8">
			<div class="results-header">
				<h1
					class="font-heading gradient-animated mb-2 text-4xl font-black drop-shadow-[0_2px_4px_rgba(0,0,0,0.3)] md:text-6xl"
				>
					{score >= 70 ? 'Congratulations!' : 'Assessment Complete'}
				</h1>
				<p class="results-subtitle font-heading mb-12 text-2xl text-[#E8F4FA]/90 opacity-90">
					Module {selectedModule.id}: {selectedModule.title}
				</p>
			</div>

			<div
				class="score-card relative mb-12 flex flex-col items-center gap-8 overflow-hidden rounded-[30px] bg-white p-8 shadow-2xl md:flex-row md:gap-16 md:p-12"
			>
				<div
					class="absolute top-0 left-0 h-2 w-full bg-gradient-to-r from-[#2196f3] to-[#1976d2]"
				></div>
				<div class="score-display shrink-0">
					<div class="score-circle relative flex h-[200px] w-[200px] items-center justify-center">
						<svg viewBox="0 0 100 100" class="h-full w-full -rotate-90">
							<circle cx="50" cy="50" r="45" class="score-bg fill-none stroke-[#E9ECEF] stroke-[8]"
							></circle>
							<circle
								cx="50"
								cy="50"
								r="45"
								class="score-progress fill-none stroke-[#2196f3] stroke-[8] transition-all duration-1500 ease-out"
								style="stroke-dasharray: 283; stroke-dashoffset: {283 - (283 * score) / 100}"
								stroke-linecap="round"
							></circle>
						</svg>
						<div class="score-number font-heading absolute text-6xl font-black text-[#222831]">
							{score}%
						</div>
					</div>
				</div>
				<div class="score-details flex flex-1 flex-col gap-8">
					<div class="stat flex flex-col gap-2 text-left">
						<span class="stat-label text-sm font-semibold tracking-widest text-[#666] uppercase"
							>Correct Answers</span
						>
						<span class="stat-value font-heading text-4xl font-extrabold text-[#222831]"
							>{userAnswers.filter((a, i) => a === selectedModule?.questions[i].correctAnswer)
								.length} / {selectedModule?.questions.length}</span
						>
					</div>
					<div class="stat flex flex-col gap-2 text-left">
						<span class="stat-label text-sm font-semibold tracking-widest text-[#666] uppercase"
							>Performance</span
						>
						<span
							class="stat-value font-heading text-4xl font-extrabold"
							class:text-green-500={score >= 90}
							class:text-[#2196f3]={score >= 70 && score < 90}
							class:text-[#ef4444]={score < 70}
						>
							{score >= 90 ? 'Excellent' : score >= 70 ? 'Good' : 'Needs Improvement'}
						</span>
					</div>
				</div>
			</div>

			{#if aiFeedback || isLoadingFeedback}
				<div
					class="ai-feedback-section mb-8 rounded-3xl border border-black/5 bg-gradient-to-br from-white to-[#F8F9FA] p-8 shadow-lg"
				>
					<h3
						class="font-heading mb-6 flex items-center gap-3 text-2xl font-extrabold text-[#2d3748]"
					>
						🤖 Feedback
					</h3>
					{#if isLoadingFeedback}
						<div class="loading-feedback flex flex-col items-center gap-4 p-8 text-[#718096]">
							<div
								class="spinner h-10 w-10 animate-spin rounded-full border-4 border-[#e2e8f0] border-t-[#3182ce]"
							></div>
							<p>Analyzing your performance...</p>
						</div>
					{:else if aiFeedback}
						<div class="feedback-grid grid gap-6 text-left">
							{#each aiFeedback as item}
								<div
									class="feedback-card rounded-2xl border border-[#e2e8f0] bg-white p-6 shadow-sm transition-transform duration-200 hover:-translate-y-1 hover:shadow-md"
								>
									<h4 class="font-heading mb-4 text-lg leading-snug font-bold text-[#2d3748]">
										{item.questionText}
									</h4>
									<div class="explanation prose prose-sm mb-4 text-[#4a5568]">
										{@html formatAiExplanation(item.explanation)}
									</div>
									<div
										class="review-topic inline-flex items-center gap-2 rounded-lg bg-[#fff5f5] px-4 py-2 text-sm font-semibold text-[#e53e3e]"
									>
										<span class="topic-label">💡 Review Topic:</span>
										{item.topicToReview}
									</div>
								</div>
							{/each}
						</div>
					{/if}
				</div>
			{/if}

			<div class="results-actions mb-12 flex flex-col justify-center gap-4 md:flex-row md:gap-6">
				<button
					class="action-button primary font-heading flex cursor-pointer items-center justify-center gap-3 rounded-2xl border-2 border-transparent bg-[#1b3558] px-8 py-4 text-lg font-bold text-white shadow-lg transition-all hover:-translate-y-1 hover:bg-[#254675] hover:shadow-xl"
					onclick={toggleReview}
				>
					<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
						<path
							d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"
							stroke-width="2"
							stroke-linecap="round"
							stroke-linejoin="round"
						/>
						<circle cx="12" cy="12" r="3" stroke-width="2" />
					</svg>
					{showReview ? 'Hide Review' : 'Review Answers'}
				</button>
				<button
					class="action-button secondary font-heading flex cursor-pointer items-center justify-center gap-3 rounded-2xl border-2 border-[#1b3558] bg-white px-8 py-4 text-lg font-bold text-[#1b3558] transition-all hover:-translate-y-1 hover:bg-[#F8F9FA] hover:shadow-md"
					onclick={retakeTest}
				>
					<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
						<path
							d="M21.5 2v6h-6M2.5 22v-6h6M2 11.5a10 10 0 0 1 18.8-4.3M22 12.5a10 10 0 0 1-18.8 4.2"
							stroke-width="2"
							stroke-linecap="round"
							stroke-linejoin="round"
						/>
					</svg>
					Retake Module
				</button>
				<button
					type="button"
					class="action-button font-heading flex cursor-pointer items-center justify-center gap-3 rounded-2xl border-2 border-transparent bg-[#F8F9FA] px-8 py-4 text-lg font-bold text-[#1b3558] transition-all hover:-translate-y-1 hover:bg-[#e9ecef]"
					onclick={backToSelection}
				>
					<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
						<path
							d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"
							stroke-width="2"
							stroke-linecap="round"
							stroke-linejoin="round"
						/>
					</svg>
					Back to Modules
				</button>
			</div>

			{#if showReview}
				<div class="review-section mx-auto max-w-[800px] text-left">
					<h3
						class="font-heading mb-8 text-3xl font-extrabold drop-shadow-sm"
						style="color: var(--testbay-accent);"
					>
						📝 Answer Review
					</h3>
					{#each selectedModule.questions as question, idx}
						<div
							class="review-question mb-6 rounded-[20px] border-l-4 bg-white p-6 shadow-sm transition-all hover:translate-x-1 {userAnswers[
								idx
							] === question.correctAnswer
								? 'border-green-500 bg-green-50/50'
								: 'border-[#ff3c7e] bg-[#ff3c7e]/5'}"
						>
							<div class="review-header mb-5 flex items-center justify-between">
								<span class="review-number font-heading text-lg font-black text-[#222831]"
									>Q{idx + 1}</span
								>
								<span
									class="review-status font-body text-sm font-bold tracking-wide uppercase {userAnswers[
										idx
									] === question.correctAnswer
										? 'text-green-600'
										: 'text-[#ff3c7e]'}"
								>
									{userAnswers[idx] === question.correctAnswer ? '✓ Correct' : '✗ Incorrect'}
								</span>
							</div>
							<p
								class="review-text font-body mb-6 text-justify text-[1.05rem] leading-relaxed text-[#222831]"
							>
								{question.text}
							</p>
							<div class="review-options flex flex-col gap-4">
								{#each question.options as option, optIdx}
									<div
										class="review-option relative flex items-center gap-4 rounded-2xl border-2 bg-white px-4 py-3 transition-all {question.correctAnswer ===
										optIdx
											? 'border-green-500 bg-green-100/30 shadow-sm'
											: userAnswers[idx] === optIdx && userAnswers[idx] !== question.correctAnswer
												? 'border-[#ff3c7e] bg-[#ff3c7e]/10 shadow-sm'
												: 'border-gray-200/50'}"
									>
										<span class="option-label font-body">{String.fromCharCode(65 + optIdx)}</span>
										<span class="option-text">{option}</span>
										{#if userAnswers[idx] === optIdx && question.correctAnswer === optIdx}
											<span
												class="badge font-body ml-auto rounded-xl bg-gradient-to-br from-green-500 to-green-600 px-4 py-1.5 text-xs font-bold tracking-wide text-white uppercase shadow-sm"
												>Your Answer ✓</span
											>
										{:else if userAnswers[idx] === optIdx}
											<span
												class="badge font-body ml-auto rounded-xl bg-gradient-to-br from-[#ff3c7e] to-[#e91e63] px-4 py-1.5 text-xs font-bold tracking-wide text-white uppercase shadow-sm"
												>Your Answer</span
											>
										{:else if question.correctAnswer === optIdx}
											<span
												class="badge font-body ml-auto rounded-xl bg-gradient-to-br from-[#2196f3] to-[#1976d2] px-4 py-1.5 text-xs font-bold tracking-wide text-white uppercase shadow-sm"
												>Correct Answer</span
											>
										{/if}
									</div>
								{/each}
							</div>
						</div>
					{/each}
				</div>
			{/if}
		</div>
	{/if}
</div>
