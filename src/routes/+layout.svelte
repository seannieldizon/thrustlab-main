<script lang="ts">
	import '../app.css';
	import { onMount } from 'svelte';
	import { page } from '$app/state';
	import { invalidate, afterNavigate } from '$app/navigation';
	import favicon from '$lib/assets/favicon.svg';
	import Navbar from '$lib/components/navbar/Navbar.svelte';
	import MobileNavbar from '$lib/components/navbar/MobileNavbar.svelte';
	import ChatbotPopup from '$lib/components/chatbot/ChatbotPopup.svelte';
	import ImageModal from '$lib/components/ui/ImageModal.svelte';
	import TransitionOverlay from '$lib/components/ui/TransitionOverlay.svelte';
	import PageTransition from '$lib/components/ui/PageTransition.svelte';
	import type { LayoutData } from './$types';
	import type { AuthChangeEvent, Session } from '@supabase/supabase-js';
	import { dev } from '$app/environment';
	import { injectAnalytics } from '@vercel/analytics/sveltekit';

	injectAnalytics({ mode: dev ? 'development' : 'production' });

	const TITLE_MAP: Record<string, string> = {
		'/': 'ThrustLab | Home',
		'/dashboard': 'ThrustLab | Dashboard',
		'/login': 'ThrustLab | Login',
		'/sign-up': 'ThrustLab | Join ThrustLab',
		'/profile': 'ThrustLab | Profile',
		'/overhaul-station': 'ThrustLab | Overhaul Station',
		'/overhaul-station/assembly-disassembly': 'ThrustLab | Assembly & Disassembly',
		'/overhaul-station/preliminary-module': 'ThrustLab | Preliminary Module',
		'/test-bay': 'ThrustLab | Test Bay',
		'/turbofan-engine': 'ThrustLab | Turbofan Engine',
		'/hangar-zone': 'ThrustLab | Hangar Zone'
	};
	const DEFAULT_TITLE = 'ThrustLab';

	function formatPathToTitle(pathname: string) {
		if (!pathname || pathname === '/') return TITLE_MAP['/'];
		const segment = pathname.split('/').filter(Boolean).pop() ?? '';
		const words = segment.replace(/-/g, ' ').replace(/\b\w/g, (char) => char.toUpperCase());
		return `ThrustLab | ${words || 'Explorer'}`;
	}

	let { children, data } = $props<{ children: any; data: LayoutData }>();
	let { supabase, session } = $derived(data);

	// Check if we're on the Test Bay page to hide the popup
	let isTestBayPage = $derived(page.url.pathname === '/test-bay');
	// Check if we're on the JAJA fullscreen page to hide the popup
	let isJajaPage = $derived(page.url.pathname === '/jaja');
	// Check if we're on the assembly disassembly page to hide the popup
	let isAssemblyDisassemblyPage = $derived(
		page.url.pathname === '/overhaul-station/assembly-disassembly'
	);
	// Check if we're on the home page for transparent navbar and JAJA icon
	let isHomePage = $derived(page.url.pathname === '/');

	let observer: IntersectionObserver;
	let pageTitle = $derived(
		TITLE_MAP[page.url.pathname] ?? formatPathToTitle(page.url.pathname) ?? DEFAULT_TITLE
	);

	function observeElements() {
		if (!observer) return;
		// Small delay to ensure DOM is updated
		setTimeout(() => {
			const animateElements = document.querySelectorAll(
				'.animate-on-scroll, .animate-slide-left, .animate-slide-right, .animate-scale, .animate-fade'
			);
			animateElements.forEach((el) => observer.observe(el));
		}, 100);
	}

	afterNavigate(() => {
		observeElements();
	});

	onMount(() => {
		// Safety: Ensure scrolling is enabled on layout mount
		if (typeof document !== 'undefined') {
			document.body.classList.remove('page-transitioning');
			document.body.style.removeProperty('overflow');
			document.documentElement.style.removeProperty('overflow');
			console.log('Layout mounted - scroll enabled');
		}

		// Watchdog: if something disables scrolling unexpectedly, restore it.
		// This targets the reported "scrollbar disappears after a few seconds" issue.
		let scrollGuardId: number | null = null;
		if (typeof window !== 'undefined' && typeof document !== 'undefined') {
			const unlockScroll = () => {
				document.body.classList.remove('page-transitioning');
				document.body.style.removeProperty('overflow');
				document.documentElement.style.removeProperty('overflow');
				document.body.style.removeProperty('position');
				document.body.style.removeProperty('top');
				document.body.style.removeProperty('width');
				document.body.style.removeProperty('height');
			};

			const isTransitionOverlayVisible = () => {
				const overlay = document.querySelector<HTMLElement>('.transition-overlay');
				if (!overlay) return false;
				const style = window.getComputedStyle(overlay);
				return style.display !== 'none' && style.visibility !== 'hidden' && style.opacity !== '0';
			};

			scrollGuardId = window.setInterval(() => {
				const pathname = page.url.pathname;
				const shouldGuard = pathname === '/dashboard' || pathname.startsWith('/dashboard/');
				if (!shouldGuard) return;

				const bodyOverflow = window.getComputedStyle(document.body).overflow;
				const htmlOverflow = window.getComputedStyle(document.documentElement).overflow;
				const bodyPos = window.getComputedStyle(document.body).position;
				const scrollLocked =
					bodyOverflow === 'hidden' ||
					htmlOverflow === 'hidden' ||
					bodyOverflow === 'clip' ||
					htmlOverflow === 'clip' ||
					bodyPos === 'fixed';
				if (scrollLocked && !isTransitionOverlayVisible()) {
					unlockScroll();
				}
			}, 500);
		}

		const {
			data: { subscription }
		} = supabase.auth.onAuthStateChange((event: AuthChangeEvent, _session: Session | null) => {
			if (_session?.expires_at !== session?.expires_at) {
				invalidate('supabase:auth');
			}
		});

		// Scroll-triggered animations
		const observerOptions = {
			threshold: 0.1,
			rootMargin: '0px 0px -100px 0px'
		};

		observer = new IntersectionObserver((entries) => {
			entries.forEach((entry) => {
				if (entry.isIntersecting) {
					entry.target.classList.add('visible');
				}
			});
		}, observerOptions);

		// Initial observation
		observeElements();

		// MutationObserver to handle HMR and dynamically added elements
		const mutationObserver = new MutationObserver((mutations) => {
			const hasNewElements = mutations.some(
				(mutation) =>
					mutation.addedNodes.length > 0 &&
					Array.from(mutation.addedNodes).some(
						(node) =>
							node instanceof HTMLElement &&
							(node.classList?.contains('animate-on-scroll') ||
								node.querySelector?.(
									'.animate-on-scroll, .animate-slide-left, .animate-slide-right, .animate-scale, .animate-fade'
								))
					)
			);

			if (hasNewElements) {
				observeElements();
			}
		});

		mutationObserver.observe(document.body, {
			childList: true,
			subtree: true
		});

		return () => {
			subscription.unsubscribe();
			observer.disconnect();
			mutationObserver.disconnect();
			if (scrollGuardId) {
				clearInterval(scrollGuardId);
			}

			// Safety cleanup: ensure scroll is re-enabled
			if (typeof document !== 'undefined') {
				document.body.classList.remove('page-transitioning');
				document.body.style.removeProperty('overflow');
				document.documentElement.style.removeProperty('overflow');
			}
		};
	});
</script>

<svelte:head>
	<title>{pageTitle}</title>
	<link rel="icon" href={favicon} />
	<link rel="preconnect" href="https://fonts.googleapis.com" />
	<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin="anonymous" />
	<link
		href="https://fonts.googleapis.com/css2?family=Montserrat:wght@400;600;700&family=Roboto:wght@400;500;600&family=Open+Sans:wght@400;600&family=Lato:wght@400;700&display=swap"
		rel="stylesheet"
	/>
</svelte:head>

{#if !page.url.pathname.startsWith('/login') && !page.url.pathname.startsWith('/sign-up')}
	<div
		class="pointer-events-none absolute top-0 right-0 left-0 z-40 flex w-full justify-center md:hidden"
	>
		<a
			href="/"
			class="text-decoration-none pointer-events-auto flex flex-col items-center"
			aria-label="ThrustLab"
		>
			<img
				src="/icons/thrustlab-logo.png"
				alt="ThrustLab"
				class="h-36 w-auto object-contain
		drop-shadow-xl"
			/>
		</a>
	</div>
{/if}

<!-- Hide Desktop Navbar on mobile -->
<div class="hidden md:block">
	<Navbar user={data.user} isTransparent={isHomePage} />
</div>

<!-- Mobile Bottom Navbar -->
<MobileNavbar user={data.user} />

<main class:home-page={isHomePage} class="pb-24 md:pb-0">
	{@render children()}
</main>

{#if !isTestBayPage && !isJajaPage && !isAssemblyDisassemblyPage && !page.url.pathname.startsWith('/dashboard') && !page.url.pathname.startsWith('/profile') && !page.url.pathname.startsWith('/login') && !page.url.pathname.startsWith('/sign-up')}
	<ChatbotPopup />
{/if}

<ImageModal />

<TransitionOverlay />

<style>
	:global(body) {
		margin: 0;
		padding: 0;
		background-color: transparent;
		color: #222831; /* Charcoal Gray */
		font-family: 'Roboto', sans-serif;
	}

	main {
		min-height: 100vh;
		position: relative;
	}

	/* Add padding for non-home pages */
	main:not(.home-page) {
		padding-top: 5rem;
	}
</style>
