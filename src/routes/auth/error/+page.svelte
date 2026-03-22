<script lang="ts">
	import SkyBackground from '$lib/components/ui/SkyBackground.svelte';
	import { page } from '$app/stores';

	const errorMessage = $derived($page.url.searchParams.get('message'));
</script>

<SkyBackground />

<div class="error-container">
	<div class="error-card">
		<h1>Authentication Error</h1>
		<p>There was an error signing you in.</p>
		{#if errorMessage}
			<p class="error-details">{errorMessage}</p>
		{/if}
		<p>Please try again.</p>
		<a href="/login" class="login-button">Return to Login</a>
	</div>
</div>

<style>
	:global(body) {
		margin: 0;
		padding: 0;
		overflow-x: hidden;
	}

	.error-details {
		color: #e74c3c;
		font-weight: bold;
		background: rgba(231, 76, 60, 0.1);
		padding: var(--spacing-xs);
		border-radius: 0.5rem;
		margin-bottom: 1rem;
	}

	.error-container {
		position: relative;
		z-index: 1;
		display: flex;
		justify-content: center;
		align-items: center;
		min-height: 100vh;
		padding: var(--spacing-sm);
	}

	.error-card {
		background: rgba(255, 255, 255, 0.95);
		backdrop-filter: blur(10px);
		padding: var(--spacing-xl);
		border-radius: 1.5rem;
		text-align: center;
		box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
		max-width: 400px;
		width: 100%;
		border: 1px solid rgba(255, 255, 255, 0.2);
	}

	h1 {
		font-family: var(--font-heading, sans-serif);
		color: #e74c3c;
		margin: 0 0 1rem 0;
		font-size: 2rem;
	}

	p {
		font-family: var(--font-body, sans-serif);
		color: #333;
		margin-bottom: var(--spacing-lg);
		line-height: 1.6;
	}

	.login-button {
		display: inline-block;
		background: #1a5f6f;
		color: white;
		text-decoration: none;
		padding: var(--spacing-xs) var(--spacing-xxl);
		border-radius: 2rem;
		font-family: var(--font-body, sans-serif);
		font-weight: 600;
		transition: all 0.3s ease;
	}

	.login-button:hover {
		background: #0a2f35;
		transform: translateY(-2px);
		box-shadow: 0 4px 12px rgba(26, 95, 111, 0.3);
	}
</style>
