import { createGroq } from '@ai-sdk/groq';
import {
  streamText,
  convertToModelMessages,
  createUIMessageStream,
  createUIMessageStreamResponse,
  type UIMessage
} from 'ai';
import { Pinecone } from '@pinecone-database/pinecone';
import { HuggingFaceInferenceEmbeddings } from '@langchain/community/embeddings/hf';
import { PineconeStore } from '@langchain/pinecone';
import type { RequestHandler } from './$types';
import { env } from '$env/dynamic/private';

const groq = createGroq({
  apiKey: env.GROQ_API_KEY,
});

const getTextFromMessage = (message?: UIMessage) => {
  if (!message) return '';
  return message.parts
    .map((part) => (part.type === 'text' ? part.text : ''))
    .join('\n')
    .trim();
};

export const POST: RequestHandler = async ({ request }) => {
  const { messages } = (await request.json()) as { messages: UIMessage[] };
  const lastMessage = messages[messages.length - 1];
  const lastMessageText = getTextFromMessage(lastMessage);

  // Check if the message is a greeting
  const greetingPattern = /^(hi|hello|hey|greetings|good morning|good afternoon|good evening)\b/i;
  const isGreeting = greetingPattern.test(lastMessageText.trim());

  let contextBlock = '';
  let citations: Array<{ source: string; preview: string }> = [];

  // Only perform RAG retrieval for non-greeting queries
  if (!isGreeting && lastMessageText.trim().length > 0) {
    const pinecone = new Pinecone({ apiKey: env.PINECONE_API_KEY || '' });
    const pineconeIndex = pinecone.Index(env.PINECONE_INDEX || 'thrustlab-rag');

    const vectorStore = await PineconeStore.fromExistingIndex(
      new HuggingFaceInferenceEmbeddings({
        apiKey: env.HUGGINGFACE_API_KEY,
        model: 'BAAI/bge-large-en-v1.5',
      }),
      { pineconeIndex }
    );

    const retrievalResults = await vectorStore.similaritySearch(lastMessageText, 4);

    contextBlock = retrievalResults
      .map((doc, index) => `Context Chunk ${index + 1}:\n${doc.pageContent}`)
      .join('\n\n');

    citations = retrievalResults.map((doc) => ({
      source: doc.metadata.source,
      preview: doc.pageContent.substring(0, 60) + "..."
    }));
  }

  const systemPrompt = isGreeting
    ? `You are JaJa, an avionics engineering copilot for the ThrustLab training environment.

The student is greeting you. Respond warmly and briefly (1-2 sentences). Welcome them to ThrustLab and invite them to ask questions about turbofan engines, gas turbines, or aviation propulsion systems.`
    : `You are JaJa, an avionics engineering copilot for the ThrustLab training environment.

Response requirements:
- Answer the student's question directly and concisely using the context below.
- Synthesize the information in your own words; NEVER mention filenames, "context", "document", or "chunk" in your response.
- If defining a technical term, start with a clear definition, then add 1-2 key details from the context.
- If the context doesn't answer the question, say so briefly and ask for clarification.
- Keep your response to 2-3 short paragraphs or use a brief bullet list for clarity.

Context:
${contextBlock || 'No relevant context was retrieved.'}
`;

  const stream = createUIMessageStream({
    originalMessages: messages,
    execute: async ({ writer }) => {
      // Only send citations for non-greeting queries that have results
      if (!isGreeting && citations.length > 0) {
        writer.write({
          type: 'data-citations',
          data: citations,
        });
      }

      try {
        const modelMessages = await convertToModelMessages(messages);
        const result = streamText({
          model: groq('llama-3.1-8b-instant') as any, // Type assertion for v2 compatibility
          messages: modelMessages,
          system: systemPrompt,
        });

        writer.merge(result.toUIMessageStream());
      } catch (error) {
        console.error('Error in streamText:', error);
        writer.write({
          type: 'text-delta',
          delta: '\n\nSorry, I encountered an error while generating the response.',
          id: 'error-recovery',
        });
      }
    },
  });

  return createUIMessageStreamResponse({ stream });
};