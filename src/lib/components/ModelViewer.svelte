<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import { fade } from 'svelte/transition';
	// Remove static Babylon imports to reduce bundle size
	// import { ... } from '@babylonjs/core';
	import { ttsService } from '$lib/utils/tts';

	interface ModelViewerProps {
		modelPath: string;
		canvasClass?: string;
		cameraPosition?: { alpha: number; beta: number; radius: number };
		enableHighlight?: boolean;
		partDescriptions?: Record<string, { name: string; description: string }>;
		onModelLoaded?: () => void;
		enableTTS?: boolean;
		autoLoad?: boolean;
	}

	let {
		modelPath,
		canvasClass = 'model-canvas',
		cameraPosition = { alpha: Math.PI / 2, beta: Math.PI / 3, radius: 5 },
		enableHighlight = true,
		partDescriptions = {},
		onModelLoaded,
		enableTTS = true,
		autoLoad = false,
		enableDefaultControls = true,
		showLabels = false
	}: ModelViewerProps & { enableDefaultControls?: boolean; showLabels?: boolean } = $props();

	let canvas: HTMLCanvasElement;

	// Dynamically loaded Babylon modules
	let Engine: any;
	let Scene: any;
	let ArcRotateCamera: any;
	let Vector3: any;
	let HemisphericLight: any;
	let SceneLoader: any;
	let Color4: any;
	let HighlightLayer: any;
	let PointerEventTypes: any;
	let Color3: any;
	let Mesh: any;
	let GUI: any;
	let TransformNode: any;

	let engine: any | null = null;
	let scene: any | null = null;
	let highlightLayer: any | null = null;
	let observer: IntersectionObserver | null = null;
	let isVisible = false;
	let hasLoaded = $state(false);
	let isLoading = $state(false);
	let tooltipVisible = $state(false);
	let tooltipContent = $state({ name: '', description: '' });
	let isPlayingAudio = $state(false);
	let audioError = $state<string | null>(null);
	let showControls = $state(true);
	let advancedTexture: any;
	let labelControls: any[] = [];
	let labelAnchors: any[] = [];

	const sanitizeValue = (value?: string | null) =>
		(value || '')
			.toLowerCase()
			.replace(/[^a-z0-9]+/g, ' ')
			.trim()
			.replace(/\s+/g, ' ');

	const buildSearchable = (value?: string | null) => {
		const sanitized = sanitizeValue(value);
		return sanitized ? ` ${sanitized} ` : '';
	};

	const DEFAULT_ACCENT_HEX = '#FFD700';

	const hexToRgba = (hex: string, alpha = 1) => {
		const cleanHex = hex.replace('#', '');
		const bigint = parseInt(cleanHex, 16);
		const r = (bigint >> 16) & 255;
		const g = (bigint >> 8) & 255;
		const b = bigint & 255;
		return `rgba(${r}, ${g}, ${b}, ${alpha})`;
	};

	let activeAccent = $state({
		hex: DEFAULT_ACCENT_HEX,
		soft: hexToRgba(DEFAULT_ACCENT_HEX, 0.15),
		glow: hexToRgba(DEFAULT_ACCENT_HEX, 0.5)
	});

	let DEFAULT_HOVER_COLOR: any;
	let GREY_OVERLAY_COLOR: any;

	let GROUP_STYLES: Record<string, { color: any; accentHex: string }> = {};

	const groupMeshMap = new Map<string, any[]>();
	let currentSelectedGroup: string | null = null;
	let currentHoverGroup: string | null = null;

	const setActiveAccent = (groupName: string | null) => {
		const accent = groupName ? GROUP_STYLES[groupName] : null;
		const hex = accent?.accentHex ?? DEFAULT_ACCENT_HEX;
		activeAccent = {
			hex,
			soft: hexToRgba(hex, 0.15),
			glow: hexToRgba(hex, 0.5)
		};
	};

	const getMeshesByGroup = (groupName: string) => {
		if (!scene || !partDescriptions) return [];
		const meshes: any[] = [];

		// Find all parts that belong to this group
		Object.entries(partDescriptions).forEach(([meshId, part]) => {
			if (part.name === groupName || (part.description && part.description.includes(groupName))) {
				const mesh = scene.getMeshByName(meshId);
				if (mesh) meshes.push(mesh);
			}
		});

		// If no direct matches, try to find by mesh name convention usually used in labeling
		if (meshes.length === 0) {
			scene.meshes.forEach((mesh: any) => {
				if (mesh && mesh.name && mesh.name.includes(groupName)) {
					meshes.push(mesh);
				}
			});
		}

		return meshes;
	};

	// Label Update Logic
	const updateLabels = () => {
		if (!GUI || !scene) return;

		// Clean up existing labels and anchors
		labelControls.forEach((control) => control.dispose());
		labelControls = [];
		labelAnchors.forEach((anchor) => anchor.dispose());
		labelAnchors = [];

		if (advancedTexture) {
			advancedTexture.dispose();
			advancedTexture = null;
		}

		if (!showLabels || !scene || !GUI) return;

		// Create new texture
		advancedTexture = GUI.AdvancedDynamicTexture.CreateFullscreenUI('UI');

		// Create labels for each group
		if (GROUP_STYLES) {
			Object.entries(GROUP_STYLES).forEach(([groupName, style]) => {
				const meshes = getMeshesByGroup(groupName);
				if (!meshes.length) return;

				// Calculate center of group
				let min = new Vector3(Number.MAX_VALUE, Number.MAX_VALUE, Number.MAX_VALUE);
				let max = new Vector3(Number.MIN_VALUE, Number.MIN_VALUE, Number.MIN_VALUE);

				meshes.forEach((mesh: any) => {
					const boundingInfo = mesh.getBoundingInfo();
					min = Vector3.Minimize(min, boundingInfo.boundingBox.minimumWorld);
					max = Vector3.Maximize(max, boundingInfo.boundingBox.maximumWorld);
				});

				const center = Vector3.Center(min, max);

				// Create labels at calculated positions
				// We create a TransformNode at the center to "anchor" the label
				const transformNode = new TransformNode('labelClient_' + groupName, scene);
				transformNode.position = center;
				labelAnchors.push(transformNode);

				// Create Label Container (Rectangle)
				const rect1 = new GUI.Rectangle();
				rect1.width = '160px';
				rect1.height = '40px';
				rect1.cornerRadius = 20;
				rect1.color = style.accentHex;
				rect1.thickness = 2;
				rect1.background = 'rgba(10, 25, 47, 0.85)';
				advancedTexture.addControl(rect1);
				labelControls.push(rect1);

				// Label Text
				const label = new GUI.TextBlock();
				label.text = groupName;
				label.color = 'white';
				label.fontSize = 14;
				label.fontWeight = 'bold';
				rect1.addControl(label);

				rect1.linkWithMesh(transformNode);
				rect1.linkOffsetY = -60;
				rect1.linkOffsetX = 60;

				// Target Dot
				const target = new GUI.Ellipse();
				target.width = '10px';
				target.height = '10px';
				target.color = style.accentHex;
				target.thickness = 2;
				target.background = style.accentHex;
				advancedTexture.addControl(target);
				labelControls.push(target);
				target.linkWithMesh(transformNode);

				// Connecting Line
				const line = new GUI.Line();
				line.lineWidth = 2;
				line.color = style.accentHex;
				line.connectedControl = rect1;
				line.linkWithMesh(transformNode);
				advancedTexture.addControl(line);
				labelControls.push(line);
			});
		}
	};

	// Reactive effect for labels
	$effect(() => {
		// Re-run when model loads or toggle changes
		if (hasLoaded && showLabels) {
			updateLabels();
		} else if (!showLabels) {
			// Ensure cleanup if toggled off
			updateLabels();
		}
	});

	function setupHighlighting(scene: any) {
		highlightLayer = new HighlightLayer('highlightLayer', scene);
		highlightLayer.blurHorizontalSize = 0.8;
		highlightLayer.blurVerticalSize = 0.8;

		scene.onPointerObservable.add((pointerInfo: any) => {
			if (pointerInfo.type === PointerEventTypes.POINTERMOVE) {
				const pickResult = scene.pick(scene.pointerX, scene.pointerY);

				if (pickResult.hit && pickResult.pickedMesh) {
					const description = findPartDescription(pickResult.pickedMesh);
					if (description) {
						const groupName = description.name;
						if (currentSelectedGroup === groupName) {
							if (currentHoverGroup && currentHoverGroup !== groupName) {
								clearGroupHighlight(currentHoverGroup);
								currentHoverGroup = null;
							}
						} else if (currentHoverGroup !== groupName) {
							if (currentHoverGroup) {
								clearGroupHighlight(currentHoverGroup);
							}
							addGroupHighlight(groupName, getGroupColor(groupName));
							currentHoverGroup = groupName;
						}
					} else if (currentHoverGroup) {
						clearGroupHighlight(currentHoverGroup);
						currentHoverGroup = null;
					}
				} else if (currentHoverGroup) {
					clearGroupHighlight(currentHoverGroup);
					currentHoverGroup = null;
				}
			} else if (pointerInfo.type === PointerEventTypes.POINTERDOWN) {
				const pickResult = scene.pick(scene.pointerX, scene.pointerY);

				if (pickResult.hit && pickResult.pickedMesh) {
					const description = findPartDescription(pickResult.pickedMesh);

					if (description) {
						const groupName = description.name;

						if (currentHoverGroup) {
							clearGroupHighlight(currentHoverGroup);
							currentHoverGroup = null;
						}

						if (currentSelectedGroup === groupName) {
							resetSelection();
						} else {
							resetSelection();
							currentSelectedGroup = groupName;
							tooltipContent = description;
							tooltipVisible = true;
							setActiveAccent(groupName);
							addGroupHighlight(groupName, getGroupColor(groupName));
							applyOverlayState(groupName);

							if (enableTTS) {
								playComponentDescription(description);
							}
						}
					} else {
						if (currentHoverGroup) {
							clearGroupHighlight(currentHoverGroup);
							currentHoverGroup = null;
						}
						resetSelection();
					}
				} else {
					if (currentHoverGroup) {
						clearGroupHighlight(currentHoverGroup);
						currentHoverGroup = null;
					}
					resetSelection();
				}
			}
		});
	}
	const getGroupColor = (groupName: string) =>
		GROUP_STYLES[groupName]?.color ?? DEFAULT_HOVER_COLOR;

	const clearGroupHighlight = (groupName: string | null) => {
		if (!highlightLayer || !groupName) return;
		const meshes = getMeshesByGroup(groupName);
		meshes.forEach((mesh) => highlightLayer?.removeMesh(mesh));
	};

	const addGroupHighlight = (groupName: string, color?: any) => {
		if (!highlightLayer) return;
		const meshes = getMeshesByGroup(groupName);
		if (!meshes.length) return;
		const highlightColor = color ?? getGroupColor(groupName);
		meshes.forEach((mesh) => highlightLayer?.addMesh(mesh, highlightColor));
	};

	const applyOverlayState = (activeGroup: string | null) => {
		if (!scene) return;
		scene.meshes.forEach((mesh: any) => {
			if (!(mesh instanceof Mesh)) return;
			const description = findPartDescription(mesh);
			const shouldGrey = Boolean(activeGroup) && description?.name !== activeGroup;
			if (shouldGrey) {
				mesh.renderOverlay = true;
				mesh.overlayColor = GREY_OVERLAY_COLOR;
				mesh.overlayAlpha = 0.65;
			} else {
				mesh.renderOverlay = false;
				mesh.overlayAlpha = 0;
			}
		});
	};

	const resetSelection = () => {
		if (currentSelectedGroup) {
			clearGroupHighlight(currentSelectedGroup);
			currentSelectedGroup = null;
		}
		applyOverlayState(null);
		setActiveAccent(null);
		tooltipVisible = false;
		if (enableTTS) {
			ttsService.stop();
			isPlayingAudio = false;
			audioError = null;
		}
	};

	// Helper to find description by mesh name or material name
	function findPartDescription(mesh: any) {
		if (!partDescriptions) return null;

		const metadata = (mesh.metadata ??= {});
		const cachedPart = (metadata as Record<string, any>).turbofanPart;
		if (cachedPart !== undefined) {
			return cachedPart;
		}

		const meshNameLower = mesh.name.toLowerCase();
		const materialNameLower = mesh.material?.name?.toLowerCase() || '';
		const meshIdLower = mesh.id?.toLowerCase() || '';
		const meshNameSearch = buildSearchable(mesh.name);
		const materialNameSearch = buildSearchable(mesh.material?.name);
		const meshIdSearch = buildSearchable(mesh.id);

		let bestMatchKey: string | null = null;
		let bestMatchLength = -1;

		for (const key in partDescriptions) {
			const keyLower = key.toLowerCase();
			const keySearch = buildSearchable(key);
			const keySearchLen = keySearch.trim().length;

			if (
				meshNameLower === keyLower ||
				materialNameLower === keyLower ||
				meshIdLower === keyLower
			) {
				(metadata as Record<string, any>).turbofanPart = partDescriptions[key];
				return partDescriptions[key];
			}

			if (
				keySearch &&
				((meshNameSearch && meshNameSearch.includes(keySearch)) ||
					(materialNameSearch && materialNameSearch.includes(keySearch)) ||
					(meshIdSearch && meshIdSearch.includes(keySearch)))
			) {
				if (keySearchLen > bestMatchLength) {
					bestMatchLength = keySearchLen;
					bestMatchKey = key;
				}
			}
		}

		const match = bestMatchKey ? partDescriptions[bestMatchKey] : null;
		(metadata as Record<string, any>).turbofanPart = match;
		return match;
	}

	async function initEngine() {
		if (!canvas) return;

		// Dynamic Import
		const babylon = await import('@babylonjs/core');
		await import('@babylonjs/loaders');
		GUI = await import('@babylonjs/gui');

		Engine = babylon.Engine;
		Scene = babylon.Scene;
		ArcRotateCamera = babylon.ArcRotateCamera;
		Vector3 = babylon.Vector3;
		HemisphericLight = babylon.HemisphericLight;
		SceneLoader = babylon.SceneLoader;
		Color4 = babylon.Color4;
		HighlightLayer = babylon.HighlightLayer;
		PointerEventTypes = babylon.PointerEventTypes;
		Color3 = babylon.Color3;
		Mesh = babylon.Mesh;
		TransformNode = babylon.TransformNode;

		// Disable default loading screen
		SceneLoader.ShowLoadingScreen = false;

		// Initialize colors with loaded Color3
		DEFAULT_HOVER_COLOR = Color3.FromHexString('#FACC15');
		GREY_OVERLAY_COLOR = Color3.FromHexString('#4B5563');
		GROUP_STYLES = {
			'Air Inlet Duct': { color: Color3.FromHexString('#87CEFA'), accentHex: '#87CEFA' },
			'Compressor Section': { color: Color3.FromHexString('#32CD32'), accentHex: '#32CD32' },
			'Combustion Section': { color: Color3.FromHexString('#FFD700'), accentHex: '#FFD700' },
			'Turbine Section': { color: Color3.FromHexString('#FFA500'), accentHex: '#FFA500' },
			'Exhaust Section': { color: Color3.FromHexString('#1E3A8A'), accentHex: '#1E3A8A' }
		};

		// 1. Initialize Engine
		// optimize: disable preserveDrawingBuffer for performance unless needed for screenshots
		engine = new Engine(canvas, true, {
			preserveDrawingBuffer: false,
			stencil: true,
			limitDeviceRatio: 1.0 // Limit to 1.0 to avoid high-DPI rendering performance hits on mobile
		});

		// optimize: Ensure we aren't rendering at native retina resolution on mobile
		// 1.0 = 1:1 match with CSS pixels. Higher values = lower resolution (better performance)
		engine.setHardwareScalingLevel(1);

		// 2. Create Scene
		scene = new Scene(engine);
		scene.clearColor = new Color4(0, 0, 0, 0);

		// Create a temporary camera/light
		const tempCamera = new ArcRotateCamera('tempCam', 0, 0, 10, Vector3.Zero(), scene);
		tempCamera.attachControl(canvas, true);
		new HemisphericLight('tempLight', new Vector3(0, 1, 0), scene);

		// 3. Setup Intersection Observer for Performance & Lazy Loading
		// Only render when the canvas is actually visible in the viewport
		observer = new IntersectionObserver(
			(entries) => {
				entries.forEach((entry) => {
					isVisible = entry.isIntersecting;
				});
			},
			{ threshold: 0 }
		);

		observer.observe(canvas as unknown as HTMLElement);

		// 4. Start Render Loop (Optimized)
		engine.runRenderLoop(() => {
			if (scene && isVisible) {
				scene.render();
			}
		});

		// 5. Handle Window Resize
		window.addEventListener('resize', handleResize);

		if (autoLoad) {
			loadModel();
		}
	}

	onMount(() => {
		initEngine();
	});

	function loadModel() {
		if (!scene || !SceneLoader) {
			// If not yet initialized, wait for it
			setTimeout(loadModel, 100);
			return;
		}

		groupMeshMap.clear();
		currentSelectedGroup = null;
		currentHoverGroup = null;
		setActiveAccent(null);
		applyOverlayState(null);

		isLoading = true;

		SceneLoader.Append(
			'',
			modelPath,
			scene,
			(loadedScene: any) => {
				hasLoaded = true;
				isLoading = false;

				// Log all meshes for debugging and map them to component groups
				console.log('=== LOADED MODEL MESHES ===');
				loadedScene.meshes.forEach((mesh: any, index: number) => {
					console.log(`Mesh ${index}:`, {
						name: mesh.name,
						id: mesh.id,
						material: mesh.material?.name,
						parent: mesh.parent?.name
					});

					const partInfo = findPartDescription(mesh);
					if (partInfo) {
						const existing = groupMeshMap.get(partInfo.name) ?? [];
						existing.push(mesh as typeof Mesh);
						groupMeshMap.set(partInfo.name, existing);
					}
				});
				console.log('=== END MESHES ===');

				// Post-Load Setup (The "Magic Helper")
				loadedScene.createDefaultCameraOrLight(true, true, true);

				// Re-attach controls to the new camera
				const activeCam = loadedScene.activeCamera as typeof ArcRotateCamera;
				if (activeCam) {
					// Explicitly attach controls to ensure events are captured
					activeCam.attachControl(canvas, true);

					// Enable framing behavior for auto-sizing
					activeCam.useFramingBehavior = true;
					if (activeCam.framingBehavior) {
						// Add a bit of padding so models don't feel overly zoomed-in.
						activeCam.framingBehavior.radiusScale = 1.9;
						activeCam.framingBehavior.positionScale = 0.5;
						activeCam.framingBehavior.framingTime = 250;
						activeCam.framingBehavior.elevationReturnTime = -1;
						activeCam.framingBehavior.zoomStopsAnimation = false;
						activeCam.framingBehavior.autoCorrectCameraLimitsAndSensibility = false;

						const worldExtends = loadedScene.getWorldExtends();
						activeCam.framingBehavior.zoomOnBoundingInfo(worldExtends.min, worldExtends.max, false);
					}

					// --- Smoothness with Control (Low Inertia) ---
					// Reducing inertia significantly to prevent excessive spinning
					// Lower inertia = stops faster when you release the mouse
					activeCam.inertia = 0.85;

					// --- Industry Standard Sensitivity ---

					// Rotate Speed: Fast & Even across all angles
					// Lower value = Faster rotation.
					// Setting both X and Y to same value (400) for consistent speed everywhere
					activeCam.angularSensibilityX = 400;
					activeCam.angularSensibilityY = 400;

					// Zoom Speed: 1.2 (Faster than default)
					// Babylon default wheelPrecision is 3. Lower = Faster.
					activeCam.wheelPrecision = 2.5;
					activeCam.pinchPrecision = 10; // Adjusted for touch as well

					// Pan Speed: 0.5 (Slower than default)
					// Babylon default panningSensibility is 1000. Higher = Slower.
					activeCam.panningSensibility = 2000;

					// --- 360-Degree Orbit ---
					// Allow full horizontal rotation (Alpha)
					activeCam.lowerAlphaLimit = null;
					activeCam.upperAlphaLimit = null;

					// Restrict vertical rotation (Beta) to prevent gimbal lock/flipping at poles
					// This prevents the disorienting "fast flip" when going over the top/bottom
					activeCam.lowerBetaLimit = 0.1; // ~5.7 degrees from top
					activeCam.upperBetaLimit = Math.PI - 0.1; // ~5.7 degrees from bottom

					// Prevent auto-rotation compensation that can cause speed inconsistencies
					activeCam.checkCollisions = false;

					// Add WASD controls
					// Clear existing keys first to avoid conflicts
					activeCam.keysUp = [];
					activeCam.keysDown = [];
					activeCam.keysLeft = [];
					activeCam.keysRight = [];

					activeCam.keysUp.push(87); // W
					activeCam.keysDown.push(83); // S
					activeCam.keysLeft.push(65); // A
					activeCam.keysRight.push(68); // D

					// Apply custom camera position if provided, but respect auto-radius if it seems too small
					if (cameraPosition) {
						activeCam.alpha = cameraPosition.alpha;
						activeCam.beta = cameraPosition.beta;
						// Only override radius if it's explicitly set to something other than default,
						// or if we want to force it. But for "too zoomed in" issues,
						// it's better to let the framing behavior handle the distance initially.
						// activeCam.radius = cameraPosition.radius;
					}
				}

				// Add environment
				loadedScene.createDefaultEnvironment({
					createGround: false,
					createSkybox: false
				});

				// Setup highlighting
				if (enableHighlight) {
					setupHighlighting(loadedScene);
				}

				if (onModelLoaded) {
					onModelLoaded();
				}
			},
			// Progress callback
			undefined,
			// Error callback
			(scene: any, message: any, exception: any) => {
				console.error('Error loading model:', message, exception);
				isLoading = false;
			}
		);
	}

	onDestroy(() => {
		if (typeof window !== 'undefined') {
			window.removeEventListener('resize', handleResize);
		}
		if (observer) {
			observer.disconnect();
		}
		// Stop any playing audio
		ttsService.stop();
		engine?.dispose();
	});

	const handleResize = () => {
		engine?.resize();
	};

	/**
	 * Play audio description for component using text-to-speech
	 */
	async function playComponentDescription(description: { name: string; description: string }) {
		audioError = null;
		isPlayingAudio = true;

		try {
			// Combine name and description for audio
			const textToSpeak = `${description.name}. ${description.description}`;
			await ttsService.speak(textToSpeak);
			isPlayingAudio = false;
		} catch (error: any) {
			console.error('Failed to play audio:', error);
			audioError = error.message || 'Failed to play audio';
			isPlayingAudio = false;
		}
	}
</script>

<div class="model-viewer-container">
	<canvas bind:this={canvas} class={canvasClass} tabindex="0"></canvas>

	{#if !hasLoaded && !isLoading}
		<button class="load-overlay" onclick={loadModel} aria-label="Load 3D Model">
			<div class="spinner-static"></div>
			<p>Click to Load 3D Model</p>
		</button>
	{/if}

	{#if isLoading}
		<div class="loading-overlay">
			<div class="spinner"></div>
			<p>Loading 3D Model...</p>
		</div>
	{/if}

	{#if tooltipVisible}
		<div
			class="model-tooltip fixed-top"
			style={`--accent-color:${activeAccent.hex}; --accent-soft:${activeAccent.soft}; --accent-glow:${activeAccent.glow};`}
		>
			<button class="tooltip-close" onclick={resetSelection} aria-label="Close tooltip">
				<svg
					xmlns="http://www.w3.org/2000/svg"
					width="18"
					height="18"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					stroke-width="2"
					stroke-linecap="round"
					stroke-linejoin="round"
				>
					<line x1="18" y1="6" x2="6" y2="18"></line>
					<line x1="6" y1="6" x2="18" y2="18"></line>
				</svg>
			</button>

			{#if enableTTS && isPlayingAudio}
				<div class="audio-indicator">
					<div class="audio-wave">
						<span></span>
						<span></span>
						<span></span>
					</div>
					<span class="audio-text">Playing audio...</span>
				</div>
			{/if}

			{#if audioError}
				<div class="audio-error">
					⚠️ {audioError}
				</div>
			{/if}

			<h4>{tooltipContent.name}</h4>
			<p>{tooltipContent.description}</p>
		</div>
	{/if}

	{#if enableDefaultControls}
		<button
			class="controls-toggle"
			onclick={() => (showControls = !showControls)}
			aria-label={showControls ? 'Hide Instructions' : 'Show Instructions'}
		>
			<svg
				xmlns="http://www.w3.org/2000/svg"
				width="16"
				height="16"
				viewBox="0 0 24 24"
				fill="none"
				stroke="currentColor"
				stroke-width="2"
				stroke-linecap="round"
				stroke-linejoin="round"
			>
				<circle cx="12" cy="12" r="10"></circle>
				<path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path>
				<line x1="12" y1="17" x2="12.01" y2="17"></line>
			</svg>
			{showControls ? 'Hide Instructions' : 'Show Instructions'}
		</button>
	{/if}

	{#if showControls && enableDefaultControls}
		<div class="controls-info" transition:fade={{ duration: 200 }}>
			<div class="control-item highlight">
				<strong>Click</strong> on any colored component to learn more
			</div>
			<div class="control-item">
				<strong>Mouse:</strong> Left-click + drag to rotate
			</div>
			<div class="control-item">
				<strong>Zoom:</strong> Scroll wheel or pinch
			</div>
			<div class="control-item">
				<strong>Pan:</strong> Right-click + drag or middle mouse
			</div>
			<div class="control-item">
				<strong>Keys:</strong> W/A/S/D to rotate
			</div>
		</div>
	{/if}
</div>

<style>
	.model-viewer-container {
		width: 100%;
		height: 100%;
		position: relative;
		overflow: hidden;
	}

	canvas {
		width: 100%;
		height: 100%;
		display: block;
		outline: none;
		touch-action: none;
	}

	.model-tooltip {
		position: absolute;
		background: rgba(10, 25, 47, 0.95);
		color: white;
		padding: 20px 24px;
		border-radius: 12px;
		pointer-events: auto;
		z-index: 1000;
		max-width: 300px;
		box-shadow:
			0 8px 32px rgba(0, 0, 0, 0.5),
			0 0 0 2px var(--accent-glow, rgba(255, 215, 0, 0.3));
		border: 2px solid var(--accent-color, #ffd700);
		backdrop-filter: blur(10px);
		animation: tooltipSlideIn 0.3s ease-out;
		--accent-color: #ffd700;
		--accent-soft: rgba(255, 215, 0, 0.15);
		--accent-glow: rgba(255, 215, 0, 0.5);
	}

	@keyframes tooltipSlideIn {
		from {
			opacity: 0;
			transform: translateX(-50%) translateY(-10px);
		}
		to {
			opacity: 1;
			transform: translateX(-50%) translateY(0);
		}
	}

	.model-tooltip.fixed-top {
		top: 20px;
		left: 50%;
		transform: translateX(-50%);
		text-align: center;
		width: 85%;
		max-width: 500px;
	}

	.tooltip-close {
		position: absolute;
		top: 10px;
		right: 10px;
		background: rgba(255, 255, 255, 0.1);
		border: 1px solid rgba(255, 255, 255, 0.2);
		border-radius: 50%;
		width: 28px;
		height: 28px;
		display: flex;
		align-items: center;
		justify-content: center;
		cursor: pointer;
		transition: all 0.2s ease;
		color: rgba(255, 255, 255, 0.7);
		padding: 0;
	}

	.tooltip-close:hover {
		background: rgba(255, 255, 255, 0.2);
		border-color: rgba(255, 255, 255, 0.4);
		color: white;
		transform: scale(1.1);
	}

	.model-tooltip h4 {
		margin: 0 0 12px 0;
		font-size: 18px;
		font-weight: 700;
		color: var(--accent-color, #ffd700);
		text-shadow: 0 0 10px var(--accent-glow, rgba(255, 215, 0, 0.5));
		letter-spacing: 0.5px;
	}

	.model-tooltip p {
		margin: 0;
		font-size: 14px;
		line-height: 1.6;
		color: rgba(255, 255, 255, 0.95);
	}

	.audio-indicator {
		display: flex;
		align-items: center;
		gap: 8px;
		margin-bottom: 12px;
		padding: 8px 12px;
		background: var(--accent-soft, rgba(255, 215, 0, 0.1));
		border-radius: 6px;
		border-left: 3px solid var(--accent-color, #ffd700);
	}

	.audio-wave {
		display: flex;
		align-items: center;
		gap: 3px;
		height: 16px;
	}

	.audio-wave span {
		display: inline-block;
		width: 3px;
		height: 100%;
		background: var(--accent-color, #ffd700);
		border-radius: 2px;
		animation: audioWave 1s ease-in-out infinite;
	}

	.audio-wave span:nth-child(1) {
		animation-delay: 0s;
	}

	.audio-wave span:nth-child(2) {
		animation-delay: 0.2s;
	}

	.audio-wave span:nth-child(3) {
		animation-delay: 0.4s;
	}

	@keyframes audioWave {
		0%,
		100% {
			transform: scaleY(0.3);
		}
		50% {
			transform: scaleY(1);
		}
	}

	.audio-text {
		font-size: 12px;
		color: var(--accent-color, #ffd700);
		font-weight: 500;
	}

	.audio-error {
		margin-bottom: 12px;
		padding: 8px 12px;
		background: rgba(255, 0, 0, 0.1);
		border-radius: 6px;
		border-left: 3px solid #ff4444;
		color: #ffaaaa;
		font-size: 12px;
	}

	.controls-toggle {
		position: absolute;
		bottom: 20px;
		left: 20px;
		background: rgba(0, 212, 255, 0.15);
		border: 1px solid rgba(0, 212, 255, 0.3);
		color: #00d4ff;
		padding: 8px 12px;
		border-radius: 8px;
		font-size: 13px;
		font-weight: 600;
		cursor: pointer;
		display: flex;
		align-items: center;
		gap: 8px;
		backdrop-filter: blur(10px);
		transition: all 0.2s ease;
		z-index: 100;
	}

	.controls-toggle:hover {
		background: rgba(0, 212, 255, 0.25);
		border-color: rgba(0, 212, 255, 0.5);
		transform: translateY(-2px);
		box-shadow: 0 4px 12px rgba(0, 212, 255, 0.2);
	}

	.controls-info {
		position: absolute;
		bottom: 65px;
		left: 20px;
		background: rgba(0, 0, 0, 0.8);
		padding: 16px;
		border-radius: 8px;
		color: white;
		font-size: 13px;
		backdrop-filter: blur(10px);
		border: 1px solid rgba(255, 255, 255, 0.1);
		pointer-events: none;
		box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
		max-width: 280px;
		max-height: 80vh;
		overflow-y: auto;
	}

	.control-item {
		margin-bottom: 6px;
	}

	.control-item:last-child {
		margin-bottom: 0;
	}

	.control-item strong {
		color: #00d4ff;
		margin-right: 4px;
	}

	.control-item.highlight {
		background: rgba(0, 212, 255, 0.15);
		padding: 8px 10px;
		border-radius: 6px;
		border-left: 3px solid #00d4ff;
		margin-bottom: 10px;
		font-weight: 600;
		animation: pulse 2s ease-in-out infinite;
	}

	@keyframes pulse {
		0%,
		100% {
			box-shadow: 0 0 5px rgba(0, 212, 255, 0.3);
		}
		50% {
			box-shadow: 0 0 15px rgba(0, 212, 255, 0.6);
		}
	}

	.loading-overlay,
	.load-overlay {
		position: absolute;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		background: rgba(0, 0, 0, 0.7);
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
		color: white;
		z-index: 10;
		backdrop-filter: blur(5px);
		border: none;
		cursor: pointer;
		transition: background 0.3s ease;
	}

	.load-overlay:hover {
		background: rgba(0, 0, 0, 0.5);
	}

	.load-overlay p {
		font-size: 1.2rem;
		font-weight: 600;
		margin-top: 1rem;
		color: #00d4ff;
	}

	.spinner {
		width: 40px;
		height: 40px;
		border: 4px solid rgba(255, 255, 255, 0.3);
		border-top: 4px solid #00d4ff;
		border-radius: 50%;
		animation: spin 1s linear infinite;
		margin-bottom: 12px;
	}

	.spinner-static {
		width: 60px;
		height: 60px;
		border: 4px solid rgba(255, 255, 255, 0.3);
		border-top: 4px solid #00d4ff;
		border-radius: 50%;
		margin-bottom: 12px;
	}

	@keyframes spin {
		0% {
			transform: rotate(0deg);
		}
		100% {
			transform: rotate(360deg);
		}
	}

	@media (max-width: 768px) {
		.controls-toggle {
			bottom: 10px;
			left: 10px;
			padding: 6px 10px;
			font-size: 12px;
		}

		.controls-info {
			font-size: 11px;
			padding: 12px;
			bottom: 50px;
			left: 10px;
		}
	}
</style>
