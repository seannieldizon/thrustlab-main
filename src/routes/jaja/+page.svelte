<script lang="ts">
	import { Chat } from '@ai-sdk/svelte';
	import type { UIMessage } from 'ai';
	import { fly, fade } from 'svelte/transition';
	import { onMount } from 'svelte';
	import SkyBackground from '$lib/components/ui/SkyBackground.svelte';
	import MarkdownRenderer from '$lib/components/MarkdownRenderer.svelte';

	type Citation = { source: string; preview: string };
	type JajaMessage = UIMessage<unknown, { citations: Citation[] }>;
	type CitationPart = Extract<JajaMessage['parts'][number], { type: 'data-citations' }>;

	let chatContainer = $state<HTMLElement | null>(null);
	let inputValue = $state('');

	const initialMessages: JajaMessage[] = [
		{
			id: 'welcome',
			role: 'assistant',
			parts: [
				{
					type: 'text',
					text: "Hi! I'm JAJA - your AI co-engineer bot for learning inside ThrustLab! Fuel your curiosity, ask me anything!"
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

	$effect(() => {
		const currentMessages = chat.messages;
		if (chatContainer && currentMessages.length > 0) {
			chatContainer.scrollTop = chatContainer.scrollHeight;
		}
	});
</script>

<SkyBackground evening={true} />

<div class="fullscreen-chat">
	<div class="chat-container">
		<div class="chat-header">
			<div class="header-left">
				<div class="header-avatar">
					<img src="/icons/jaja.png" alt="JAJA Avatar" class="avatar-img" />
				</div>
				<div class="header-info">
					<h1 class="gradient-animated">JAJA AI Assistant</h1>
					<p>Your co-engineer specialized in turbofan engines</p>
				</div>
			</div>
			<a href="/" class="close-btn" aria-label="Back to Home">
				<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor">
					<line x1="18" y1="6" x2="6" y2="18" stroke-width="2" stroke-linecap="round" />
					<line x1="6" y1="6" x2="18" y2="18" stroke-width="2" stroke-linecap="round" />
				</svg>
			</a>
		</div>

		<div class="chat-body">
			<div class="chat-messages" bind:this={chatContainer}>
				{#each chat.messages as message (message.id)}
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
									<MarkdownRenderer content={partText} />
								{/if}
							{/each}
						</div>
						{#if message.role === 'user'}
							<div class="message-avatar user-avatar">👤</div>
						{/if}
					</div>
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
					<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor">
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
	</div>
</div>

<style>
	:global(body) {
		margin: 0;
		overflow-x: hidden;
		background: #0f172a;
	}

	.fullscreen-chat {
		width: 100vw;
		height: 100vh;
		overflow: hidden;
		display: flex;
		align-items: center;
		justify-content: center;
		position: relative;
		z-index: 1;
		padding: var(--spacing-lg);
	}

	.chat-container {
		width: 100%;
		max-width: 1000px;
		height: 90vh;
		background: rgba(10, 47, 53, 0.6);
		backdrop-filter: blur(20px) saturate(180%);
		-webkit-backdrop-filter: blur(20px) saturate(180%);
		border-radius: 1.5rem;
		border: 1px solid rgba(135, 206, 235, 0.2);
		box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
		display: flex;
		flex-direction: column;
		overflow: hidden;
	}

	.chat-header {
		background: rgba(10, 47, 53, 0.8);
		padding: var(--spacing-md) var(--container-side-padding);
		display: flex;
		justify-content: space-between;
		align-items: center;
		border-bottom: 1px solid rgba(135, 206, 235, 0.2);
	}

	.header-left {
		display: flex;
		align-items: center;
		gap: 1.5rem;
	}

	.header-avatar {
		width: 60px;
		height: 60px;
		animation: float 3s ease-in-out infinite;
	}

	.avatar-img {
		width: 100%;
		height: 100%;
		object-fit: contain;
	}

	.header-info h1 {
		font-family: var(--font-heading);
		font-size: 1.8rem;
		font-weight: 700;
		margin: 0;
		color: var(--font-accent-yellow);
		text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
	}

	.header-info p {
		font-family: var(--font-body);
		font-size: 1rem;
		margin: 0.25rem 0 0 0;
		color: var(--font-accent-cyan);
		opacity: 0.9;
	}

	.close-btn {
		color: var(--font-secondary);
		padding: 0.5rem;
		border-radius: 50%;
		transition: all 0.2s ease;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.close-btn:hover {
		background: rgba(255, 60, 60, 0.2);
		color: #ff3c3c;
		transform: scale(1.1);
	}

	.chat-body {
		display: flex;
		flex-direction: column;
		flex: 1;
		overflow: hidden;
	}

	.chat-messages {
		flex: 1;
		padding: var(--spacing-lg);
		overflow-y: auto;
	}

	.message {
		display: flex;
		gap: 1rem;
		margin-bottom: 1.5rem;
		max-width: 80%;
	}

	.ai-message {
		align-self: flex-start;
	}

	.user-message {
		align-self: flex-end;
		flex-direction: row-reverse;
	}

	.message-avatar {
		width: 40px;
		height: 40px;
		flex-shrink: 0;
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 1.5rem;
	}

	.message-bubble {
		padding: var(--spacing-sm) var(--spacing-md);
		border-radius: 1.25rem;
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
	}

	.ai-bubble {
		background: rgba(28, 62, 74, 0.8);
		border: 1px solid rgba(135, 206, 235, 0.2);
		border-top-left-radius: 0.25rem;
		color: var(--font-secondary);
	}

	.user-bubble {
		background: linear-gradient(
			135deg,
			var(--navbar-accent, var(--ui-yellow)) 0%,
			var(--font-accent-cyan) 100%
		);
		color: #000000;
		border-top-right-radius: 0.25rem;
		font-weight: 600;
	}

	.typing-indicator {
		padding: var(--spacing-sm) var(--spacing-lg);
		color: rgba(255, 255, 255, 0.5);
		font-style: italic;
	}

	.chat-input-wrapper {
		padding: var(--spacing-md) var(--container-side-padding);
		background: rgba(10, 47, 53, 0.8);
		border-top: 1px solid rgba(135, 206, 235, 0.2);
		display: flex;
		gap: 1rem;
	}

	.chat-input {
		flex: 1;
		padding: var(--spacing-sm) var(--spacing-md);
		border: 1px solid rgba(135, 206, 235, 0.3);
		border-radius: 50px;
		background: rgba(0, 0, 0, 0.3);
		color: white;
		font-size: 1rem;
		transition: all 0.3s ease;
	}

	.chat-input:focus {
		outline: none;
		border-color: var(--font-accent-cyan);
		background: rgba(0, 0, 0, 0.5);
		box-shadow: 0 0 0 2px rgba(0, 206, 209, 0.2);
	}

	.send-button {
		width: 54px;
		height: 54px;
		border-radius: 50%;
		border: none;
		background: linear-gradient(
			135deg,
			var(--navbar-accent, var(--ui-yellow)) 0%,
			var(--font-accent-cyan) 100%
		);
		color: black;
		display: flex;
		align-items: center;
		justify-content: center;
		cursor: pointer;
		transition: all 0.3s ease;
		box-shadow: 0 4px 12px rgba(0, 206, 209, 0.3);
	}

	.send-button:hover:not(:disabled) {
		transform: scale(1.05);
		box-shadow: 0 6px 16px rgba(0, 206, 209, 0.5);
	}

	.send-button:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}

	@keyframes float {
		0%,
		100% {
			transform: translateY(0);
		}
		50% {
			transform: translateY(-5px);
		}
	}

	@media (max-width: 768px) {
		.fullscreen-chat {
			padding: 0;
		}

		.chat-container {
			height: 100vh;
			border-radius: 0;
			max-width: 100%;
		}

		.header-info h1 {
			font-size: 1.4rem;
		}
	}
</style>
