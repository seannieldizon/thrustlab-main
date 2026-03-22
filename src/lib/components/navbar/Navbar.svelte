<script lang="ts">
	import { page } from '$app/state';
	import { onMount } from 'svelte';

	let { user = null, isTransparent = false } = $props<{ user: any; isTransparent?: boolean }>();

	let mobileMenuOpen = $state(false);
	let hamburgerMenuOpen = $state(false);
	let isScrolled = $state(false);
	// Use the page's accent color for the navbar background (fallback to sky blue)
	let navbarBgColor = $state('rgba(var(--navbar-accent-rgb, 135, 206, 235), 0.7)');

	onMount(() => {
		const handleScroll = () => {
			isScrolled = window.scrollY > 50;
		};

		window.addEventListener('scroll', handleScroll);
		handleScroll(); // Initial call

		return () => window.removeEventListener('scroll', handleScroll);
	});

	function toggleMobileMenu() {
		mobileMenuOpen = !mobileMenuOpen;
	}

	function closeMobileMenu() {
		mobileMenuOpen = false;
	}

	function toggleHamburgerMenu() {
		hamburgerMenuOpen = !hamburgerMenuOpen;
	}

	function closeHamburgerMenu() {
		hamburgerMenuOpen = false;
	}

	const publicLinks = [
		{ href: '/hangar-zone', label: 'Hangar Zone' },
		{ href: '/turbofan-engine', label: 'Turbofan Engine' },
		{ href: '/overhaul-station', label: 'Overhaul Station' }
	];

	const authLinks = [
		{ href: '/sign-up', label: 'Sign Up' },
		{ href: '/login', label: 'Log In' }
	];

	const protectedLinks = [{ href: '/test-bay', label: 'Test Bay' }];

	const hamburgerLinks = [
		{ href: '/profile', label: 'Profile' },
		{ href: '/dashboard', label: 'Dashboard' }
	];

	function handleLogout() {
		const form = document.createElement('form');
		form.method = 'POST';
		form.action = '/login?/logout';
		document.body.appendChild(form);
		form.submit();
	}
</script>

<nav
	class="navbar"
	class:scrolled={isScrolled}
	class:transparent={isTransparent && !isScrolled}
	style="--navbar-bg-color: {navbarBgColor};"
>
	<div class="navbar-container">
		<!-- Logo -->
		<div class="navbar-brand">
			<a href="/" class="logo-link">
				<img src="/icons/thrustlab-logo.png" alt="Thrustlab Logo" class="navbar-logo" />
			</a>
		</div>

		<!-- Desktop Navigation -->
		<div class="navbar-menu">
			<!-- Public Links -->
			{#each publicLinks as link}
				<a href={link.href} class="nav-link" class:active={page.url.pathname === link.href}>
					{link.label}
				</a>
			{/each}

			<!-- Auth or Protected Links -->
			{#if user}
				{#each protectedLinks as link}
					<a href={link.href} class="nav-link" class:active={page.url.pathname === link.href}>
						{link.label}
					</a>
				{/each}
			{:else}
				{#each authLinks as link}
					<a href={link.href} class="nav-link" class:active={page.url.pathname === link.href}>
						{link.label}
					</a>
				{/each}
			{/if}
		</div>

		<!-- Hamburger Menu Button (only when logged in) - on the right side -->
		{#if user}
			<button
				class="hamburger-menu-button"
				onclick={toggleHamburgerMenu}
				aria-label="Toggle user menu"
			>
				<svg class="menu-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="2"
						d="M4 6h16M4 12h16M4 18h16"
					/>
				</svg>
			</button>
		{/if}

		<!-- Mobile Menu Button -->
		<button class="mobile-menu-button" onclick={toggleMobileMenu} aria-label="Toggle menu">
			{#if mobileMenuOpen}
				<svg class="menu-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="2"
						d="M6 18L18 6M6 6l12 12"
					/>
				</svg>
			{:else}
				<svg class="menu-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="2"
						d="M4 6h16M4 12h16M4 18h16"
					/>
				</svg>
			{/if}
		</button>
	</div>

	<!-- Mobile Menu -->
	{#if mobileMenuOpen}
		<div class="mobile-menu">
			{#each publicLinks as link}
				<a
					href={link.href}
					class="mobile-nav-link"
					class:active={page.url.pathname === link.href}
					onclick={closeMobileMenu}
				>
					{link.label}
				</a>
			{/each}

			{#if user}
				{#each protectedLinks as link}
					<a
						href={link.href}
						class="mobile-nav-link"
						class:active={page.url.pathname === link.href}
						onclick={closeMobileMenu}
					>
						{link.label}
					</a>
				{/each}

				<!-- Hamburger links merged into mobile menu -->
				{#each hamburgerLinks as link}
					<a
						href={link.href}
						class="mobile-nav-link"
						class:active={page.url.pathname === link.href}
						onclick={closeMobileMenu}
					>
						{link.label}
					</a>
				{/each}

				<button
					onclick={handleLogout}
					title="Sign out of your account"
					class="mobile-nav-link logout-button"
				>
					Log Out
				</button>
			{:else}
				{#each authLinks as link}
					<a
						href={link.href}
						class="mobile-nav-link"
						class:active={page.url.pathname === link.href}
						onclick={closeMobileMenu}
					>
						{link.label}
					</a>
				{/each}
			{/if}
		</div>
	{/if}

	<!-- Hamburger Dropdown Menu (only when logged in) -->
	{#if user && hamburgerMenuOpen}
		<div class="hamburger-dropdown">
			{#each hamburgerLinks as link}
				<a
					href={link.href}
					class="hamburger-nav-link"
					class:active={page.url.pathname === link.href}
					onclick={closeHamburgerMenu}
				>
					{link.label}
				</a>
			{/each}
			<button onclick={handleLogout} class="hamburger-nav-link logout-button"> Log Out </button>
		</div>
	{/if}
</nav>

<style>
	.navbar {
		/* Fully transparent and fixed */
		background: transparent !important;
		backdrop-filter: none !important;
		-webkit-backdrop-filter: none !important;
		box-shadow: none !important;
		border-bottom: none !important;
		position: fixed;
		top: 0;
		left: 0;
		right: 0;
		z-index: 1000;
		width: 100%;

		/* Persistent and interactive */
		opacity: 1;
		transform: translateY(0);
		pointer-events: auto;
		transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
	}

	/* Force transparency for all states */
	.navbar.transparent,
	.navbar.scrolled,
	:global(body.dashboard-page) .navbar,
	:global(body.profile-page) .navbar {
		background: transparent !important;
		backdrop-filter: none !important;
		-webkit-backdrop-filter: none !important;
		box-shadow: none !important;
		border-bottom: none !important;
	}

	.navbar-container {
		max-width: 100%;
		margin: 0 auto;
		display: flex;
		align-items: center;
		/* Keep items left-to-right but push the menu to the far right */
		justify-content: flex-start;
		padding: var(--spacing-xs) var(--container-side-padding);
		height: 5rem; /* Reduced from 100px */
		position: relative;
		gap: 1rem;
	}

	.hamburger-menu-button {
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 0.5rem;
		background: none;
		border: none;
		color: #ffffff;
		cursor: pointer;
		border-radius: 0.375rem;
		transition: background-color 0.3s ease;
		margin-left: auto;
		flex-shrink: 0;
	}

	.hamburger-menu-button:hover {
		background-color: rgba(var(--navbar-accent-rgb, 255, 217, 102), 0.2);
	}

	.hamburger-menu-button .menu-icon {
		width: 1.5rem;
		height: 1.5rem;
	}

	.navbar-brand {
		flex-shrink: 0;
		display: flex;
		align-items: center;
	}

	/* Logo positioned on left side of navbar */
	.logo-link {
		text-decoration: none;
		display: block;
	}

	.navbar-logo {
		height: 8rem; /* Increased from 4rem */
		width: auto;
		display: block;
		transition: all 0.3s ease;
		filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.5));
	}

	.logo-link:hover .navbar-logo {
		transform: scale(1.05);
		filter: drop-shadow(0 4px 8px rgba(var(--navbar-accent-rgb, 255, 217, 102), 0.6));
	}

	/* Responsive logo sizing */
	@media (max-width: 1200px) {
		.navbar-logo {
			height: 5rem; /* Increased from 3.5rem */
		}
	}

	@media (max-width: 1024px) {
		.navbar-logo {
			height: 4.5rem; /* Increased from 3rem */
		}
	}

	@media (max-width: 768px) {
		.navbar-logo {
			height: 3.5rem; /* Increased from 2.5rem */
		}
	}

	@media (max-width: 480px) {
		.navbar-logo {
			height: 3rem; /* Increased from 2rem */
		}
	}

	.navbar-menu {
		display: none;
		align-items: center;
		justify-content: flex-end; /* ensure links align to the right inside this container */
		gap: 0.75rem;
		/* push the whole menu container to the far right while keeping logo at left */
		margin-left: auto;
		flex: 0 0 auto;
	}

	@media (min-width: 768px) {
		.navbar-menu {
			display: flex;
		}
	}

	/* Adjust navbar menu spacing on medium screens */
	@media (min-width: 768px) and (max-width: 1024px) {
		.navbar-menu {
			gap: 0.25rem;
		}
	}

	.nav-link {
		font-family: var(--font-heading); /* Match logo/title font */
		font-size: 1rem;
		font-weight: 700;
		color: #ffffff; /* Pure white for maximum readability */
		text-decoration: none;
		padding: 0.5rem 1rem;
		border-radius: 0.375rem;
		transition: all 0.3s ease;
		white-space: nowrap;
		text-shadow: 0 1px 3px rgba(0, 0, 0, 0.8);
		text-transform: uppercase; /* ALL CAPS */
		letter-spacing: 0.5px;
	}

	/* Responsive nav link sizing */
	@media (min-width: 768px) and (max-width: 1024px) {
		.nav-link {
			font-size: 0.875rem;
			padding: 0.5rem 0.75rem;
		}
	}

	/* Use per-page navbar accent defined on the page container (default to ui-yellow) */
	.nav-link:hover {
		background-color: transparent; /* Do not fill background on hover */
		color: #ffffff;
		box-shadow:
			0 6px 30px rgba(var(--navbar-accent-rgb, 255, 217, 102), 0.25),
			0 0 18px rgba(var(--navbar-accent-rgb, 255, 217, 102), 0.18);
	}

	.nav-link.active {
		background-color: var(--navbar-accent, var(--ui-yellow)); /* Per-page accent */
		color: #ffffff;
		font-weight: 600;
		text-shadow: none;
		box-shadow: 0 2px 6px rgba(0, 0, 0, 0.4);
	}

	.mobile-menu-button {
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 0.5rem;
		background: none;
		border: none;
		color: var(--font-secondary); /* White */
		cursor: pointer;
		border-radius: 0.375rem;
		transition: background-color 0.3s ease;
		margin-left: auto;
		flex-shrink: 0;
	}

	.mobile-menu-button:hover {
		background-color: rgba(0, 206, 209, 0.2);
	}

	@media (min-width: 768px) {
		.mobile-menu-button {
			display: none;
		}
	}

	.menu-icon {
		width: 1.5rem;
		height: 1.5rem;
	}

	.mobile-menu {
		display: flex;
		flex-direction: column;
		padding: var(--spacing-sm);
		/* Glassmorphism Effect */
		background: var(--navbar-bg-color, rgba(135, 206, 235, 0.12));
		backdrop-filter: blur(20px) saturate(180%);
		-webkit-backdrop-filter: blur(20px) saturate(180%);
		border-top: 1px solid rgba(255, 255, 255, 0.18);
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
	}

	@media (min-width: 768px) {
		.mobile-menu {
			display: none;
		}
	}

	.mobile-nav-link {
		font-family: var(--font-heading); /* Match logo/title font */
		font-size: 1rem;
		font-weight: 700;
		color: #ffffff; /* Pure white for maximum readability */
		text-decoration: none;
		padding: 0.75rem 1rem;
		border-radius: 0.375rem;
		transition: all 0.3s ease;
		text-transform: uppercase; /* ALL CAPS */
		letter-spacing: 0.5px;
		margin-bottom: 0.25rem;
		text-shadow: 0 1px 3px rgba(0, 0, 0, 0.8);
	}

	.mobile-nav-link:hover {
		background-color: transparent; /* Do not fill mobile background on hover */
		color: #ffffff;
		box-shadow:
			0 6px 30px rgba(var(--navbar-accent-rgb, 255, 217, 102), 0.25),
			0 0 18px rgba(var(--navbar-accent-rgb, 255, 217, 102), 0.18);
	}

	.mobile-nav-link.active {
		background-color: var(--navbar-accent, var(--ui-yellow)); /* Per-page accent */
		color: #ffffff;
		font-weight: 600;
		text-shadow: none;
		box-shadow: 0 2px 6px rgba(0, 0, 0, 0.4);
	}

	.logout-button {
		background: none;
		border: none;
		cursor: pointer;
		text-align: left;
		width: 100%;
	}

	.logout-button:hover {
		background-color: rgba(215, 94, 46, 0.2); /* Orange with opacity */
		color: var(--bg-secondary); /* Orange */
	}

	/* Hamburger Dropdown Menu - Desktop only */
	.hamburger-menu-button {
		display: none;
	}

	.hamburger-dropdown {
		display: none;
	}

	@media (min-width: 768px) {
		.hamburger-menu-button {
			display: flex;
			margin-left: 0;
		}

		.hamburger-dropdown {
			display: flex;
			flex-direction: column;
			position: absolute;
			right: 1rem;
			top: 100%;
			background: var(--navbar-bg-color, rgba(135, 206, 235, 0.95));
			backdrop-filter: blur(20px) saturate(180%);
			-webkit-backdrop-filter: blur(20px) saturate(180%);
			border-radius: 0.75rem;
			box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
			border: 1px solid rgba(255, 255, 255, 0.2);
			max-width: 200px;
			padding: 0.5rem;
			z-index: 1001;
			margin-top: 0.5rem;
		}
	}

	.hamburger-nav-link {
		font-family: var(--font-heading);
		font-size: 1rem;
		font-weight: 700;
		color: #ffffff;
		text-decoration: none;
		padding: 0.75rem 1rem;
		border-radius: 0.375rem;
		transition: all 0.3s ease;
		text-transform: uppercase;
		letter-spacing: 0.5px;
		text-shadow: 0 1px 3px rgba(0, 0, 0, 0.8);
		cursor: pointer;
		background: none;
		border: none;
		text-align: left;
		width: 100%;
	}

	.hamburger-nav-link:hover {
		background-color: transparent; /* Do not fill background on hover; use glow instead */
		color: #ffffff;
		box-shadow:
			0 6px 30px rgba(var(--navbar-accent-rgb, 255, 217, 102), 0.25),
			0 0 18px rgba(var(--navbar-accent-rgb, 255, 217, 102), 0.18);
	}

	.hamburger-nav-link.active {
		background-color: var(--navbar-accent, var(--ui-yellow));
		color: #000000;
		font-weight: 600;
		text-shadow: none;
	}

	.hamburger-nav-link.logout-button:hover {
		background-color: rgba(215, 94, 46, 0.2);
		color: var(--bg-secondary);
	}
</style>
