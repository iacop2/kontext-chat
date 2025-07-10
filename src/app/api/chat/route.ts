import { openai } from '@ai-sdk/openai';
import { tool, streamText, UIMessage, convertToModelMessages, stepCountIs } from 'ai';
import { z } from 'zod';
// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

export async function POST(req: Request) {
  const { messages }: { messages: UIMessage[] } = await req.json();

  const result = streamText({
    model: openai('gpt-4.1-mini'),
    messages: convertToModelMessages(messages),
    system: 'You are a helpful image generation and editing assistant. Generate exactly ONE image per user request using "startCreateImage" or "startEditImage". Use the user\'s prompt as-is unless it\'s unclear - do NOT improve or modify their prompt. After calling "startCreateImage" or "startEditImage", do not say anything else. When editing image, prioritize uploaded images first - if user has uploaded an image, use "startEditImage" with the uploaded image URL. Otherwise find the correct image url in the chat history and call "startEditImage" with that url as image URL input.',
    tools: {
    startCreateImage: tool({
      description:
        'Request image generation.',
      inputSchema: z.object({
        prompt: z.string().describe('The prompt for the image'),
      }),
    }),
    startEditImage: tool({
      description:
        'Request image editing.',
      inputSchema: z.object({
        prompt: z.string().describe('The prompt for the image'),
        imageUrl: z.string().url().describe('The URL of the image to edit'),
      }),
    }),
  },
  stopWhen: stepCountIs(5),
  });

  return result.toUIMessageStreamResponse();
}