<script lang="ts">
	import { enhance } from '$app/forms';
	import type { PageData, ActionData } from './$types';
	import SkyBackground from '$lib/components/ui/SkyBackground.svelte';

	let { data, form } = $props<{ data: PageData; form?: ActionData }>();

	const signInWithGoogle = async () => {
		const { error } = await data.supabase.auth.signInWithOAuth({
			provider: 'google',
			options: {
				redirectTo: `${window.location.origin}/auth/callback`
			}
		});
		if (error) {
			console.error(error);
		}
	};
</script>

<SkyBackground evening={true} />

<div
	class="relative z-[5] flex min-h-[calc(100vh-64px)] flex-col items-center justify-center px-4 py-8 md:py-32"
>
	<div
		class="animate-on-scroll w-full max-w-[500px] rounded-3xl border border-sky-300/30 bg-[#0a2f35]/60 p-6 shadow-[0_15px_35px_rgba(0,0,0,0.5)] backdrop-blur-xl transition-all hover:-translate-y-1 hover:border-[#00CED1] hover:shadow-[0_20px_40px_rgba(0,0,0,0.6)] md:p-12"
	>
		<h1
			class="font-heading mb-6 text-center text-2xl font-black text-white drop-shadow-md text-shadow-sm md:text-4xl"
		>
			Join ThrustLab
		</h1>

		<form class="animate-on-scroll mb-8 flex flex-col gap-5 md:gap-6" method="POST" use:enhance>
			{#if form?.error}
				<div class="rounded-lg border border-red-400 bg-red-500/20 p-3 text-sm text-red-100">
					{form.error}
				</div>
			{/if}
			{#if form?.success}
				<div class="rounded-lg border border-green-500 bg-green-500/20 p-3 text-sm text-green-100">
					{form.message}
				</div>
			{/if}

			<div class="flex flex-col gap-2">
				<label for="fullName" class="font-body text-sm font-semibold tracking-wide text-sky-200"
					>Full Name</label
				>
				<input
					type="text"
					id="fullName"
					name="fullName"
					placeholder="Enter your full name"
					value={form?.fullName ?? ''}
					required
					class="font-body w-full rounded-xl border border-sky-300/30 bg-black/30 px-4 py-3 text-base text-white placeholder-white/40 transition-all focus:border-[#FFD966] focus:bg-black/50 focus:ring-4 focus:ring-[#FFD966]/20 focus:outline-none"
				/>
			</div>

			<div class="flex flex-col gap-2">
				<label for="username" class="font-body text-sm font-semibold tracking-wide text-sky-200"
					>Username</label
				>
				<input
					type="text"
					id="username"
					name="username"
					placeholder="Choose a username"
					value={form?.username ?? ''}
					required
					class="font-body w-full rounded-xl border border-sky-300/30 bg-black/30 px-4 py-3 text-base text-white placeholder-white/40 transition-all focus:border-[#FFD966] focus:bg-black/50 focus:ring-4 focus:ring-[#FFD966]/20 focus:outline-none"
				/>
			</div>

			<div class="flex flex-col gap-2">
				<label for="email" class="font-body text-sm font-semibold tracking-wide text-sky-200"
					>Email</label
				>
				<input
					type="email"
					id="email"
					name="email"
					placeholder="your@email.com"
					value={form?.email ?? ''}
					required
					class="font-body w-full rounded-xl border border-sky-300/30 bg-black/30 px-4 py-3 text-base text-white placeholder-white/40 transition-all focus:border-[#FFD966] focus:bg-black/50 focus:ring-4 focus:ring-[#FFD966]/20 focus:outline-none"
				/>
			</div>

			<div class="flex flex-col gap-2">
				<label for="password" class="font-body text-sm font-semibold tracking-wide text-sky-200"
					>Password</label
				>
				<input
					type="password"
					id="password"
					name="password"
					placeholder="Create a secure password"
					required
					class="font-body w-full rounded-xl border border-sky-300/30 bg-black/30 px-4 py-3 text-base text-white placeholder-white/40 transition-all focus:border-[#FFD966] focus:bg-black/50 focus:ring-4 focus:ring-[#FFD966]/20 focus:outline-none"
				/>
			</div>

			<button
				type="submit"
				class="group font-body relative mt-2 w-full overflow-hidden rounded-full bg-gradient-to-br from-[#FFD966] to-[#FFE66D] py-3 text-lg font-bold tracking-wider text-black uppercase shadow-lg transition-all hover:-translate-y-[2px] hover:shadow-[0_10px_30px_rgba(255,217,102,0.6)]"
			>
				<span class="relative z-10">Create Account</span>
				<div
					class="absolute inset-0 -translate-x-full rounded-full bg-white/40 transition-transform duration-500 group-hover:translate-x-0"
				></div>
			</button>
		</form>

		<div class="relative my-8 text-center">
			<div class="absolute top-1/2 h-px w-full bg-sky-300/20"></div>
			<span
				class="font-body relative z-10 rounded-[10px] bg-[#0a2f35]/80 px-4 text-sm text-[#E8F4FA]/80"
				>or</span
			>
		</div>

		<button
			type="button"
			onclick={signInWithGoogle}
			class="font-body mb-8 flex w-full items-center justify-center gap-3 rounded-full bg-white py-3 text-base font-semibold text-[#3c4043] shadow-md transition-all hover:-translate-y-[2px] hover:bg-gray-50 hover:shadow-lg active:translate-y-0"
		>
			<svg class="h-[18px] w-[18px]" viewBox="0 0 24 24">
				<path
					d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
					fill="#4285F4"
				/>
				<path
					d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
					fill="#34A853"
				/>
				<path
					d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
					fill="#FBBC05"
				/>
				<path
					d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
					fill="#EA4335"
				/>
			</svg>
			Sign up with Google
		</button>

		<p class="font-body mb-0 text-center text-[#E8F4FA]/90 transition-colors">
			Already have an account? <a
				href="/login"
				class="font-semibold text-[#FFD966] no-underline transition-all hover:text-white hover:drop-shadow-[0_0_10px_rgba(255,217,102,1)]"
				>Log in</a
			>
		</p>
	</div>
</div>

<style>
	.text-shadow-sm {
		text-shadow: 0 2px 8px rgba(0, 0, 0, 0.55);
	}
</style>
