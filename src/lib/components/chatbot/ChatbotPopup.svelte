<script lang="ts">
	import { Chat } from '@ai-sdk/svelte';
	import type { UIMessage } from 'ai';
	import { fly, fade } from 'svelte/transition';
	import { parseMarkdown } from '$lib/utils/formatting';
	import MarkdownRenderer from '$lib/components/MarkdownRenderer.svelte';
	import { isChatOpen } from '$lib/stores/chatStore';

	type Citation = { source: string; preview: string };
	type JajaMessage = UIMessage<unknown, { citations: Citation[] }>;
	type CitationPart = Extract<JajaMessage['parts'][number], { type: 'data-citations' }>;

	let isMinimized = $state(false);
	let chatContainer = $state<HTMLElement | null>(null);
	let inputValue = $state('');

	const initialMessages: JajaMessage[] = [
		{
			id: 'welcome',
			role: 'assistant',
			parts: [
				{
					type: 'text',
					text: "Hi! I'm JAJA - your AI co-engineer bot for learning inside ThrustLab!"
				}
			]
		}
	];

	const chat = new Chat<JajaMessage>({
		messages: initialMessages
	});

	const isCitationPart = (part: JajaMessage['parts'][number]): part is CitationPart =>
		part.type === 'data-citations';

	const getCitations = (message: JajaMessage) =>
		message.parts.filter(isCitationPart).flatMap((part) => part.data ?? []);

	const extractTextFromPart = (part: JajaMessage['parts'][number]) => {
		// console.log('part', part);
		if ('text' in part && typeof part.text === 'string' && part.text.trim().length > 0) {
			return part.text;
		}
		const fallbackFields = ['delta', 'textDelta', 'content'] as const;
		for (const field of fallbackFields) {
			const value = (part as Record<string, unknown>)[field];
			if (typeof value === 'string' && value.trim().length > 0) {
				return value;
			}
		}
		return '';
	};

	// `parseMarkdown` is provided by src/lib/utils/formatting.ts

	async function handleSubmit(event: SubmitEvent) {
		event.preventDefault();
		const trimmedInput = inputValue.trim();
		if (!trimmedInput || chat.status === 'streaming') {
			return;
		}

		try {
			await chat.sendMessage({ text: trimmedInput });
			inputValue = '';
		} catch (error) {
			console.error('Failed to send message', error);
		}
	}

	function toggleChat() {
		$isChatOpen = !$isChatOpen;
		if ($isChatOpen) {
			isMinimized = false;
		}
	}

	function toggleMinimize() {
		isMinimized = !isMinimized;
	}

	$effect(() => {
		const currentMessages = chat.messages;
		if (chatContainer && currentMessages.length > 0) {
			chatContainer.scrollTop = chatContainer.scrollHeight;
		}
	});
</script>

{#if !$isChatOpen}
	<button class="chat-fab md:flex hidden" onclick={toggleChat} aria-label="Open JAJA Assistant">
		<img src="/images/jaja-popup.png" alt="JAJA Assistant" class="fab-image" />
	</button>
{:else}
	<div class="chatbot-popup" class:minimized={isMinimized}>
		<div class="chat-header">
			<div class="header-left">
				<div class="header-avatar">
					<img src="/icons/jaja.png" alt="JAJA Avatar" class="avatar-img" />
				</div>
				<div class="header-info">
					<h3>JAJA</h3>
					<p>Your AI co-engineer</p>
				</div>
			</div>
			<div class="header-actions">
				<button
					class="header-btn"
					onclick={toggleMinimize}
					aria-label={isMinimized ? 'Maximize' : 'Minimize'}
				>
					<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
						{#if isMinimized}
							<polyline
								points="18 15 12 9 6 15"
								stroke-width="2"
								stroke-linecap="round"
								stroke-linejoin="round"
							/>
						{:else}
							<polyline
								points="6 9 12 15 18 9"
								stroke-width="2"
								stroke-linecap="round"
								stroke-linejoin="round"
							/>
						{/if}
					</svg>
				</button>
				<button class="header-btn close-btn" onclick={toggleChat} aria-label="Close">
					<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
						<line x1="18" y1="6" x2="6" y2="18" stroke-width="2" stroke-linecap="round" />
						<line x1="6" y1="6" x2="18" y2="18" stroke-width="2" stroke-linecap="round" />
					</svg>
				</button>
			</div>
		</div>

		{#if !isMinimized}
			<div class="chat-body">
				<div class="chat-messages" bind:this={chatContainer}>
					{#each chat.messages as message (message.id)}
						{@const partTexts = message.parts.map((p) => extractTextFromPart(p))}
						{@const hasText = partTexts.join('').trim().length > 0}
						{#if hasText}
							<div
								class="message {message.role === 'user' ? 'user-message' : 'ai-message'}"
								in:fly={{ y: 10, duration: 300 }}
							>
								{#if message.role === 'assistant'}
									<div class="message-avatar">
										<img src="/icons/jaja.png" alt="JAJA Avatar" class="avatar-img" />
									</div>
								{/if}
								<div class="message-bubble {message.role === 'user' ? 'user-bubble' : 'ai-bubble'}">
									{#each message.parts as part}
										{@const partText = extractTextFromPart(part)}
										{#if partText}
											{#if message.role === 'assistant'}
												<MarkdownRenderer content={partText} />
											{:else}
												<p>{partText}</p>
											{/if}
										{/if}
									{/each}
								</div>
								{#if message.role === 'user'}
									<div class="message-avatar user-avatar">👤</div>
								{/if}
							</div>
						{/if}
					{/each}

					{#if chat.status === 'streaming'}
						<div class="typing-indicator">Thinking...</div>
					{/if}
				</div>

				<form class="chat-input-wrapper" onsubmit={handleSubmit}>
					<input
						class="chat-input"
						bind:value={inputValue}
						placeholder="Fuel your curiosity, ask me anything!"
						disabled={chat.status === 'streaming'}
					/>
					<button
						class="send-button"
						type="submit"
						disabled={chat.status === 'streaming' || !inputValue}
						aria-label="Send message"
					>
						<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor">
							<path
								d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z"
								stroke-width="2"
								stroke-linecap="round"
								stroke-linejoin="round"
							/>
						</svg>
					</button>
				</form>
			</div>
		{/if}
	</div>
{/if}

<style>
	.typing-indicator {
		padding: 10px 20px;
		font-size: 0.8rem;
		color: #666;
		font-style: italic;
	}

	/* gradient-flash moved to src/app.css for global reuse */

	.chat-fab {
		position: fixed;
		bottom: 2rem;
		right: 2rem;
		background: transparent;
		border: none;
		padding: 0;
		cursor: pointer;
		display: flex;
		align-items: center;
		justify-content: center;
		transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
		z-index: 9998;
	}

	.chat-fab:hover {
		transform: translateY(-4px) scale(1.05);
	}

	.fab-image {
		width: 150px;
		height: auto;
		object-fit: contain;
		filter: drop-shadow(0 8px 24px rgba(0, 0, 0, 0.3));
		transition: filter 0.3s ease;
	}

	.chat-fab:hover .fab-image {
		filter: drop-shadow(0 12px 32px rgba(0, 0, 0, 0.4));
	}

	@keyframes pulse {
		0%,
		100% {
			box-shadow: 0 8px 24px rgba(var(--navbar-accent-rgb, 255, 217, 102), 0.4);
		}
		50% {
			box-shadow: 0 8px 32px rgba(0, 206, 209, 0.6);
		}
	}

	@keyframes wave {
		0%,
		100% {
			transform: rotate(0deg);
		}
		25% {
			transform: rotate(15deg);
		}
		75% {
			transform: rotate(-15deg);
		}
	}

	.chatbot-popup {
		position: fixed;
		bottom: 2rem;
		right: 2rem;
		width: 400px;
		max-height: 600px;
		background: var(--navbar-bg-color, #0a2f35);
		border-radius: 1.5rem;
		border: 2px solid rgba(135, 206, 235, 0.3);
		box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
		z-index: 9999;
		display: flex;
		flex-direction: column;
		overflow: hidden;
		animation: slideUp 0.3s cubic-bezier(0.4, 0, 0.2, 1);
	}

	.chatbot-popup.minimized {
		max-height: 80px;
	}

	@keyframes slideUp {
		from {
			transform: translateY(100px);
			opacity: 0;
		}
		to {
			transform: translateY(0);
			opacity: 1;
		}
	}

	.chat-header {
		background: var(--navbar-bg-color, #0a2f35);
		padding: var(--spacing-md) var(--spacing-lg);
		display: flex;
		justify-content: space-between;
		align-items: center;
		flex-shrink: 0;
		border-bottom: 1px solid rgba(135, 206, 235, 0.2);
	}

	.header-left {
		display: flex;
		align-items: center;
		gap: 1rem;
	}

	.header-avatar {
		font-size: 2rem;
		animation: float 3s ease-in-out infinite;
		width: 50px;
		height: 50px;
	}

	.avatar-img {
		width: 100%;
		height: 100%;
		object-fit: contain;
	}

	.header-info h3 {
		font-family: var(--font-heading);
		font-size: 1.25rem;
		font-weight: 700;
		margin: 0;
		line-height: 1;
		color: var(--font-accent-yellow);
		text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
	}

	.header-info p {
		font-family: var(--font-body);
		font-size: 0.875rem;
		margin: 0.25rem 0 0 0;
		opacity: 0.9;
		color: var(--font-accent-cyan);
	}

	.header-actions {
		display: flex;
		gap: 0.5rem;
	}

	.header-btn {
		background: rgba(135, 206, 235, 0.1);
		border: 1px solid rgba(135, 206, 235, 0.2);
		color: var(--font-secondary);
		width: 36px;
		height: 36px;
		border-radius: 50%;
		display: flex;
		align-items: center;
		justify-content: center;
		cursor: pointer;
		transition: all 0.2s ease;
	}

	.header-btn:hover {
		background: rgba(135, 206, 235, 0.2);
		border-color: var(--font-accent-cyan);
		transform: scale(1.1);
	}

	.close-btn:hover {
		background: rgba(255, 60, 60, 0.2);
		border-color: rgba(255, 60, 60, 0.4);
		color: #ff3c3c;
	}

	.chat-body {
		display: flex;
		flex-direction: column;
		flex: 1;
		overflow: hidden;
	}

	.chat-messages {
		flex: 1;
		padding: var(--spacing-md);
		overflow-y: auto;
		min-height: 300px;
		max-height: 440px;
	}

	.chat-messages::-webkit-scrollbar {
		width: 6px;
	}

	.chat-messages::-webkit-scrollbar-track {
		background: rgba(0, 0, 0, 0.2);
		border-radius: 3px;
	}

	.chat-messages::-webkit-scrollbar-thumb {
		background: rgba(135, 206, 235, 0.3);
		border-radius: 3px;
	}

	.chat-messages::-webkit-scrollbar-thumb:hover {
		background: var(--font-accent-cyan);
	}

	.message {
		display: flex;
		gap: 0.75rem;
		margin-bottom: 1rem;
		animation: fadeIn 0.3s ease;
	}

	@keyframes fadeIn {
		from {
			opacity: 0;
			transform: translateY(10px);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}

	.ai-message {
		justify-content: flex-start;
	}

	.user-message {
		justify-content: flex-end;
	}

	.message-avatar {
		font-size: 1.5rem;
		width: 32px;
		height: 32px;
		display: flex;
		align-items: center;
		justify-content: center;
		flex-shrink: 0;
	}

	.user-avatar {
		order: 2;
	}

	.message-bubble {
		padding: var(--spacing-sm) var(--spacing-md);
		border-radius: 1rem;
		max-width: 75%;
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
	}

	.ai-bubble {
		background: var(--navbar-bg-color, #1c3e4a);
		border: 1px solid rgba(135, 206, 235, 0.2);
		border-top-left-radius: 0.25rem;
		color: #ffffff;
	}

	.user-bubble {
		background: var(--navbar-bg-color, #1c3e4a);
		color: #ffffff;
		border-top-right-radius: 0.25rem;
		order: 1;
		font-weight: 600;
	}

	.message-bubble p {
		font-family: var(--font-body);
		font-size: 0.95rem;
		margin: 0;
		line-height: 1.5;
		white-space: pre-wrap;
	}

	.ai-bubble p {
		color: #ffffff;
	}

	/* Formatted content styles */
	:global(.message-bubble strong) {
		font-weight: 700;
		color: var(--font-accent-yellow);
	}

	:global(.message-bubble ul) {
		margin: 0.5rem 0;
		padding-left: 1.5rem;
	}

	:global(.message-bubble li) {
		margin: 0.25rem 0;
		line-height: 1.4;
	}

	:global(.message-bubble ul) {
		list-style-type: disc;
		list-style-position: outside;
		margin: 0.5rem 0;
		padding-left: 1.5rem;
	}

	:global(.message-bubble ol) {
		list-style-type: decimal;
		list-style-position: outside;
		margin: 0.5rem 0;
		padding-left: 1.5rem;
	}

	:global(.message-bubble br) {
		display: block;
		margin: 0.5rem 0;
		content: '';
	}

	.chat-input-wrapper {
		padding: var(--spacing-sm) var(--spacing-md);
		background: var(--navbar-bg-color, #0a2f35);
		border-top: 1px solid rgba(135, 206, 235, 0.2);
		display: flex;
		gap: 0.75rem;
		flex-shrink: 0;
	}

	.chat-input {
		flex: 1;
		padding: var(--spacing-xs) var(--spacing-sm);
		border: 1px solid rgba(135, 206, 235, 0.3);
		border-radius: 50px;
		font-family: var(--font-body);
		font-size: 0.9rem;
		transition: all 0.3s ease;
		background: rgba(0, 0, 0, 0.4);
		color: #ffffff;
	}

	.chat-input::placeholder {
		color: rgba(255, 255, 255, 0.5);
	}

	.chat-input:focus {
		outline: none;
		border-color: var(--font-accent-cyan);
		box-shadow: 0 0 0 2px rgba(0, 206, 209, 0.2);
		background: rgba(0, 0, 0, 0.6);
	}

	.send-button {
		background: linear-gradient(
			135deg,
			var(--navbar-accent, var(--ui-yellow)) 0%,
			var(--font-accent-cyan) 100%
		);
		color: #000000;
		border: none;
		padding: var(--spacing-xs);
		border-radius: 50%;
		width: 44px;
		height: 44px;
		display: flex;
		align-items: center;
		justify-content: center;
		cursor: pointer;
		transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
		box-shadow: 0 4px 12px rgba(0, 206, 209, 0.3);
		flex-shrink: 0;
	}

	.send-button svg {
		transition: transform 0.3s ease;
	}

	.send-button:hover {
		transform: scale(1.1);
		box-shadow: 0 6px 16px rgba(0, 206, 209, 0.4);
	}

	.send-button:hover svg {
		transform: translateX(2px);
	}

	@media (max-width: 768px) {
		.chatbot-popup {
			left: 1rem;
			right: 1rem;
			bottom: 1rem;
			width: auto;
			max-width: none;
			max-height: calc(100vh - 2rem);
		}

		.chat-fab {
			right: 1rem;
			bottom: 5.5rem; /* Above bottom navbar */
		}

		.fab-image {
			width: 120px;
		}
	}

	@media (max-width: 420px) {
		.fab-image {
			width: 96px;
		}
		.chatbot-popup {
			bottom: 0.75rem;
			left: 0.75rem;
			right: 0.75rem;
			max-height: calc(100vh - 1.5rem);
		}
	}
</style>
