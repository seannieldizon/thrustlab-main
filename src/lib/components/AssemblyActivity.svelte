<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import { browser } from '$app/environment';

	// Babylon.js imports (loaded dynamically)
	let Engine: any,
		Scene: any,
		ArcRotateCamera: any,
		Vector3: any,
		Quaternion: any,
		HemisphericLight: any,
		SceneLoader: any,
		Color4: any,
		MeshBuilder: any,
		PointerDragBehavior: any;

	// Hardcoded assembly configuration - DO NOT MODIFY THESE NUMBERS
	// Stored as plain objects to avoid SSR issues, converted to Babylon types at runtime
	const assemblyConfigRaw = {
		Casing: {
			targetPosition: { x: 30, y: 0, z: 0 },
			targetRotation: { x: 0, y: 0, z: 0, w: 1 }, // Identity
			scale: { x: 0.2, y: 0.2, z: 0.2 }
		},
		'Intake Section (Gray)': {
			targetPosition: { x: 47.51, y: 0.269, z: -2.881 },
			targetRotation: { x: 0.7071, y: 0, z: 0, w: 0.7071 },
			scale: { x: 0.2, y: 0.2, z: 0.2 }
		},
		'Compression Section (Gray)': {
			targetPosition: { x: 60.464, y: -0.449, z: -2.937 },
			targetRotation: { x: 0, y: 0, z: 0, w: 1 },
			scale: { x: 0.2, y: 0.2, z: 0.2 }
		},
		'Combustion Section (Gray)': {
			targetPosition: { x: 71.635, y: -0.726, z: -5.565 },
			targetRotation: { x: 0.6156, y: 0, z: 0, w: 0.788 },
			scale: { x: 0.2, y: 0.2, z: 0.2 }
		},
		'Turbine Section (Gray)': {
			targetPosition: { x: 85.701, y: 1.255, z: -2.759 },
			targetRotation: { x: 0.7071, y: 0, z: 0, w: 0.7071 },
			scale: { x: 0.2, y: 0.2, z: 0.2 }
		},
		'Exhaust Section (Gray)': {
			targetPosition: { x: 97.391, y: 0.0, z: -4.629 },
			targetRotation: { x: 0.7071, y: 0, z: 0, w: 0.7071 },
			scale: { x: 0.2, y: 0.2, z: 0.2 }
		}
	};

	// Component definitions
	interface Component {
		id: string;
		name: string;
		displayName: string;
		modelPath: string;
		imagePath: string;
		keywords: string[];
	}

	const COMPONENTS: Component[] = [
		{
			id: 'casing',
			name: 'Casing',
			displayName: 'Casing',
			modelPath: '/models/assembly-disassembly/Casing (Gray).gltf',
			imagePath: '/images/assembly-disassembly/casing.png',
			keywords: ['casing', 'case', 'shell', 'housing']
		},
		{
			id: 'intake',
			name: 'Intake Section (Gray)',
			displayName: 'Intake Section',
			modelPath: '/models/assembly-disassembly/Intake Section (Gray).gltf',
			imagePath: '/images/assembly-disassembly/intake.png',
			keywords: ['intake', 'inlet', 'fan']
		},
		{
			id: 'compression',
			name: 'Compression Section (Gray)',
			displayName: 'Compression Section',
			modelPath: '/models/assembly-disassembly/Compression Section (Gray).gltf',
			imagePath: '/images/assembly-disassembly/compression.png',
			keywords: ['compress', 'compressor']
		},
		{
			id: 'combustion',
			name: 'Combustion Section (Gray)',
			displayName: 'Combustion Section',
			modelPath: '/models/assembly-disassembly/Combustion Section (Gray).gltf',
			imagePath: '/images/assembly-disassembly/combustion.png',
			keywords: ['combustion', 'combustor', 'burner']
		},
		{
			id: 'turbine',
			name: 'Turbine Section (Gray)',
			displayName: 'Turbine Section',
			modelPath: '/models/assembly-disassembly/Turbine Section (Gray).gltf',
			imagePath: '/images/assembly-disassembly/turbine.png',
			keywords: ['turbine']
		},
		{
			id: 'exhaust',
			name: 'Exhaust Section (Gray)',
			displayName: 'Exhaust Section',
			modelPath: '/models/assembly-disassembly/Exhaust Section (Gray).gltf',
			imagePath: '/images/assembly-disassembly/exhaust.png',
			keywords: ['exhaust', 'nozzle']
		}
	];

	// Scene variables
	let canvas: HTMLCanvasElement;
	let engine: any = null;
	let scene: any = null;
	let camera: any = null;
	let removeCanvasWheelGuard: (() => void) | null = null;
	let casingMesh: any = null;
	let componentMeshes = new Map<string, any>();
	let placedComponents = $state(new Set<string>()); // Track which components are placed
	let loadedComponents = $state(0);
	let totalComponents = COMPONENTS.length;
	let assembledCount = $state(0);
	let showInstructions = $state(true);
	let loadingError = $state<string | null>(null);
	let draggedComponentId: string | null = null;
	let visibleComponents = $state(COMPONENTS.filter((c) => c.id !== 'casing'));

	// Scoring system
	const CORRECT_ORDER = ['intake', 'compression', 'combustion', 'turbine', 'exhaust'];
	let assemblyOrder = $state<string[]>([]); // Track order of assembly
	let showFeedback = $state(false);
	let scoreData = $state<{
		totalScore: number;
		componentResults: Array<{ id: string; name: string; correct: boolean; points: number }>;
	} | null>(null);
	let isSavingScore = $state(false);
	let scoreSaved = $state(false);

	// Realtime score calculation
	let currentScore = $derived(assembledCount * 20);

	const SNAP_THRESHOLD = 3.0; // Distance threshold for snapping

	function shuffleComponents() {
		const array = [...visibleComponents];
		for (let i = array.length - 1; i > 0; i--) {
			const j = Math.floor(Math.random() * (i + 1));
			[array[i], array[j]] = [array[j], array[i]];
		}
		visibleComponents = array;
	}

	/**
	 * Calculate score based on correct assembly order
	 */
	function calculateScore() {
		const componentResults = CORRECT_ORDER.map((correctId) => {
			const component = COMPONENTS.find((c) => c.id === correctId);
			// Check if this component is assembled (snapped)
			const isCorrect =
				placedComponents.has(correctId) && componentMeshes.get(correctId)?.metadata?.isAssembled;

			return {
				id: correctId,
				name: component?.displayName || correctId,
				correct: isCorrect,
				points: isCorrect ? 20 : 0
			};
		});

		const totalScore = componentResults.reduce((sum, result) => sum + result.points, 0);

		scoreData = {
			totalScore,
			componentResults
		};

		scoreSaved = false;
		showFeedback = true;
	}

	/**
	 * Save score to backend
	 */
	async function saveScore(closeModal = true, showAlert = true) {
		if (!scoreData || isSavingScore) return;

		isSavingScore = true;

		try {
			const response = await fetch('/api/activity-score/save', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					activityType: 'assembly-disassembly',
					score: scoreData.totalScore,
					metadata: {
						assemblyOrder,
						correctOrder: CORRECT_ORDER,
						componentResults: scoreData.componentResults
					}
				})
			});

			const result = await response.json();

			if (result.success) {
				scoreSaved = true;
				if (showAlert) alert('✅ Score saved successfully!');
				if (closeModal) showFeedback = false;
			} else {
				if (showAlert) alert('❌ Failed to save score: ' + (result.error || 'Unknown error'));
			}
		} catch (error) {
			console.error('Error saving score:', error);
			if (showAlert) alert('❌ Error saving score. Please try again.');
		} finally {
			isSavingScore = false;
		}
	}

	async function handleSaveAndShowFeedback() {
		calculateScore();
		await saveScore(false, false);
	}

	/**
	 * Close feedback modal without saving
	 */
	function closeFeedback() {
		showFeedback = false;
	}

	/**
	 * Find the root mesh from loaded result by searching for keywords
	 */
	function findMeshByKeywords(meshes: any[], keywords: string[]): any {
		// Try to find a mesh whose name contains any of the keywords
		for (const keyword of keywords) {
			const found = meshes.find((m: any) => m.name.toLowerCase().includes(keyword));
			if (found) return found;
		}

		// Fallback: return first non-root mesh with geometry
		const meshWithGeometry = meshes.find(
			(m: any) => m.getTotalVertices && m.getTotalVertices() > 0
		);
		if (meshWithGeometry) return meshWithGeometry;

		// Last resort: return root mesh
		return meshes[0];
	}

	/**
	 * Load a single component and set it up
	 */
	async function loadComponent(component: Component, shelfIndex: number) {
		try {
			console.log(`[Babylon] Loading ${component.displayName}...`);

			// Explicitly split path into base and filename for better cross-browser reliability
			const lastSlash = component.modelPath.lastIndexOf('/');
			const basePath = component.modelPath.substring(0, lastSlash + 1);
			const fileName = component.modelPath.substring(lastSlash + 1);

			console.log(`[Babylon] Attempting to load: ${basePath} | ${fileName}`);

			const result = await SceneLoader.ImportMeshAsync(null, basePath, fileName, scene);

			if (!result.meshes || result.meshes.length === 0) {
				console.error(`[Babylon] No meshes loaded for ${component.name}`);
				return;
			}

			console.log(
				`[Babylon] Successfully loaded ${result.meshes.length} meshes for ${component.displayName}`
			);

			// Find the appropriate root mesh
			const rootMesh = findMeshByKeywords(result.meshes, component.keywords);

			if (!rootMesh) {
				console.error(`Could not find root mesh for ${component.name}`);
				return;
			}

			// Get assembly config for this component
			const configRaw = assemblyConfigRaw[component.name as keyof typeof assemblyConfigRaw];
			if (!configRaw) {
				console.error(`No assembly config found for ${component.name}`);
				return;
			}

			// Convert plain objects to Babylon types
			let targetPosition = new Vector3(
				configRaw.targetPosition.x,
				configRaw.targetPosition.y,
				configRaw.targetPosition.z
			);
			let targetRotation = new Quaternion(
				configRaw.targetRotation.x,
				configRaw.targetRotation.y,
				configRaw.targetRotation.z,
				configRaw.targetRotation.w
			);
			const scale = new Vector3(configRaw.scale.x, configRaw.scale.y, configRaw.scale.z);

			// Set scale immediately
			rootMesh.scaling = scale.clone();

			// Store reference to target config in metadata
			rootMesh.metadata = {
				component: component,
				targetPosition: targetPosition,
				targetRotation: targetRotation,
				isAssembled: false
			};

			// Position casing at center (visible), other components hidden initially
			if (component.id === 'casing') {
				rootMesh.position = targetPosition.clone();
				rootMesh.rotationQuaternion = targetRotation.clone();
				rootMesh.isVisible = true;
				placedComponents.add(component.id);
			} else {
				// Hide other components until dropped from tray
				rootMesh.position = new Vector3(0, -1000, 0); // Off screen
				rootMesh.isVisible = false;
			}

			// Make it pickable for drag behavior (will be added when dropped)
			rootMesh.isPickable = true;

			// Store in map
			componentMeshes.set(component.id, rootMesh);
			loadedComponents++;

			console.log(`[Babylon] Ready: ${component.displayName} at position`, rootMesh.position);
		} catch (error) {
			console.error(`Error loading ${component.name}:`, error);
			loadingError = `Failed to load ${component.displayName}. Check console for details.`;
			// Still increment counter so loading doesn't get stuck
			loadedComponents++;
		}
	}

	/**
	 * Setup drag behavior for a mesh (called after placement from tray)
	 */
	function setupDragBehavior(mesh: any) {
		if (!PointerDragBehavior) return;

		// Constrain drag to X axis
		const dragBehavior = new PointerDragBehavior({ dragAxis: new Vector3(1, 0, 0) });

		// Enforce Y and Z constraints during drag to ensure it stays "inside" the casing line
		dragBehavior.onDragObservable.add(() => {
			if (mesh.metadata && mesh.metadata.targetPosition) {
				mesh.position.y = mesh.metadata.targetPosition.y;
				mesh.position.z = mesh.metadata.targetPosition.z;
			}
		});

		dragBehavior.onDragStartObservable.add(() => {
			console.log(`Started dragging ${mesh.metadata.component.displayName}`);
		});

		dragBehavior.onDragEndObservable.add(() => {
			checkAndSnap(mesh);
		});

		mesh.addBehavior(dragBehavior);
	}

	/**
	 * Handle drag start from component tray
	 */
	function handleDragStart(event: DragEvent, componentId: string) {
		if (placedComponents.has(componentId)) return; // Already placed
		draggedComponentId = componentId;
		if (event.dataTransfer) {
			event.dataTransfer.effectAllowed = 'move';
			event.dataTransfer.setData('componentId', componentId);
		}
	}

	/**
	 * Handle drop on canvas
	 */
	async function handleCanvasDrop(event: DragEvent) {
		event.preventDefault();
		if (!draggedComponentId || !scene || !canvas) return;

		const componentId = draggedComponentId;
		draggedComponentId = null;

		if (placedComponents.has(componentId)) return;

		const mesh = componentMeshes.get(componentId);
		if (!mesh) return;

		// Calculate 3D position from mouse coordinates
		const pickResult = scene.pick(scene.pointerX, scene.pointerY);
		const dropPosition =
			pickResult?.hit && pickResult.pickedPoint ? pickResult.pickedPoint : new Vector3(0, 0, 0);

		// Make visible and position at drop location
		mesh.isVisible = true;

		// Constrain to target Y and Z, only allow X to vary based on drop
		const targetPos = mesh.metadata.targetPosition;
		mesh.position = new Vector3(dropPosition.x, targetPos.y, targetPos.z);

		// Set rotation to target rotation
		mesh.rotationQuaternion = mesh.metadata.targetRotation.clone();

		// Add drag behavior for repositioning
		setupDragBehavior(mesh);

		// Mark as placed
		placedComponents = new Set(placedComponents.add(componentId));

		// Try to snap immediately
		checkAndSnap(mesh);
	}

	function handleCanvasDragOver(event: DragEvent) {
		event.preventDefault();
		if (event.dataTransfer) {
			event.dataTransfer.dropEffect = 'move';
		}
	}

	/**
	 * Check if mesh is close enough to snap, and snap if so
	 */
	function checkAndSnap(mesh: any) {
		const metadata = mesh.metadata;
		if (!metadata || metadata.isAssembled) return;

		const targetPos = metadata.targetPosition;
		const currentPos = mesh.position;

		// Calculate distance to target position
		const distance = Vector3.Distance(currentPos, targetPos);

		console.log(
			`${metadata.component.displayName}: distance = ${distance.toFixed(2)} (threshold = ${SNAP_THRESHOLD})`
		);

		if (distance < SNAP_THRESHOLD) {
			// SNAP!
			mesh.position = targetPos.clone();
			mesh.rotationQuaternion = metadata.targetRotation.clone();

			// Parent to casing (if not casing itself)
			if (metadata.component.id !== 'casing' && casingMesh) {
				mesh.parent = casingMesh;

				// Reset scaling to 1,1,1 since it inherits parent's scale (0.2)
				// This ensures the component maintains its world scale of 0.2
				mesh.scaling = new Vector3(1, 1, 1);

				// Adjust position to account for parent's scale
				// Since casing is at (30, 0, 0) with identity rotation, we need to convert
				// world position to local position relative to parent
				const casingScale = assemblyConfigRaw.Casing.scale.x;
				const scaleFactor = 1 / casingScale;

				// Convert from world space to local space
				const casingPos = casingMesh.position;
				const localPos = targetPos.subtract(casingPos);
				mesh.position = localPos.scale(scaleFactor);
			}

			// Mark as assembled
			metadata.isAssembled = true;
			assembledCount++;

			// Track assembly order (exclude casing)
			if (metadata.component.id !== 'casing') {
				assemblyOrder = [...assemblyOrder, metadata.component.id];
				console.log('Assembly order:', assemblyOrder);
			}

			// Remove drag behavior to make component immoveable once snapped
			if (mesh.getBehaviorByName) {
				const behavior = mesh.getBehaviorByName('PointerDrag');
				if (behavior) {
					mesh.removeBehavior(behavior);
					console.log(`🔒 ${metadata.component.displayName} locked in place`);
				}
			}

			// Visual feedback
			console.log(
				`✓ ${metadata.component.displayName} assembled! (${assembledCount}/${COMPONENTS.length})`
			);

			// Check if all assembled (excluding casing which is pre-placed)
			if (assembledCount === COMPONENTS.length - 1) {
				setTimeout(() => {
					calculateScore();
					saveScore(false, false); // Auto-save silently
				}, 500);
			}
		}
	}

	/**
	 * Initialize the Babylon.js scene
	 */
	async function initScene() {
		if (!browser || !canvas) return;

		try {
			// Dynamically import Babylon.js
			const babylon = await import('@babylonjs/core');
			await import('@babylonjs/loaders');

			// Assign to module-level variables
			Engine = babylon.Engine;
			Scene = babylon.Scene;
			ArcRotateCamera = babylon.ArcRotateCamera;
			Vector3 = babylon.Vector3;
			Quaternion = babylon.Quaternion;
			HemisphericLight = babylon.HemisphericLight;
			SceneLoader = babylon.SceneLoader;
			Color4 = babylon.Color4;
			MeshBuilder = babylon.MeshBuilder;
			PointerDragBehavior = babylon.PointerDragBehavior;

			// Make Vector3 and Quaternion globally available for assemblyConfig
			(window as any).BABYLON = { Vector3, Quaternion };

			// Create engine with better cross-browser compatibility
			engine = new Engine(canvas, true, {
				preserveDrawingBuffer: true,
				stencil: true,
				antialias: true,
				adaptToDeviceRatio: true
			});

			scene = new Scene(engine);
			scene.clearColor = new Color4(0, 0, 0, 0);

			// Explicitly set canvas size based on container for high-DPI and Firefox
			const rect = canvas.getBoundingClientRect();
			canvas.width = rect.width * (window.devicePixelRatio || 1);
			canvas.height = rect.height * (window.devicePixelRatio || 1);

			// Setup camera - centered on the casing at its static position
			camera = new ArcRotateCamera(
				'camera',
				Math.PI / 2,
				Math.PI / 2.5,
				150,
				new Vector3(-60, 0, 0), // Centered on the casing
				scene
			);
			camera.attachControl(canvas, true);

			// Only allow zoom when the canvas is focused.
			const wheelInput = camera?.inputs?.attached?.mousewheel as any;
			wheelInput?.detachControl?.(canvas);

			// Prevent page scroll only while the canvas is focused.
			const wheelGuard = (event: WheelEvent) => {
				if (document.activeElement === (canvas as unknown as Element)) {
					event.preventDefault();
				}
			};
			canvas.addEventListener('wheel', wheelGuard, { passive: false });
			removeCanvasWheelGuard = () => canvas.removeEventListener('wheel', wheelGuard);

			// If the canvas already has focus (e.g. programmatic), enable zoom.
			if (document.activeElement === (canvas as unknown as Element)) {
				wheelInput?.attachControl?.(canvas);
			}
			camera.lowerRadiusLimit = 50;
			camera.upperRadiusLimit = 500;
			camera.panningSensibility = 50;

			// Lighting - High intensity multi-directional lighting
			const light = new HemisphericLight('light1', new Vector3(1, 1, 1), scene);
			light.intensity = 1.6;

			const light2 = new HemisphericLight('light2', new Vector3(-1, -1, -1), scene);
			light2.intensity = 1.0;

			const ambientLight = new HemisphericLight('ambient', new Vector3(0, 1, 0), scene);
			ambientLight.intensity = 0.5;

			// Start render loop
			engine.runRenderLoop(() => {
				scene.render();
			});

			// Handle resize
			const resizeHandler = () => {
				if (engine) engine.resize();
			};
			window.addEventListener('resize', resizeHandler);

			// Initial resize to catch any browser quirks
			setTimeout(() => engine.resize(), 100);

			// Load all components
			console.log('Loading components...');

			// Load casing first (it's the anchor)
			const casingComponent = COMPONENTS.find((c) => c.id === 'casing');
			if (casingComponent) {
				await loadComponent(casingComponent, 0);
				casingMesh = componentMeshes.get('casing');
			}

			// Load other components in parallel (use allSettled to continue even if some fail)
			const otherComponents = COMPONENTS.filter((c) => c.id !== 'casing');
			const results = await Promise.allSettled(
				otherComponents.map((component, index) => loadComponent(component, index + 1))
			);

			const successCount =
				results.filter((r) => r.status === 'fulfilled').length + (casingMesh ? 1 : 0);
			console.log(`Loaded ${successCount}/${COMPONENTS.length} components`);

			// Clear any error messages after a delay
			if (loadingError) {
				setTimeout(() => {
					loadingError = null;
				}, 3000);
			}
		} catch (error) {
			console.error('Error initializing scene:', error);
			loadingError = 'Failed to initialize 3D scene';
		}
	}

	onMount(() => {
		shuffleComponents();
		initScene();
	});

	onDestroy(() => {
		if (engine) {
			engine.dispose();
		}
		removeCanvasWheelGuard?.();
		if (typeof window !== 'undefined') {
			window.removeEventListener('resize', () => engine?.resize());
		}
	});
</script>

<div class="assembly-container">
	<!-- Instructions Modal -->
	{#if showInstructions}
		<div
			class="instructions-overlay"
			role="button"
			tabindex="0"
			onclick={() => (showInstructions = false)}
			onkeydown={(e) => e.key === 'Enter' && (showInstructions = false)}
		>
			<div class="instructions-modal">
				<h2>Assembly Instructions</h2>
				<div class="instructions-content">
					<p>
						<strong>Objective:</strong> Assemble the turbofan engine by dragging and dropping each component
						to its correct position.
					</p>

					<h3>How to Play:</h3>
					<ol>
						<li><strong>Select:</strong> Find a component from the tray on the left</li>
						<li>
							<strong>Drag:</strong> Click and hold on a component card, then drag it onto the 3D canvas
						</li>
						<li>
							<strong>Position:</strong> Once placed, drag the component in 3D space to position it
						</li>
						<li>
							<strong>Snap:</strong> When close enough to the correct position, it will automatically
							snap into place
						</li>
						<li><strong>Assembly Order:</strong> Components can be assembled in any order</li>
					</ol>

					<h3>Camera Controls:</h3>
					<ul>
						<li><strong>Rotate:</strong> Left-click and drag</li>
						<li><strong>Zoom:</strong> Scroll wheel</li>
						<li><strong>Pan:</strong> Right-click and drag</li>
					</ul>

					<p class="hint">
						<strong>Tip:</strong> The components are already scaled correctly. Focus on positioning them
						in the right location!
					</p>
				</div>
				<button class="start-button" onclick={() => (showInstructions = false)}>
					Start Assembly
				</button>
			</div>
		</div>
	{/if}

	<!-- Loading Indicator -->
	{#if loadedComponents < totalComponents}
		<div class="loading-overlay">
			<div class="loading-content">
				<div class="loading-spinner"></div>
				<p>Loading Components... ({loadedComponents}/{totalComponents})</p>
				{#if loadingError}
					<p class="error-message">{loadingError}</p>
				{/if}
			</div>
		</div>
	{/if}

	<!-- Component Tray -->
	<div class="component-tray">
		<h3>Components</h3>
		<div class="component-list">
			{#each visibleComponents as component}
				{#if !placedComponents.has(component.id)}
					<div
						class="component-card"
						role="button"
						tabindex="0"
						draggable={true}
						ondragstart={(e) => handleDragStart(e, component.id)}
					>
						<div class="component-image-container">
							<img
								src={component.imagePath}
								alt={component.displayName}
								class="component-image"
								onerror={(e) => {
									// Fallback to wrench icon if image fails
									(e.target as HTMLElement).style.display = 'none';
									(e.target as HTMLElement).nextElementSibling?.classList.remove('hidden');
								}}
							/>
							<div class="component-icon hidden">🔧</div>
						</div>
						<span class="component-name">{component.displayName}</span>
					</div>
				{/if}
			{/each}
		</div>
	</div>

	<!-- Canvas -->
	<canvas
		bind:this={canvas}
		class="babylon-canvas"
		tabindex="0"
		onpointerdown={() => canvas?.focus()}
		onfocus={() => (camera?.inputs?.attached?.mousewheel as any)?.attachControl?.(canvas)}
		onblur={() => (camera?.inputs?.attached?.mousewheel as any)?.detachControl?.(canvas)}
		ondrop={handleCanvasDrop}
		ondragover={handleCanvasDragOver}
	></canvas>

	<!-- Controls Overlay -->
	<div class="controls-overlay">
		<button
			class="control-btn"
			onclick={() => {
				window.location.reload();
				shuffleComponents();
			}}
			title="Reset Scene"
		>
			Reset
		</button>
		<button class="control-btn" onclick={shuffleComponents} title="Shuffle Components">
			Shuffle
		</button>
		<button class="control-btn" onclick={handleSaveAndShowFeedback} title="Save Score">
			Save
		</button>
		<button
			class="control-btn"
			onclick={() => (showInstructions = !showInstructions)}
			title="Toggle Help"
		>
			Help
		</button>
		{#if scoreSaved}
			<div class="realtime-score">
				<span class="score-label">Score:</span>
				<span class="score-value">{currentScore}</span>
			</div>
		{/if}
	</div>

	<!-- Score Feedback Modal -->
	{#if showFeedback && scoreData}
		<div
			class="feedback-modal-overlay"
			role="button"
			tabindex="0"
			onclick={closeFeedback}
			onkeydown={(e) => e.key === 'Enter' && closeFeedback()}
		>
			<div
				class="feedback-modal"
				role="button"
				tabindex="0"
				onclick={(e) => e.stopPropagation()}
				onkeydown={(e) => e.stopPropagation()}
			>
				<div class="feedback-header">
					<h2>Assembly Complete!</h2>
					<button class="close-btn" onclick={closeFeedback}>×</button>
				</div>

				<div class="score-display">
					<div class="score-circle">
						<div class="score-value">{scoreData.totalScore}</div>
						<div class="score-label">/ 100</div>
					</div>
					<p class="score-message">
						{#if scoreData.totalScore === 100}
							🎉 Perfect! All components assembled in correct order!
						{:else if scoreData.totalScore >= 80}
							👍 Great job! Almost perfect assembly!
						{:else if scoreData.totalScore >= 60}
							👌 Good effort! Keep practicing the sequence!
						{:else if scoreData.totalScore >= 40}
							💪 You're learning! Review the correct order!
						{:else}
							📚 Keep trying! Study the assembly sequence!
						{/if}
					</p>
				</div>

				<div class="results-section">
					<h3>Component Results</h3>
					<div class="results-list">
						{#each scoreData.componentResults as result, index}
							<div
								class="result-item"
								class:correct={result.correct}
								class:incorrect={!result.correct}
							>
								<div class="result-number">{index + 1}</div>
								<div class="result-details">
									<span class="result-name">{result.name}</span>
									<span class="result-status">
										{result.correct ? '✓ Correct Position & Order' : '✗ Incorrect Order'}
									</span>
								</div>
								<div class="result-points">{result.points} pts</div>
							</div>
						{/each}
					</div>
				</div>

				<div class="feedback-actions">
					<button class="action-btn secondary" onclick={closeFeedback}>Close</button>
					<button
						class="action-btn primary"
						onclick={() => saveScore(true, true)}
						disabled={isSavingScore || scoreSaved}
					>
						{isSavingScore ? 'Saving...' : scoreSaved ? 'Saved' : 'Save Score'}
					</button>
				</div>
			</div>
		</div>
	{/if}
</div>

<style>
	.assembly-container {
		position: relative;
		width: 100%;
		height: calc(100vh - 100px);
		min-height: 700px;
		background: radial-gradient(circle at 50% 100%, #2c3e50 0%, #000000 70%);
		border-radius: 12px;
		overflow: hidden;
		box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
		display: flex;
		max-width: 100%;
		min-width: 0;
		box-sizing: border-box;
	}

	.controls-overlay {
		position: absolute;
		top: 1rem;
		right: 1rem;
		display: flex;
		gap: 0.75rem;
		z-index: 100;
		align-items: center;
		flex-wrap: wrap;
		max-width: calc(100% - 2rem);
		justify-content: flex-end;
	}

	.realtime-score {
		position: relative;
		overflow: hidden;
		background: rgba(255, 255, 255, 0.08);
		border: 1px solid rgba(255, 255, 255, 0.18);
		border-radius: 22px;
		padding: 0.6rem 1.1rem;
		display: flex;
		align-items: center;
		gap: 0.8rem;
		margin-left: 0.75rem;
		backdrop-filter: blur(10px);
		box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
		transition: all 0.3s ease;
	}

	.realtime-score::before {
		content: '';
		position: absolute;
		inset: 0;
		background:
			radial-gradient(circle at 20% 15%, rgba(255, 255, 255, 0.22), transparent 55%),
			radial-gradient(circle at 80% 85%, rgba(79, 195, 247, 0.14), transparent 55%);
		pointer-events: none;
	}

	.realtime-score:hover {
		box-shadow: 0 6px 25px rgba(79, 195, 247, 0.2);
		border-color: rgba(79, 195, 247, 0.45);
	}

	.score-label {
		color: #87ceeb;
		font-family: 'Poppins', sans-serif;
		font-size: 1.2rem;
		font-weight: 600;
		text-transform: uppercase;
		letter-spacing: 1px;
	}

	.score-value {
		color: #fff;
		font-family: 'Poppins', sans-serif;
		font-size: 1.4rem;
		font-weight: 700;
		text-shadow: 0 0 15px rgba(79, 195, 247, 0.6);
		line-height: 1;
	}

	.control-btn {
		background: rgba(255, 255, 255, 0.1);
		border: 1px solid rgba(255, 255, 255, 0.2);
		color: #e0e0e0;
		padding: 0.6rem 1.2rem;
		border-radius: 8px;
		cursor: pointer;
		font-family: 'Poppins', sans-serif;
		font-weight: 500;
		font-size: 0.9rem;
		transition: all 0.3s ease;
		backdrop-filter: blur(8px);
		text-transform: uppercase;
		letter-spacing: 0.5px;
		box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
	}

	.control-btn:hover {
		background: rgba(93, 168, 203, 0.3); /* Overhaul accent color */
		border-color: #5da8cb;
		color: white;
		transform: translateY(-2px);
		box-shadow: 0 6px 12px rgba(0, 0, 0, 0.2);
	}

	.control-btn:active {
		transform: translateY(0);
	}

	.component-tray {
		width: 220px;
		background: rgba(0, 0, 0, 0.5);
		border-right: 2px solid rgba(79, 195, 247, 0.3);
		padding: 0.65rem;
		overflow-y: auto;
		overflow-x: hidden;
		z-index: 10;
		flex: 0 0 auto;
		min-width: 0;
		box-sizing: border-box;
		scrollbar-width: none;
		-ms-overflow-style: none;
	}

	.component-tray::-webkit-scrollbar {
		display: none;
	}

	.component-tray h3 {
		color: #4fc3f7;
		font-family: 'Poppins', sans-serif;
		font-size: 1.05rem;
		font-weight: 600;
		margin-bottom: 0.65rem;
		text-align: center;
	}

	.component-list {
		display: flex;
		flex-direction: column;
		gap: 0.55rem;
	}

	.component-card {
		background: rgba(45, 53, 97, 0.8);
		border: 1px solid rgba(79, 195, 247, 0.4);
		border-radius: 7px;
		padding: 0.5rem;
		cursor: grab;
		transition: all 0.3s ease;
		text-align: center;
		position: relative;
	}

	.component-card:hover:not(.placed) {
		background: rgba(45, 53, 97, 1);
		border-color: #4fc3f7;
		transform: translateX(5px);
		box-shadow: 0 5px 15px rgba(79, 195, 247, 0.3);
	}

	.component-card:active:not(.placed) {
		cursor: grabbing;
	}

	.component-image-container {
		width: 100%;
		height: 100px;
		display: flex;
		align-items: center;
		justify-content: center;
		margin-bottom: 0.4rem;
		background: rgba(0, 0, 0, 0.2);
		border-radius: 4px;
		overflow: hidden;
	}

	.component-image {
		max-width: 100%;
		max-height: 100%;
		object-fit: contain;
	}

	.component-icon {
		font-size: 1.6rem;
	}

	.hidden {
		display: none;
	}

	.component-name {
		display: none;
		color: #e0e0e0;
		font-size: 0.75rem;
		font-weight: 500;
	}

	.babylon-canvas {
		flex: 1;
		height: 100%;
		width: 100%;
		display: block;
		outline: none;
		min-width: 0;
	}

	/* Instructions Overlay */
	.instructions-overlay {
		position: absolute;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		background: rgba(0, 0, 0, 0.85);
		display: flex;
		align-items: flex-start; /* Changd from center to flex-start to allow scrolling */
		justify-content: center;
		z-index: 1000;
		backdrop-filter: blur(5px);
		overflow-y: auto; /* Allow overlay itself to scroll */
		padding: 2rem 0; /* Add padding to top/bottom */
	}

	.instructions-modal {
		background: linear-gradient(135deg, #1e3c72 0%, #2a5298 100%);
		border: 2px solid rgba(93, 168, 203, 0.3);
		border-radius: 16px;
		padding: 2rem;
		max-width: 650px;
		width: 95%;
		max-height: 90vh;
		overflow: hidden;
		position: relative;
		box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
		animation: modalPop 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
	}

	.instructions-modal h2 {
		color: #4fc3f7;
		margin-bottom: 1rem;
		font-size: 1.8rem;
		text-align: center;
	}

	.instructions-modal h3 {
		color: #81c784;
		margin-top: 1.5rem;
		margin-bottom: 0.5rem;
		font-size: 1.2rem;
	}

	.instructions-content {
		color: #e0e0e0;
		line-height: 1.6;
	}

	.instructions-content p {
		margin-bottom: 1rem;
	}

	.instructions-content ol,
	.instructions-content ul {
		padding-left: 1.5rem;
		margin-bottom: 1rem;
	}

	.instructions-content li {
		margin-bottom: 0.5rem;
	}

	.hint {
		background: rgba(255, 193, 7, 0.1);
		border-left: 4px solid #ffc107;
		padding: 0.75rem;
		border-radius: 4px;
		margin-top: 1rem;
	}

	.start-button {
		width: 100%;
		padding: 1rem;
		margin-top: 1.5rem;
		background: linear-gradient(135deg, #4fc3f7 0%, #2196f3 100%);
		color: white;
		border: none;
		border-radius: 8px;
		font-size: 1.1rem;
		font-weight: bold;
		cursor: pointer;
		transition: all 0.3s ease;
	}

	.start-button:hover {
		transform: translateY(-2px);
		box-shadow: 0 10px 25px rgba(79, 195, 247, 0.3);
	}

	/* Loading Overlay */
	.loading-overlay {
		position: absolute;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		background: rgba(0, 0, 0, 0.8);
		display: flex;
		align-items: center;
		justify-content: center;
		z-index: 999;
	}

	.loading-content {
		text-align: center;
		color: white;
	}

	.loading-spinner {
		width: 60px;
		height: 60px;
		border: 4px solid rgba(255, 255, 255, 0.1);
		border-top-color: #4fc3f7;
		border-radius: 50%;
		animation: spin 1s linear infinite;
		margin: 0 auto 1rem;
	}

	@keyframes spin {
		to {
			transform: rotate(360deg);
		}
	}

	.error-message {
		color: #ff5252;
		margin-top: 1rem;
	}

	/* Responsive */
	@media (max-width: 768px) {
		.assembly-container {
			height: calc(100vh - 80px);
			min-height: 500px;
			flex-direction: column;
		}

		.instructions-modal {
			padding: 1.5rem;
		}

		.component-tray {
			width: 100%;
			padding: 0.55rem;
			border-right: none;
			border-top: 2px solid rgba(79, 195, 247, 0.3);
			order: 2;
			max-height: 180px;
		}

		.component-tray h3 {
			padding: 0;
		}

		.component-list {
			flex-direction: row;
			flex-wrap: wrap;
			justify-content: center;
			gap: 0.5rem;
		}

		.component-card {
			padding: 0.4rem;
			flex: 1 1 120px;
			max-width: 150px;
		}

		.component-image-container {
			height: 48px;
		}

		.component-icon {
			font-size: 1.5rem;
		}

		.component-name {
			font-size: 0.75rem;
		}

		.babylon-canvas {
			flex: 1;
			width: 100%;
			height: 100%;
			min-height: 600px;
			background: transparent;
			cursor: grab;
			border-radius: 20px;
			box-shadow: inset 0 0 50px rgba(0, 0, 0, 0.2);
		}

		.babylon-canvas:active {
			cursor: grabbing;
		}

		.controls-overlay {
			top: 0.5rem;
			left: 0.5rem;
			right: 0.5rem;
			gap: 0.5rem;
		}

		.control-btn {
			padding: 0.45rem 0.8rem;
			font-size: 0.8rem;
		}

		.realtime-score {
			margin-left: 0;
			padding: 0.45rem 0.8rem;
			gap: 0.5rem;
		}

		.score-label {
			font-size: 1rem;
		}

		.score-value {
			font-size: 1.1rem;
		}
	}

	/* Feedback Modal Styles */
	.feedback-modal-overlay {
		position: fixed;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		background: rgba(0, 0, 0, 0.8);
		backdrop-filter: blur(4px);
		display: flex;
		align-items: center;
		justify-content: center;
		z-index: 1000;
		animation: fadeIn 0.3s ease;
	}

	@keyframes fadeIn {
		from {
			opacity: 0;
		}
		to {
			opacity: 1;
		}
	}

	.feedback-modal {
		background: linear-gradient(135deg, #1e3c72 0%, #2a5298 100%);
		border: 2px solid rgba(93, 168, 203, 0.3);
		border-radius: 16px;
		padding: 1.25rem;
		max-width: 600px;
		width: 95%;
		max-height: 90vh;
		overflow-y: auto;
		display: flex;
		flex-direction: column;
		box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
		animation: slideUp 0.3s ease;
		scrollbar-width: thin;
		scrollbar-color: #5da8cb rgba(255, 255, 255, 0.1);
	}

	.feedback-modal::-webkit-scrollbar {
		width: 6px;
	}

	.feedback-modal::-webkit-scrollbar-track {
		background: rgba(255, 255, 255, 0.05);
		border-radius: 3px;
	}

	.feedback-modal::-webkit-scrollbar-thumb {
		background: #5da8cb;
		border-radius: 3px;
	}

	@keyframes slideUp {
		from {
			transform: translateY(30px);
			opacity: 0;
		}
		to {
			transform: translateY(0);
			opacity: 1;
		}
	}

	.feedback-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 1rem;
		border-bottom: 2px solid rgba(93, 168, 203, 0.3);
		padding-bottom: 0.75rem;
	}

	.feedback-header h2 {
		color: #5da8cb;
		font-family: 'Poppins', sans-serif;
		font-size: 1.6rem;
		font-weight: 600;
		margin: 0;
	}

	.close-btn {
		background: transparent;
		border: none;
		color: rgba(255, 255, 255, 0.6);
		font-size: 2rem;
		cursor: pointer;
		width: 40px;
		height: 40px;
		display: flex;
		align-items: center;
		justify-content: center;
		border-radius: 50%;
		transition: all 0.3s ease;
	}

	.close-btn:hover {
		background: rgba(255, 255, 255, 0.1);
		color: #fff;
	}

	.score-display {
		text-align: center;
		margin-bottom: 1rem;
		padding: 1rem;
		background: rgba(0, 0, 0, 0.2);
		border-radius: 12px;
	}

	.score-circle {
		display: inline-flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		width: 110px;
		height: 110px;
		border-radius: 50%;
		background: linear-gradient(135deg, #5da8cb 0%, #3d7fa8 100%);
		box-shadow: 0 10px 30px rgba(93, 168, 203, 0.4);
		margin-bottom: 0.75rem;
	}

	.feedback-modal .score-value {
		font-size: 2.4rem;
		font-weight: 700;
		color: #fff;
		font-family: 'Poppins', sans-serif;
	}

	.feedback-modal .score-label {
		font-size: 1rem;
		color: rgba(255, 255, 255, 0.8);
		font-family: 'Poppins', sans-serif;
	}

	.score-message {
		color: #e0e0e0;
		font-size: 1rem;
		font-family: 'Poppins', sans-serif;
		margin: 0;
	}

	.results-section {
		margin-bottom: 1rem;
	}

	.results-section h3 {
		color: #5da8cb;
		font-family: 'Poppins', sans-serif;
		font-size: 1.1rem;
		margin-bottom: 0.75rem;
	}

	.results-list {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}

	.result-item {
		display: flex;
		align-items: center;
		gap: 1rem;
		padding: 0.75rem;
		background: rgba(255, 255, 255, 0.05);
		border-radius: 8px;
		border-left: 4px solid transparent;
		transition: all 0.3s ease;
	}

	.result-item.correct {
		border-left-color: #4caf50;
		background: rgba(76, 175, 80, 0.1);
	}

	.result-item.incorrect {
		border-left-color: #f44336;
		background: rgba(244, 67, 54, 0.1);
	}

	.result-number {
		font-size: 1.2rem;
		font-weight: 700;
		color: #5da8cb;
		font-family: 'Poppins', sans-serif;
		min-width: 30px;
	}

	.result-details {
		flex: 1;
		display: flex;
		flex-direction: column;
		gap: 0.25rem;
	}

	.result-name {
		color: #fff;
		font-weight: 600;
		font-family: 'Poppins', sans-serif;
	}

	.result-status {
		color: rgba(255, 255, 255, 0.7);
		font-size: 0.9rem;
		font-family: 'Poppins', sans-serif;
	}

	.result-points {
		font-size: 1.2rem;
		font-weight: 700;
		color: #5da8cb;
		font-family: 'Poppins', sans-serif;
	}

	.feedback-actions {
		display: flex;
		gap: 1rem;
		justify-content: flex-end;
	}

	.action-btn {
		padding: 0.8rem 2rem;
		border: none;
		border-radius: 8px;
		font-family: 'Poppins', sans-serif;
		font-weight: 600;
		font-size: 1rem;
		cursor: pointer;
		transition: all 0.3s ease;
		text-transform: uppercase;
		letter-spacing: 0.5px;
	}

	.action-btn.secondary {
		background: rgba(255, 255, 255, 0.1);
		color: #e0e0e0;
		border: 1px solid rgba(255, 255, 255, 0.2);
	}

	.action-btn.secondary:hover {
		background: rgba(255, 255, 255, 0.15);
	}

	.action-btn.primary {
		background: linear-gradient(135deg, #5da8cb 0%, #3d7fa8 100%);
		color: #fff;
		box-shadow: 0 4px 15px rgba(93, 168, 203, 0.3);
	}

	.action-btn.primary:hover:not(:disabled) {
		transform: translateY(-2px);
		box-shadow: 0 6px 20px rgba(93, 168, 203, 0.4);
	}

	.action-btn.primary:disabled {
		opacity: 0.6;
		cursor: not-allowed;
	}
</style>
