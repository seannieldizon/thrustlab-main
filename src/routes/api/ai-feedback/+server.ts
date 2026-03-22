import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { generateText } from 'ai';
import { GEMINI_API_KEY } from '$env/static/private';
import { z } from 'zod';

// Configure the Google AI provider with API key
const google = createGoogleGenerativeAI({
    apiKey: GEMINI_API_KEY
});
const model = google('gemini-2.5-flash');

// Helper function to clean markdown code blocks from JSON responses
function cleanJsonResponse(text: string): string {
    // Remove markdown code blocks (```json ... ``` or ``` ... ```)
    let cleaned = text.trim();
    if (cleaned.startsWith('```')) {
        // Remove opening ```json or ```
        cleaned = cleaned.replace(/^```(?:json)?\s*\n/, '');
        // Remove closing ```
        cleaned = cleaned.replace(/\n```\s*$/, '');
    }
    return cleaned.trim();
}

// Define the schema for structured output using Zod
const feedbackSchema = z.object({
    feedback: z.array(
        z.object({
            questionText: z.string().describe('The question text that was answered incorrectly'),
            explanation: z
                .string()
                .describe('A concise 1-2 sentence explanation of why the answer was incorrect'),
            topicToReview: z.string().describe('A short 2-4 word topic to review')
        })
    )
});

export const POST: RequestHandler = async ({ request }) => {
    try {
        const { questions } = await request.json();

        if (!questions || !Array.isArray(questions)) {
            return json({ error: 'Invalid data' }, { status: 400 });
        }

        // Handle perfect score case
        const incorrectQuestions = questions.filter(
            (q: any) => q.userAnswer !== q.correctAnswer
        );

        if (incorrectQuestions.length === 0) {
            return json({
                feedback: [
                    {
                        questionText: 'Perfect Score!',
                        explanation: 'You answered all questions correctly. Keep up the great work!',
                        topicToReview: 'Advanced Topics'
                    }
                ]
            });
        }

        // Limit to first 5 incorrect questions to save tokens
        const questionsToAnalyze = incorrectQuestions.slice(0, 5).map((q: any) => ({
            question: q.questionText,
            userAnswer: q.userAnswer,
            correctAnswer: q.correctAnswer
        }));

        const prompt = `You are a flight instructor analyzing a pilot's test performance. 
Analyze the following incorrect answers and provide a brief explanation and a specific topic to review for each.
Keep the explanation concise (1-2 sentences) and the topic to review very short (2-4 words).

Incorrect Questions Data:
${JSON.stringify(questionsToAnalyze, null, 2)}

Return your analysis as a JSON object with a "feedback" array containing objects with "questionText", "explanation", and "topicToReview" fields.`;

        const { text } = await generateText({
            model: model as any, // Type assertion to work around v2/v3 incompatibility
            prompt
        });

        // Parse and validate the response (clean markdown code blocks first)
        const cleanedText = cleanJsonResponse(text);
        const result = feedbackSchema.parse(JSON.parse(cleanedText));
        return json(result);

    } catch (error) {
        console.error('AI Feedback Error:', error);

        // Return a structured fallback response
        return json({
            feedback: [
                {
                    questionText: 'Analysis Error',
                    explanation: 'Unable to process AI analysis at this time due to a service error. Please try again later.',
                    topicToReview: 'Retry Later'
                }
            ]
        });
    }
};
