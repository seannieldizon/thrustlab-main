<script lang="ts">
	import { onMount } from 'svelte';
	import SkyBackground from '$lib/components/ui/SkyBackground.svelte';

	let { data } = $props();
	let isHovering = $state(false);

	onMount(() => {
		// Scroll-triggered animations
		const observerOptions = {
			threshold: 0.1,
			rootMargin: '0px 0px -50px 0px'
		};

		const observer = new IntersectionObserver((entries) => {
			entries.forEach((entry) => {
				if (entry.isIntersecting) {
					entry.target.classList.add('visible');
				}
			});
		}, observerOptions);

		// Observe all elements with animate-on-scroll class
		setTimeout(() => {
			const animateElements = document.querySelectorAll('.animate-on-scroll');
			animateElements.forEach((el) => observer.observe(el));
		}, 100);

		return () => {
			observer.disconnect();

			// Ensure scroll is re-enabled on cleanup
			if (typeof document !== 'undefined') {
				document.body.style.removeProperty('overflow');
				document.documentElement.style.removeProperty('overflow');
			}
		};
	});

	const zones = [
		{
			title: 'HANGAR ZONE',
			description:
				'A learning space where students explore the history and evolution of gas turbine engines, including their types and developments over time.',
			link: '/hangar-zone',
			icon: '/icons/hangar-zone.png',
			gradient: 'linear-gradient(135deg, #223A5E 0%, #74B3D4 100%)'
		},
		{
			title: 'TURBOFAN ENGINE',
			description:
				'An immersive hub where students explore a fully rotatable 3D turbofan engine, interact with its components, and discover each section that powers modern flight.',
			link: '/turbofan-engine',
			icon: '/icons/turbofan-engine.png',
			gradient: 'linear-gradient(135deg, #74B3D4 0%, #D75E2E 100%)'
		},
		{
			title: 'OVERHAUL STATION',
			description:
				'A hands-on virtual workshop where students experience the assembly and disassembly of turbofan engine parts while learning the fundamentals of gas turbine engine overhaul.',
			link: '/overhaul-station',
			icon: '/icons/overhaul-station.png',
			gradient: 'linear-gradient(135deg, #D75E2E 0%, #9B8AA4 100%)'
		},
		{
			title: 'TEST BAY',
			description:
				'A checkpoint where students test their knowledge from the Hangar Zone, Turbofan Engine, and Overhaul Bay—time to prove your skills!',
			link: '/test-bay',
			icon: '/icons/test-bay.png',
			gradient: 'linear-gradient(135deg, #9B8AA4 0%, #223A5E 100%)'
		},
		{
			title: 'JAJA AI-ASSISTANT',
			description:
				'Your co-engineer specialized in turbofan engines—ready to answer your questions, guide your learning, and keep your curiosity soaring!',
			link: '/jaja',
			icon: '/icons/jaja.png',
			gradient: 'linear-gradient(135deg, #223A5E 0%, #74B3D4 100%)'
		}
	];
</script>

<SkyBackground />

<div class="homepage">
	<!-- Hero Section -->
	<section class="hero">
		<div class="hero-content">
			<h1 class="hero-title animate-in">
				Welcome to <span
					class="gradient-text gradient-animated"
					style="--active-gradient: var(--logo-gradient)">ThrustLab</span
				>
			</h1>
			<p class="hero-subtitle animate-in delay-1">Experience Learning at Full Thrust</p>
			<p class="hero-description animate-in delay-2">
				Step inside a virtual hangar where learning takes flight — explore, build, and understand
				turbofan engines through immersive 3D interaction and real-time AI support.
			</p>
			<div class="hero-actions animate-in delay-3">
				{#if !data.user}
					<a href="/sign-up" class="cta-button primary">
						Get Started
						<span class="button-shine"></span>
					</a>
					<a href="/login" class="cta-button secondary"> Log In </a>
				{:else}
					<a href="/dashboard" class="cta-button primary">
						Go to Dashboard
						<span class="button-shine"></span>
					</a>
					<a href="/jaja" class="cta-button secondary"> Ask JAJA </a>
				{/if}
			</div>
		</div>

		<div class="scroll-indicator animate-bounce">
			<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor">
				<path
					d="M12 5v14M19 12l-7 7-7-7"
					stroke-width="2"
					stroke-linecap="round"
					stroke-linejoin="round"
				/>
			</svg>
		</div>
	</section>

	<!-- Features Section -->
	<section class="features-section">
		<div class="container">
			<h2 class="section-title">Overview</h2>
			<div class="overview-content animate-on-scroll">
				<p>
					The researchers developed a web-based interactive 3D simulator equipped with AI-integrated
					assistance to teach third-year Aeronautical Engineering students the fundamental concepts
					and operational principles of gas turbine (turbofan) engines. The simulator aimed to
					provide an engaging, hands-on virtual environment where learners could explore, assemble,
					and disassemble engine components while receiving optional real-time AI-guided
					explanations. In addition, the system featured a quiz-type assessment designed to measure
					and reinforce students' learning retention after interacting with the simulator.
				</p>
			</div>
		</div>
	</section>

	<!-- Zones Section -->
	<section class="zones-section">
		<div class="container">
			<h2 class="section-title">Explore Our Learning Zones</h2>
			<div class="zones-grid">
				{#each zones as zone, i}
					<a
						href={zone.link}
						class="zone-card animate-on-scroll"
						style="--delay: {i * 0.15}s; background: {zone.gradient}"
					>
						<div class="zone-icon">
							<img src={zone.icon} alt={zone.title} />
						</div>
						<h3>{zone.title}</h3>
						<p>{zone.description}</p>
						<span class="zone-arrow">→</span>
					</a>
				{/each}
			</div>
		</div>
	</section>

	<!-- Researchers Section -->
	<section class="researchers-section">
		<div class="container">
			<!-- Section Header -->
			<div class="section-header animate-on-scroll">
				<div class="header-line"></div>
				<h2 class="section-title">Meet the Researchers</h2>
			</div>

			<!-- Researchers Cards -->
			<div class="researchers-container animate-on-scroll">
				<div class="researcher-card" style="--delay: 0s">
					<div class="card-inner">
						<div class="card-front">
							<div class="photo-wrapper">
								<div class="photo-glow"></div>
								<img src="/images/researchers/jannah.jpeg" alt="Jannah Michellaine C. Cristobal" />
							</div>
							<div class="card-info">
								<h3>Jannah Michellaine C. Cristobal</h3>
								<div class="role-badge">Researcher</div>
							</div>
						</div>
					</div>
				</div>

				<div class="researcher-card" style="--delay: 0.1s">
					<div class="card-inner">
						<div class="card-front">
							<div class="photo-wrapper">
								<div class="photo-glow"></div>
								<img src="/images/researchers/alfred.jpeg" alt="Alfred Rupert D. De Guzman" />
							</div>
							<div class="card-info">
								<h3>Alfred Rupert D. De Guzman</h3>
								<div class="role-badge">Researcher</div>
							</div>
						</div>
					</div>
				</div>

				<div class="researcher-card" style="--delay: 0.2s">
					<div class="card-inner">
						<div class="card-front">
							<div class="photo-wrapper">
								<div class="photo-glow"></div>
								<img src="/images/researchers/janssen.jpeg" alt="Janssen M. Palac" />
							</div>
							<div class="card-info">
								<h3>Janssen M. Palac</h3>
								<div class="role-badge">Researcher</div>
							</div>
						</div>
					</div>
				</div>

				<div class="researcher-card" style="--delay: 0.3s">
					<div class="card-inner">
						<div class="card-front">
							<div class="photo-wrapper">
								<div class="photo-glow"></div>
								<img src="/images/researchers/marc.jpeg" alt="Marc Ashriel V. San Pedro" />
							</div>
							<div class="card-info">
								<h3>Marc Ashriel V. San Pedro</h3>
								<div class="role-badge">Researcher</div>
							</div>
						</div>
					</div>
				</div>
			</div>

			<!-- Bottom Info Bar -->
			<div class="info-bar animate-on-scroll">
				<div class="info-item">
					<div class="info-text">
						<span class="info-label">Academic Year</span>
						<span class="info-value">2025-2026</span>
					</div>
				</div>
				<div class="info-divider"></div>
				<div class="info-item">
					<div class="info-text">
						<span class="info-label">Research Adviser</span>
						<span class="info-value">Engr. Johannah Marie T. Reynaldo</span>
					</div>
				</div>
			</div>
		</div>
	</section>

	<!-- Footer -->
	<footer class="footer animate-on-scroll">
		<div class="footer-content">
			<div class="footer-brand">
				<img src="/icons/thrustlab-logo.png" alt="ThrustLab" class="footer-logo" />
			</div>
			<div class="copyright-container">
				<p class="copyright-text">
					<span class="copyright-accent">© 2026 Group 7.</span> Website platform owned by Group 7,
					Institute of Engineering and Technology.
					<span class="mt-2 block md:mt-0">
						AE 325 - Powerplant II content <span class="copyright-accent"
							>© National Aviation Academy of the Philippines.</span
						>
						All rights reserved.
					</span>
				</p>
			</div>
		</div>
	</footer>
</div>

<style>
	.homepage {
		width: 100%;
		overflow-x: hidden;
		position: relative;
	}

	/* Hero Section */
	.hero {
		position: relative;
		min-height: 100vh;
		display: flex;
		align-items: center;
		justify-content: center;
		overflow: hidden;
	}

	.hero-content {
		position: relative;
		z-index: 10;
		text-align: center;
		max-width: 900px;
		padding: var(--spacing-lg);
	}

	/* Unified Animated Gradient for All Main Headings */
	/* gradient-flash moved to src/app.css for global reuse */

	.hero-title {
		font-family: var(--font-heading);
		font-size: clamp(2.5rem, 6vw, 4.5rem);
		font-weight: 900;
		margin: 0 0 1rem 0;
		line-height: 1.2;
		color: white;
		background-size: 200% 100%;
	}

	.gradient-text {
		background: var(--active-gradient, var(--hangar-gradient));
		background-size: 200% 100%;
		-webkit-background-clip: text;
		-webkit-text-fill-color: transparent;
		background-clip: text;
		animation: gradient-flash var(--gradient-duration) ease-in-out infinite;
	}

	.hero-subtitle {
		font-family: var(--font-special);
		font-size: clamp(1.2rem, 3vw, 1.8rem);
		margin: 0 0 1.5rem 0;
		font-weight: 400;
		color: var(--navbar-accent, var(--ui-yellow));
		text-shadow: 0 2px 8px rgba(0, 0, 0, 0.7);
	}

	.hero-description {
		font-family: var(--font-body);
		font-size: clamp(1.1rem, 2vw, 1.3rem);
		color: #ffffff;
		line-height: 1.8;
		margin: 0 0 2.5rem 0;
		max-width: 700px;
		margin-left: auto;
		margin-right: auto;
		font-weight: 500;
		text-shadow:
			0 3px 10px rgba(0, 0, 0, 0.9),
			0 2px 5px rgba(0, 0, 0, 0.8);
	}

	.hero-actions {
		display: flex;
		gap: 1.5rem;
		justify-content: center;
		flex-wrap: wrap;
	}

	.cta-button {
		position: relative;
		font-family: var(--font-heading);
		font-size: 1.15rem;
		font-weight: 700;
		padding: 1.25rem 3rem;
		border-radius: 50px;
		text-decoration: none;
		text-transform: uppercase;
		letter-spacing: 1px;
		transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
		overflow: hidden;
		display: inline-flex;
		align-items: center;
		gap: 0.75rem;
		will-change: transform;
		cursor: pointer;
	}

	.cta-button::before {
		content: '';
		position: absolute;
		top: 50%;
		left: 50%;
		width: 0;
		height: 0;
		border-radius: 50%;
		background: rgba(255, 255, 255, 0.3);
		transform: translate(-50%, -50%);
		transition:
			width 0.6s ease,
			height 0.6s ease;
		pointer-events: none;
	}

	.cta-button:hover::before {
		width: 400px;
		height: 400px;
	}

	.cta-button.primary {
		background: linear-gradient(135deg, var(--navbar-accent, var(--ui-yellow)) 0%, #ffe66d 100%);
		color: #000000;
		border: 3px solid var(--navbar-accent, var(--ui-yellow));
		box-shadow:
			0 6px 20px rgba(var(--navbar-accent-rgb, 255, 217, 102), 0.5),
			0 0 40px rgba(var(--navbar-accent-rgb, 255, 217, 102), 0.2);
		font-weight: 700;
	}

	.cta-button.primary:hover {
		background: linear-gradient(135deg, #ffe66d 0%, var(--navbar-accent, var(--ui-yellow)) 100%);
		transform: translateY(-5px) scale(1.05);
		box-shadow:
			0 12px 35px rgba(var(--navbar-accent-rgb, 255, 217, 102), 0.7),
			0 0 60px rgba(var(--navbar-accent-rgb, 255, 217, 102), 0.4);
		border-color: #ffe66d;
	}

	.cta-button.secondary {
		background: rgba(10, 47, 53, 0.6);
		backdrop-filter: blur(10px);
		-webkit-backdrop-filter: blur(10px);
		color: var(--font-secondary);
		border: 3px solid rgba(135, 206, 235, 0.5);
		box-shadow: 0 4px 15px rgba(135, 206, 235, 0.3);
	}

	.cta-button.secondary:hover {
		background: rgba(135, 206, 235, 0.3);
		border-color: var(--ui-light-blue);
		transform: translateY(-5px) scale(1.05);
		box-shadow:
			0 8px 25px rgba(135, 206, 235, 0.5),
			0 0 40px rgba(135, 206, 235, 0.3);
	}

	.button-shine {
		position: absolute;
		top: 0;
		left: -100%;
		width: 100%;
		height: 100%;
		background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.5), transparent);
		transition: left 0.6s ease;
		pointer-events: none;
	}

	.cta-button:hover .button-shine {
		left: 100%;
	}

	.scroll-indicator {
		position: absolute;
		bottom: 2rem;
		left: 50%;
		transform: translateX(-50%);
		color: var(--font-secondary);
		z-index: 10;
	}

	/* Animations */
	.animate-in {
		opacity: 0;
		transform: translateY(30px);
		animation: fadeInUp 0.8s ease forwards;
	}

	.delay-1 {
		animation-delay: 0.2s;
	}
	.delay-2 {
		animation-delay: 0.4s;
	}
	.delay-3 {
		animation-delay: 0.6s;
	}

	@keyframes fadeInUp {
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}

	@keyframes animate-bounce {
		0%,
		100% {
			transform: translateX(-50%) translateY(0);
		}
		50% {
			transform: translateX(-50%) translateY(10px);
		}
	}

	.animate-bounce {
		animation: animate-bounce 2s ease-in-out infinite;
	}

	/* Features Section */
	.features-section {
		padding: calc(var(--spacing-xxl) * 1.5) var(--container-side-padding);
		background: transparent;
		position: relative;
		z-index: 1;
		/* Performance: Use CSS containment to isolate rendering work */
		contain: layout style paint;
		content-visibility: auto; /* Only render when visible in viewport */
	}

	.container {
		max-width: 1200px;
		margin: 0 auto;
	}

	.section-title {
		font-family: var(--font-heading);
		font-size: clamp(2.5rem, 6vw, 4.5rem);
		font-weight: 900;
		text-align: center;
		margin: 0 0 3rem 0;
		line-height: 1.2;
		background: var(--active-gradient, var(--hangar-gradient));
		background-size: 200% 100%;
		-webkit-background-clip: text;
		-webkit-text-fill-color: transparent;
		background-clip: text;
		animation: gradient-flash var(--gradient-duration) ease-in-out infinite;
		filter: drop-shadow(0 2px 8px rgba(0, 0, 0, 0.8));
		will-change: background-position;
	}

	/* Zones Section */
	.zones-section {
		padding: calc(var(--spacing-xxl) * 1.5) var(--container-side-padding);
		background: transparent;
		position: relative;
		z-index: 1;
		/* Performance: Use CSS containment to isolate rendering work */
		contain: layout style paint;
		content-visibility: auto; /* Only render when visible in viewport */
	}

	.zones-grid {
		display: grid;
		grid-template-columns: repeat(5, 1fr);
		gap: 1.5rem;
		max-width: 100%;
		overflow: visible;
	}

	.zone-card {
		position: relative;
		padding: var(--spacing-lg) var(--spacing-md);
		border-radius: 1.5rem;
		color: var(--font-primary);
		text-decoration: none;
		overflow: hidden;
		transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
		opacity: 0;
		transform: scale(0.9);
		will-change: transform;
		/* Glassmorphism Effect */
		background: rgba(10, 47, 53, 0.4) !important;
		backdrop-filter: blur(20px) saturate(180%);
		-webkit-backdrop-filter: blur(20px) saturate(180%);
		box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
		border: 1px solid rgba(255, 255, 255, 0.18);
		display: flex;
		flex-direction: column;
		min-height: 380px;
	}

	.zone-card::after {
		content: '';
		position: absolute;
		top: -50%;
		left: -50%;
		width: 200%;
		height: 200%;
		background: linear-gradient(
			45deg,
			transparent 30%,
			rgba(255, 255, 255, 0.1) 50%,
			transparent 70%
		);
		transform: rotate(45deg);
		transition: all 0.6s ease;
	}

	.zone-card:hover::after {
		left: 100%;
	}

	:global(.zone-card.visible) {
		opacity: 1;
		transform: scale(1);
		transition-delay: var(--delay, 0s);
	}

	.zone-card::before {
		content: '';
		position: absolute;
		inset: 0;
		background: rgba(0, 0, 0, 0.2);
		opacity: 0;
		transition: opacity 0.4s ease;
	}

	.zone-card:hover::before {
		opacity: 1;
	}

	.zone-card:hover {
		transform: scale(1.05) translateY(-10px);
		box-shadow: 0 12px 40px rgba(var(--navbar-accent-rgb, 255, 217, 102), 0.4); /* Zone glow */
		background: rgba(28, 46, 58, 0.6) !important;
		border: 1px solid var(--navbar-accent, var(--ui-yellow));
	}

	.zone-icon {
		font-size: 3rem;
		margin-bottom: 1rem;
		transition: transform 0.4s ease;
		flex-shrink: 0;
		filter: drop-shadow(0 2px 8px rgba(0, 0, 0, 0.5));
	}

	.zone-card:hover .zone-icon {
		transform: scale(1.2) rotate(10deg);
		filter: drop-shadow(0 4px 12px rgba(var(--navbar-accent-rgb, 255, 217, 102), 0.6));
	}

	.zone-card h3 {
		font-family: var(--font-heading);
		font-size: 1.3rem;
		font-weight: 900;
		margin: 0 0 0.75rem 0;
		line-height: 1.3;
		background: var(--active-gradient, var(--hangar-gradient));
		background-size: 200% 100%;
		-webkit-background-clip: text;
		-webkit-text-fill-color: transparent;
		background-clip: text;
		animation: gradient-flash var(--gradient-duration) ease-in-out infinite;
		filter: drop-shadow(0 2px 6px rgba(0, 0, 0, 0.8));
	}

	.zone-card p {
		font-family: var(--font-body);
		font-size: 0.9rem;
		line-height: 1.5;
		margin: 0 0 1.5rem 0;
		color: var(--font-secondary);
		flex-grow: 1;
	}

	.zone-arrow {
		position: absolute;
		bottom: 2rem;
		right: 2rem;
		font-size: 2rem;
		transition: transform 0.4s ease;
	}

	.zone-card:hover .zone-arrow {
		transform: translateX(10px);
	}

	/* CTA Section */
	/* Researchers Section */
	.researchers-section {
		padding: calc(var(--spacing-xxl) * 1.5) var(--container-side-padding) var(--spacing-xxl);
		background: transparent;
		position: relative;
		z-index: 1;
		/* Performance: Use CSS containment to isolate rendering work */
		contain: layout style paint;
		content-visibility: auto; /* Only render when visible in viewport */
	}

	/* Section Header */
	.section-header {
		text-align: center;
		margin-bottom: 6rem;
		position: relative;
	}

	.header-line {
		width: 100px;
		height: 4px;
		background: linear-gradient(
			90deg,
			transparent,
			var(--navbar-accent, var(--ui-yellow)),
			transparent
		);
		margin: 0 auto 2rem;
		border-radius: 2px;
		animation: pulse-glow 2s ease-in-out infinite;
	}

	@keyframes pulse-glow {
		0%,
		100% {
			opacity: 0.5;
			transform: scaleX(1);
		}
		50% {
			opacity: 1;
			transform: scaleX(1.2);
		}
	}

	.researchers-section .section-title {
		font-size: clamp(2.5rem, 6vw, 4.5rem);
		letter-spacing: -1px;
	}

	/* Overview Content */
	.overview-content {
		max-width: 1000px;
		margin: 0 auto;
		padding: var(--spacing-xl);
		text-align: justify;
		/* Glassmorphism Effect with UI colors */
		background: rgba(10, 47, 53, 0.5); /* Dark Teal */
		backdrop-filter: blur(20px) saturate(180%);
		-webkit-backdrop-filter: blur(20px) saturate(180%);
		border-radius: 1.5rem;
		box-shadow: 0 8px 32px rgba(0, 0, 0, 0.5);
		border: 1px solid rgba(135, 206, 235, 0.3);
	}

	.overview-content p {
		font-family: var(--font-body);
		font-size: 1.1rem;
		line-height: 1.8;
		color: var(--font-secondary);
		text-shadow: 0 2px 10px rgba(0, 0, 0, 0.5);
		margin: 0;
	}

	/* Zone Icon Images */
	.zone-icon img {
		width: 60px;
		height: 60px;
		object-fit: contain;
		filter: drop-shadow(0 4px 8px rgba(0, 0, 0, 0.2));
		border-radius: 8px; /* Add curved edges to all icons */
	}

	/* JAJA Icon - 10% larger with curved edges */
	.zone-card:nth-child(5) .zone-icon img {
		width: 66px; /* 10% increase from 60px */
		height: 66px;
		border-radius: 12px; /* Slightly more rounded for larger icon */
	}

	/* Researchers Container */
	.researchers-container {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
		gap: 2.5rem;
		max-width: 1200px;
		margin: 0 auto 5rem;
		padding: 0 1rem;
	}

	/* Researcher Card */
	.researcher-card {
		position: relative;
		height: 360px;
		perspective: 1000px;
		animation: fadeInUp 0.8s ease forwards;
		animation-delay: var(--delay);
		opacity: 0;
	}

	@keyframes fadeInUp {
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}

	.card-inner {
		position: relative;
		width: 100%;
		height: 100%;
		transition: transform 0.6s;
		transform-style: preserve-3d;
	}

	.researcher-card:hover .card-inner {
		transform: translateY(-15px);
	}

	.card-front {
		position: absolute;
		width: 100%;
		height: 100%;
		backface-visibility: hidden;
		background: linear-gradient(135deg, rgba(0, 0, 0, 0.4) 0%, rgba(0, 0, 0, 0.2) 100%);
		border-radius: 20px;
		padding: var(--spacing-lg) var(--spacing-md);
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		gap: var(--spacing-md);
		border: 2px solid rgba(135, 206, 235, 0.2);
		transition: all 0.4s ease;
		overflow: hidden;
	}

	.card-front::before {
		content: '';
		position: absolute;
		top: -50%;
		left: -50%;
		width: 200%;
		height: 200%;
		background: radial-gradient(
			circle,
			rgba(var(--navbar-accent-rgb, 255, 217, 102), 0.1) 0%,
			transparent 70%
		);
		opacity: 0;
		transition: opacity 0.4s ease;
	}

	.researcher-card:hover .card-front {
		border-color: var(--navbar-accent, var(--ui-yellow));
		background: linear-gradient(135deg, rgba(0, 0, 0, 0.6) 0%, rgba(0, 0, 0, 0.3) 100%);
		box-shadow:
			0 20px 60px rgba(var(--navbar-accent-rgb, 255, 217, 102), 0.3),
			0 0 80px rgba(135, 206, 235, 0.2);
	}

	.researcher-card:hover .card-front::before {
		opacity: 1;
	}

	/* Photo Wrapper */
	.photo-wrapper {
		position: relative;
		width: 160px;
		height: 160px;
		border-radius: 50%;
	}

	.photo-glow {
		position: absolute;
		top: 50%;
		left: 50%;
		transform: translate(-50%, -50%);
		width: 180px;
		height: 180px;
		border-radius: 50%;
		background: radial-gradient(circle, var(--navbar-accent, var(--ui-yellow)) 0%, transparent 70%);
		opacity: 0;
		transition: opacity 0.4s ease;
		z-index: 0;
	}

	.researcher-card:hover .photo-glow {
		opacity: 0.3;
		animation: pulse-ring 2s ease-in-out infinite;
	}

	@keyframes pulse-ring {
		0%,
		100% {
			transform: translate(-50%, -50%) scale(1);
			opacity: 0.3;
		}
		50% {
			transform: translate(-50%, -50%) scale(1.1);
			opacity: 0.5;
		}
	}

	.photo-wrapper img {
		position: relative;
		width: 100%;
		height: 100%;
		border-radius: 50%;
		object-fit: cover;
		border: 4px solid rgba(135, 206, 235, 0.4);
		box-shadow: 0 8px 30px rgba(0, 0, 0, 0.6);
		transition: all 0.4s ease;
		z-index: 1;
	}

	.researcher-card:hover .photo-wrapper img {
		border-color: var(--navbar-accent, var(--ui-yellow));
		box-shadow:
			0 12px 50px rgba(var(--navbar-accent-rgb, 255, 217, 102), 0.5),
			0 0 60px rgba(var(--navbar-accent-rgb, 255, 217, 102), 0.3);
		transform: scale(1.05);
	}

	/* Card Info */
	.card-info {
		text-align: center;
		z-index: 2;
	}

	.card-info h3 {
		font-family: var(--font-heading);
		font-size: 1.1rem;
		font-weight: 800;
		margin: 0 0 0.75rem 0;
		line-height: 1.3;
		transition: all 0.3s ease;
		background: linear-gradient(90deg, #ffffff 0%, var(--ui-light-blue) 50%, #ffffff 100%);
		background-size: 200% 100%;
		-webkit-background-clip: text;
		-webkit-text-fill-color: transparent;
		background-clip: text;
		animation: gradient-flash var(--gradient-duration) ease-in-out infinite;
		filter: drop-shadow(0 2px 10px rgba(0, 0, 0, 0.8));
	}

	.researcher-card:hover .card-info h3 {
		background: linear-gradient(
			90deg,
			var(--navbar-accent, var(--ui-yellow)) 0%,
			var(--font-accent-yellow) 50%,
			var(--navbar-accent, var(--ui-yellow)) 100%
		);
		background-size: 200% 100%;
		-webkit-background-clip: text;
		-webkit-text-fill-color: transparent;
		background-clip: text;
		animation: gradient-flash var(--gradient-duration) ease-in-out infinite;
		filter: drop-shadow(0 2px 10px rgba(var(--navbar-accent-rgb, 255, 217, 102), 0.6))
			drop-shadow(0 0 20px rgba(var(--navbar-accent-rgb, 255, 217, 102), 0.4));
	}

	.role-badge {
		display: inline-block;
		padding: 0.5rem 1.5rem;
		background: rgba(135, 206, 235, 0.2);
		border: 1px solid rgba(135, 206, 235, 0.4);
		border-radius: 50px;
		font-family: var(--font-body);
		font-size: 0.85rem;
		font-weight: 600;
		color: var(--ui-light-blue);
		text-transform: uppercase;
		letter-spacing: 1px;
		transition: all 0.3s ease;
	}

	.researcher-card:hover .role-badge {
		background: rgba(var(--navbar-accent-rgb, 255, 217, 102), 0.2);
		border-color: var(--navbar-accent, var(--ui-yellow));
		color: var(--navbar-accent, var(--ui-yellow));
		box-shadow: 0 0 20px rgba(var(--navbar-accent-rgb, 255, 217, 102), 0.3);
	}

	/* Info Bar */
	.info-bar {
		max-width: 900px;
		margin: 0 auto;
		display: flex;
		justify-content: center;
		align-items: center;
		gap: var(--spacing-xl);
		padding: var(--spacing-lg) 0;
	}

	.info-item {
		display: flex;
		align-items: center;
		gap: 1.5rem;
	}

	.info-text {
		display: flex;
		flex-direction: column;
		gap: 0.25rem;
		text-align: left;
	}

	.info-label {
		font-family: var(--font-body);
		font-size: 1.2rem;
		color: #2c3e50; /* Fallback */
		background: linear-gradient(180deg, #434343 0%, #000000 100%);
		-webkit-background-clip: text;
		-webkit-text-fill-color: transparent;
		background-clip: text;
		text-transform: uppercase;
		letter-spacing: 1.5px;
		font-weight: 800;
		text-shadow: 0px 1px 1px rgba(255, 255, 255, 0.3);
	}

	.info-value {
		font-family: var(--font-heading);
		font-size: 1.5rem;
		font-weight: 900;
		color: #1a1a1a; /* Fallback */
		background: linear-gradient(180deg, #2c3e50 0%, #000000 100%);
		-webkit-background-clip: text;
		-webkit-text-fill-color: transparent;
		background-clip: text;
		filter: drop-shadow(0 2px 4px rgba(255, 255, 255, 0.2));
	}

	.info-divider {
		width: 2px;
		height: 60px;
		background: linear-gradient(180deg, transparent, rgba(135, 206, 235, 0.5), transparent);
	}

	/* Scroll animations */
	.animate-on-scroll {
		opacity: 0;
		transform: translateY(50px);
		transition: all 0.8s cubic-bezier(0.4, 0, 0.2, 1);
	}

	:global(.animate-on-scroll.visible) {
		opacity: 1;
		transform: translateY(0);
	}

	@media (max-width: 1400px) {
		.zones-grid {
			grid-template-columns: repeat(3, 1fr);
		}

		.zone-card {
			min-height: 360px;
		}
	}

	@media (max-width: 1200px) {
		.researchers-container {
			grid-template-columns: repeat(2, 1fr);
			gap: 2rem;
		}
	}

	@media (max-width: 900px) {
		.zones-grid {
			grid-template-columns: repeat(2, 1fr);
		}
	}

	@media (max-width: 768px) {
		.hero-actions {
			flex-direction: column;
			align-items: stretch;
		}

		.cta-button {
			width: 100%;
			justify-content: center;
		}

		.zones-grid {
			grid-template-columns: 1fr;
		}

		.researchers-container {
			grid-template-columns: repeat(2, 1fr);
			gap: 1.5rem;
		}

		.researcher-card {
			height: 340px;
		}

		.overview-content {
			padding: var(--spacing-lg) var(--spacing-md);
		}

		.overview-content p {
			font-size: 1rem;
		}

		.researchers-section {
			padding: calc(var(--spacing-xxl) * 2) var(--container-side-padding)
				calc(var(--spacing-xxl) * 1.5);
		}

		.section-header {
			margin-bottom: 4rem;
		}

		.info-bar {
			flex-direction: column;
			gap: 2rem;
			padding: var(--spacing-lg) 0;
		}

		.info-divider {
			width: 80%;
			height: 2px;
			background: linear-gradient(90deg, transparent, rgba(135, 206, 235, 0.5), transparent);
		}

		.info-item {
			flex-direction: column;
			text-align: center;
			gap: 1rem;
		}

		.info-text {
			align-items: center;
		}

		.zone-card {
			min-height: auto;
			padding: var(--card-padding) var(--container-side-padding);
		}

		.zone-icon {
			font-size: 3.5rem;
		}

		.zone-icon img {
			width: 70px;
			height: 70px;
		}

		.zone-card h3 {
			font-size: 1.6rem;
		}

		.zone-card p {
			font-size: 1rem;
		}
	}

	@media (max-width: 480px) {
		.researchers-container {
			grid-template-columns: 1fr;
		}

		.researcher-card {
			height: 360px;
		}

		.photo-wrapper {
			width: 140px;
			height: 140px;
		}

		.photo-wrapper img {
			width: 140px;
			height: 140px;
		}
	}

	/* Footer Styles */
	.footer {
		padding: 6rem var(--container-side-padding) 4rem;
		background: rgba(10, 47, 53, 0.4);
		backdrop-filter: blur(20px) saturate(180%);
		-webkit-backdrop-filter: blur(20px) saturate(180%);
		border-top: 1px solid rgba(135, 206, 235, 0.2);
		position: relative;
		z-index: 10;
		margin-top: 4rem;
		overflow: hidden;
	}

	.footer::before {
		content: '';
		position: absolute;
		top: 0;
		left: 50%;
		transform: translateX(-50%);
		width: 100%;
		max-width: 1200px;
		height: 1px;
		background: linear-gradient(90deg, transparent, var(--ui-light-blue), transparent);
		opacity: 0.3;
	}

	.footer-content {
		max-width: 1200px;
		margin: 0 auto;
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 3rem;
		text-align: center;
	}

	.footer-logo {
		width: 240px;
		height: auto;
		object-fit: contain;
		filter: drop-shadow(0 4px 12px rgba(0, 0, 0, 0.5));
		transition: all 0.4s ease;
		opacity: 0.9;
		margin-bottom: 1rem;
	}

	.footer-logo:hover {
		transform: scale(1.05);
		opacity: 1;
		filter: drop-shadow(0 6px 20px rgba(var(--navbar-accent-rgb, 255, 217, 102), 0.4));
	}

	.copyright-text {
		color: rgba(255, 255, 255, 0.7);
		font-family: var(--font-body);
		font-size: 1rem;
		line-height: 1.8;
		max-width: 800px;
		text-shadow: 0 2px 10px rgba(0, 0, 0, 0.5);
	}

	.copyright-accent {
		color: var(--navbar-accent, var(--ui-yellow));
		font-weight: 700;
		letter-spacing: 0.5px;
	}

	.block {
		display: block;
	}

	.mt-2 {
		margin-top: 0.5rem;
	}

	@media (max-width: 768px) {
		.footer {
			padding: 4rem var(--container-side-padding) 3rem;
		}

		.footer-logo {
			width: 180px;
		}

		.copyright-text {
			font-size: 0.9rem;
		}

		.md\:mt-0 {
			margin-top: 0;
		}
	}
</style>
