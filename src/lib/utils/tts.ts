/**
 * Text-to-Speech Service using ElevenLabs API
 * Handles audio generation and playback with caching
 */

class TTSService {
	private audioCache: Map<string, string> = new Map();
	private currentAudio: HTMLAudioElement | null = null;
	private isPlaying: boolean = false;
	private currentResolve: (() => void) | null = null;
	private muted: boolean = false;

	/**
	 * Convert text to speech and play it
	 * @param text - The text to convert to speech
	 * @returns Promise that resolves when audio FINISHES playing
	 */
	async speak(text: string): Promise<void> {
		if (typeof window === 'undefined') return;

		// If muted, just return immediately
		if (this.muted) {
			return;
		}

		if (!text || text.trim() === '') {
			console.warn('TTS: Empty text provided');
			return;
		}

		// Stop any currently playing audio
		this.stop();

		try {
			// Check cache first
			let audioUrl = this.audioCache.get(text);

			if (!audioUrl) {
				// Fetch audio from API
				const response = await fetch('/api/tts', {
					method: 'POST',
					headers: {
						'Content-Type': 'application/json'
					},
					body: JSON.stringify({ text })
				});

				if (!response.ok) {
					const errorData = await response.json().catch(() => ({}));
					console.warn('ElevenLabs API failed, falling back to browser TTS:', errorData.error || response.status);
					return this.speakFallback(text);
				}

				// Convert response to blob
				const audioBlob = await response.blob();
				audioUrl = URL.createObjectURL(audioBlob);

				// Cache the audio URL
				this.audioCache.set(text, audioUrl);
			}

			// Create audio element
			this.currentAudio = new Audio(audioUrl);
			this.isPlaying = true;

			return new Promise((resolve, reject) => {
				this.currentResolve = resolve;

				if (!this.currentAudio) return resolve();

				this.currentAudio.onended = () => {
					this.isPlaying = false;
					this.currentResolve = null;
					resolve();
				};

				this.currentAudio.onerror = (error) => {
					console.error('Audio playback error:', error);
					this.isPlaying = false;
					this.currentResolve = null;
					// Try fallback if audio element fails
					this.speakFallback(text).then(resolve).catch(reject);
				};

				// Play the audio
				this.currentAudio.play().catch((err) => {
					// Only fallback if not intentionally stopped and still supposed to be playing
					if (this.isPlaying) {
						console.error('Play error:', err);
						this.isPlaying = false;
						this.currentResolve = null;
						// Try fallback if play fails
						this.speakFallback(text).then(resolve).catch(reject);
					} else {
						// Interrupted or handled elsewhere
						resolve();
					}
				});
			});
		} catch (error) {
			console.error('TTS Error, attempting fallback:', error);
			return this.speakFallback(text);
		}
	}

	/**
	 * Fallback to browser's native SpeechSynthesis
	 */
	private async speakFallback(text: string): Promise<void> {
		if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
			console.error('Browser does not support speech synthesis');
			return;
		}

		this.isPlaying = true;

		return new Promise((resolve, reject) => {
			this.currentResolve = resolve;

			const utterance = new SpeechSynthesisUtterance(text);
			utterance.rate = 1.0;
			utterance.pitch = 1.0;
			utterance.volume = 1.0;

			// Try to select a female voice if available
			const voices = window.speechSynthesis.getVoices();
			const femaleVoice = voices.find(v => v.name.includes('Female') || v.name.includes('Samantha') || v.name.includes('Google US English'));
			if (femaleVoice) {
				utterance.voice = femaleVoice;
			}

			utterance.onend = () => {
				this.isPlaying = false;
				this.currentResolve = null;
				resolve();
			};

			utterance.onerror = (event) => {
				console.error('Speech synthesis error:', event);
				this.isPlaying = false;
				this.currentResolve = null;
				// Don't reject, just finish
				resolve();
			};

			window.speechSynthesis.cancel(); // Cancel any previous
			window.speechSynthesis.speak(utterance);
		});
	}

	/**
	 * Stop the currently playing audio
	 */
	stop(): void {
		if (this.currentAudio) {
			this.currentAudio.pause();
			this.currentAudio.currentTime = 0;
			this.currentAudio = null;
		}

		if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
			window.speechSynthesis.cancel();
		}

		this.isPlaying = false;

		if (this.currentResolve) {
			this.currentResolve();
			this.currentResolve = null;
		}
	}

	/**
	 * Check if audio is currently playing
	 */
	getIsPlaying(): boolean {
		return this.isPlaying;
	}

	/**
	 * Clear the audio cache
	 */
	clearCache(): void {
		// Revoke all blob URLs to free memory
		for (const url of this.audioCache.values()) {
			URL.revokeObjectURL(url);
		}
		this.audioCache.clear();
	}

	/**
	 * Preload audio for better performance
	 * @param texts - Array of texts to preload
	 */
	async preload(texts: string[]): Promise<void> {
		const promises = texts.map(async (text) => {
			if (this.audioCache.has(text)) return;

			try {
				const response = await fetch('/api/tts', {
					method: 'POST',
					headers: {
						'Content-Type': 'application/json'
					},
					body: JSON.stringify({ text })
				});

				if (response.ok) {
					const audioBlob = await response.blob();
					const audioUrl = URL.createObjectURL(audioBlob);
					this.audioCache.set(text, audioUrl);
				}
			} catch (error) {
				console.warn(`Failed to preload TTS for: "${text.substring(0, 50)}..."`, error);
			}
		});

		await Promise.allSettled(promises);
	}

	/**
	 * Set mute state
	 * @param muted - Whether audio should be muted
	 */
	setMuted(muted: boolean): void {
		this.muted = muted;
		if (muted) {
			this.stop();
		}
	}

	/**
	 * Get current mute state
	 */
	isMuted(): boolean {
		return this.muted;
	}
}

// Export singleton instance
export const ttsService = new TTSService();
