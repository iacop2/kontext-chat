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
    system: 'You are a helpful image generation and editing assistant. ONLY IF NECESSARY, ask the user for more info to create the prompt for the image. After calling "generateImage", do not say anything else.',
    tools: {
    generateImage: tool({
      description:
        'Generate the image requested by the user.',
      inputSchema: z.object({
        prompt: z.string().describe('The prompt for the image'),
      }),
    }),
  },
  stopWhen: stepCountIs(5),
  });

  return result.toUIMessageStreamResponse();
}