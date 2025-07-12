import { openai } from '@ai-sdk/openai';
import { 
  tool, 
  streamText, 
  UIMessage, 
  convertToModelMessages, 
  stepCountIs,
  createUIMessageStream,
  createUIMessageStreamResponse
} from 'ai';
import { z } from 'zod';
import { createFalClient } from '@fal-ai/client';

const fal = createFalClient({
  credentials: () => process.env.FAL_KEY! as string,
  proxyUrl: "/api/fal",
});

// Constants
const INFERENCE_CONFIG = {
  num_inference_steps: 30,
  guidance_scale: 2.5,
  num_images: 1,
  enable_safety_checker: true,
  resolution_mode: "match_input" as const,
};

const SYSTEM_PROMPT = 'You are a helpful image generation and editing assistant. Generate exactly ONE image per user request using "createImage" or "editImage". Use the user\'s prompt as-is unless it\'s unclear - do NOT improve or modify their prompt.';

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

// Utility functions
function processMessagesWithFiles(messages: UIMessage[]): UIMessage[] {
  return messages.map(msg => {
    if (msg.role === 'user' && msg.parts) {
      const fileParts = msg.parts.filter(part => part.type === 'file');
      if (fileParts.length > 0) {
        const urls = fileParts.map(part => part.url).join('\n');
        const textParts = msg.parts.filter(part => part.type === 'text');
        const combinedText = textParts.map(part => part.text).join(' ') + 
          `\n[Attached images: ${urls}]`;
        
        return {
          ...msg,
          parts: [
            ...fileParts,
            { type: 'text' as const, text: combinedText }
          ]
        };
      }
    }
    return msg;
  });
}

async function uploadImageToStorage(imageUrl: string): Promise<string> {
  const imageResponse = await fetch(imageUrl);
  const imageBlob = await imageResponse.blob();
  return await fal.storage.upload(imageBlob);
}

function writeError(writer: any, errorMessage: string): void {
  writer.write({
    type: 'error',
    errorText: errorMessage
  });
}

function writeGenerationStatus(writer: any, toolCallId: string, data: any): void {
  writer.write({
    type: 'data-image-generation',
    id: toolCallId,
    data
  });
}

async function processImageGeneration(
  writer: any,
  toolCallId: string,
  prompt: string,
  type: 'create' | 'edit',
  imageUrl?: string,
  imageSize?: string
): Promise<{ prompt: string; imageUrl: string }> {
  try {
    // Write initial status
    writeGenerationStatus(writer, toolCallId, {
      status: 'starting',
      prompt,
      type
    });

    // Prepare stream input
    const streamInput: any = {
      prompt,
      ...INFERENCE_CONFIG
    };

    if (type === 'edit' && imageUrl) {
      streamInput.image_url = imageUrl;
    }

    if (type === 'create' && imageSize) {
      streamInput.image_size = imageSize;
    }

    // Start streaming generation
    const modelEndpoint = type === 'create' 
      ? 'fal-ai/flux-kontext-lora/text-to-image'
      : 'fal-ai/flux-kontext-lora';
    
    const stream = await fal.stream(modelEndpoint, {
      input: streamInput
    });

    // Stream progress events
    for await (const event of stream) {
      console.log("event", event);
      if (event.images?.[0]?.url) {
        writeGenerationStatus(writer, toolCallId, {
          status: 'generating',
          streamingImage: event.images[0].url,
          prompt,
          type
        });
      }
    }

    // Get final result
    const result = await stream.done();
    const images = result.data?.images || result.images || [];
    
    if (!images?.[0]) {
      throw new Error('No image generated');
    }

    // Upload final image to permanent storage
    const uploadResult = await uploadImageToStorage(images[0].url);

    // Write final result
    writeGenerationStatus(writer, toolCallId, {
      status: 'completed',
      finalImage: uploadResult,
      prompt,
      type
    });

    return { prompt, imageUrl: uploadResult };
  } catch (error: any) {
    writeError(writer, `Error ${type === 'create' ? 'generating' : 'editing'} image: ${error.message}`);
    throw error;
  }
}

export async function POST(req: Request) {
  const { messages }: { messages: UIMessage[] } = await req.json();

  console.log("messages", JSON.stringify(messages, null, 2));
  
  const processedMessages = processMessagesWithFiles(messages);
  const modelMessages = convertToModelMessages(processedMessages);

  const stream = createUIMessageStream({
    execute: ({ writer }) => {
      const result = streamText({
        model: openai('gpt-4.1-mini'),
        messages: modelMessages,
        system: SYSTEM_PROMPT,
        tools: {
        createImage: tool({
          description: 'Create a new image.',
          inputSchema: z.object({
            prompt: z.string().describe('The prompt for the image'),
            image_size: z.enum(['square_hd', 'square', 'portrait_4_3', 'portrait_16_9', 'landscape_4_3', 'landscape_16_9']).describe('The size/aspect ratio of the image to generate'),
          }),
          execute: async (args, { toolCallId }) => {
            return processImageGeneration(writer, toolCallId, args.prompt, 'create', undefined, args.image_size);
          },
        }),
        editImage: tool({
          description: 'Edit an existing image.',
          inputSchema: z.object({
            prompt: z.string().describe('The prompt for the image'),
            imageUrl: z.string().url().describe('The URL of the image to edit - MUST be from user file attachment data field if present'),
          }),
          execute: async (args, { toolCallId }) => {
            return processImageGeneration(writer, toolCallId, args.prompt, 'edit', args.imageUrl);
          },
        }),
        describeImage: tool({
          description: 'Gets a detailed text description of an image from a URL.',
          inputSchema: z.object({
            imageUrl: z.string().url().describe('The URL of the image to describe.'),
          }),
          execute: async ({ imageUrl }, { toolCallId }) => {
            const { textStream } = streamText({
              model: openai('gpt-4.1-mini'),
              messages: [
                {
                  role: 'user',
                  content: [
                    { type: 'text', text: 'Describe this image in detail.' },
                    { type: 'image', image: new URL(imageUrl) },
                  ],
                },
              ],
            });

            let description = '';
            for await (const chunk of textStream) {
              description += chunk;
              console.log("chunk", chunk);
              writer.write({
                id: toolCallId,
                type: 'data-image-description',
                data: {
                  description: description, // Send accumulated description
                },
              });
            }

            return { description };
          },
        }),
      },
      stopWhen: stepCountIs(5),
      });

      writer.merge(result.toUIMessageStream());
    },
  });

  return createUIMessageStreamResponse({ stream });
}