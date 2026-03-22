import { json, type RequestHandler } from '@sveltejs/kit';
import { ElevenLabsClient } from '@elevenlabs/elevenlabs-js';
import { env } from '$env/dynamic/private';
import { Buffer } from 'node:buffer';

export const POST: RequestHandler = async ({ request }) => {
	try {
		const { text } = await request.json();

		if (!text || typeof text !== 'string') {
			return json({ error: 'Text is required' }, { status: 400 });
		}

		if (!env.ELEVENLABS_API_KEY) {
			console.error('TTS Error: ELEVENLABS_API_KEY is missing');
			return json({ error: 'ElevenLabs API key not configured' }, { status: 500 });
		}

		// Initialize ElevenLabs client with the API key
		const elevenlabs = new ElevenLabsClient({
			apiKey: env.ELEVENLABS_API_KEY
		});

		console.log(`Generating TTS for: "${text.substring(0, 30)}..."`);

		// Generate audio using ElevenLabs
		// Using Rachel voice (a female voice) - you can change this to any voice ID
		// Popular female voices:
		// - "21m00Tcm4TlvDq8ikWAM" - Rachel (calm, clear female voice)
		// - "EXAVITQu4vr4xnSDxMaL" - Sarah (soft female voice)
		// - "MF3mGyEYCl7XYWbV9V6O" - Elli (young female voice)
		// - "ThT5KcBeYPX3keUQqHPh" - Dorothy (pleasant female voice)

		const audioStream = await elevenlabs.textToSpeech.convert(
			'21m00Tcm4TlvDq8ikWAM', // Rachel voice ID (female)
			{
				text,
				modelId: 'eleven_multilingual_v2', // Supports multiple languages with high quality
				voiceSettings: {
					stability: 0.5,
					similarityBoost: 0.75,
					style: 0.0,
					useSpeakerBoost: true
				}
			}
		);

		// Convert stream to buffer
		const audioBuffer = Buffer.from(await new Response(audioStream).arrayBuffer());

		// Return audio as response
		return new Response(audioBuffer, {
			headers: {
				'Content-Type': 'audio/mpeg',
				'Content-Length': audioBuffer.length.toString(),
				'Cache-Control': 'public, max-age=31536000' // Cache for 1 year
			}
		});
	} catch (error) {
		console.error('Text-to-speech error:', error);
		return json({ error: 'Failed to generate speech' }, { status: 500 });
	}
};
