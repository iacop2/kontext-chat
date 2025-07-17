import { openai } from '@ai-sdk/openai';
import { 
  tool, 
  streamText, 
  UIMessage, 
  convertToModelMessages, 
  createUIMessageStream,
  createUIMessageStreamResponse
} from 'ai';
import { z } from 'zod';
import { createFalClient } from '@fal-ai/client';
import { NextRequest } from 'next/server';
import { checkBotId } from 'botid/server';
import { Ratelimit } from '@upstash/ratelimit';
import { kv } from '@vercel/kv';

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

// Create Rate limit
const ratelimit = new Ratelimit({
  redis: kv,
  limiter: Ratelimit.fixedWindow(1, '99999d'),
});

// Types
interface StreamWriter {
  write: (data: any) => void;
  merge: (stream: any) => void;
}

interface ImageGenerationData {
  status: string;
  prompt: string;
  type: 'create' | 'edit';
  streamingImage?: string;
  finalImage?: string;
  progress?: number;
}

interface LoraData {
  name: string;
  loraUrl: string | undefined;
  loraTriggerWord: string | undefined;
}

// Configuration
const DEFAULT_MODEL = process.env.OPENAI_MODEL || 'gpt-4.1-mini';
const FETCH_TIMEOUT = parseInt(process.env.FETCH_TIMEOUT || '30000');

// Test Mode Configuration
const TEST_MODE = process.env.TEST_MODE === 'true';
const TEST_DELAY = parseInt(process.env.TEST_DELAY || '5000');
const TEST_IMAGE_URL = process.env.TEST_IMAGE_URL || 'https://v3.fal.media/files/elephant/00rs5Nhmp2JZ0WSnGNdUM_1752483234655.jpeg';

function createFalClientWithKey(apiKey?: string) {
  return createFalClient({
   credentials: apiKey ?? undefined,
  });
}


// Constants
const INFERENCE_CONFIG = {
  num_inference_steps: 30,
  guidance_scale: 2.5,
  num_images: 1,
  enable_safety_checker: true,
};

const SYSTEM_PROMPT = "You are a helpful image generation and editing assistant. Generate one image per user request using `editImage` or `createImage`. Prompt Handling: - Keep the user prompt exactly as-is, do not modify it. LoRA Style: - Use the selected LoRA if present; if none is selected, don't use one. - When using LoRA, you must include its trigger word exactly as-is in the loraTriggerWord. - If the user prompt is empty, use: \"Turn the image into the *loraTriggerWord* style.\" Image Editing Rules: - Use the attached image if available. - If no image is attached but one exists earlier in the conversation, use the most recent image (including generated ones). - If only a LoRA is selected and no new image or prompt is provided, apply the LoRA to the latest image. - Only create a new image if the user explicitly asks for it. Parameters: - `createImage` → `imageSize`: [square_hd, square, portrait_4_3 (default), portrait_16_9, landscape_4_3, landscape_16_9] - `editImage` → `resolutionMode`: [match_input (default), 1:1, 16:9, 21:9, 3:2, 2:3, 4:5, 5:4, 3:4, 4:3, 9:16, 9:21] - Use the nearest available value when user specifies a size/aspect ratio. Important: Ignore any random words (e.g., animal names) in image URLs—they do not indicate image content.";


// Utility functions
function processMessagesWithFiles(messages: UIMessage[]): UIMessage[] {
  return messages.map(msg => {
    if (msg.role === 'user' && msg.parts) {
      const fileParts = msg.parts.filter(part => part.type === 'file');
      const loraParts = msg.parts.filter(part => part.type === 'data-lora-selection');
      const textParts = msg.parts.filter(part => part.type === 'text');
      
      const userPrompt = textParts.map(part => part.text).join(' ');
      
      // Build context object
      const context = {
        userPrompt,
        imageAttached: fileParts.length > 0 ? fileParts.map(part => part.url) : null,
        loraSelected: loraParts.length > 0 ? loraParts.map(part => {
          const data = (part as any).data as LoraData;
          return {
            name: data.name,
            loraUrl: data.loraUrl || undefined,
            loraTriggerWord: data.loraTriggerWord || undefined
          };
        }) : null
      };
      
      const combinedText = JSON.stringify(context);
      
      return {
        id: msg.id,
        role: msg.role,
        parts: [
          { type: 'text' as const, text: combinedText }
        ]
      };
    }
    return msg;
  });
}

async function uploadImageToStorage(imageUrl: string, fal: any): Promise<string> {
  // Validate URL format
  try {
    new URL(imageUrl);
  } catch {
    throw new Error(`Invalid image URL format: ${imageUrl}`);
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), FETCH_TIMEOUT);

  try {
    const imageResponse = await fetch(imageUrl, {
      signal: controller.signal,
    });

    if (!imageResponse.ok) {
      throw new Error(`Failed to fetch image: ${imageResponse.status} ${imageResponse.statusText}`);
    }

    const contentType = imageResponse.headers.get('content-type');
    if (!contentType?.startsWith('image/')) {
      throw new Error(`Invalid content type: ${contentType}. Expected image.`);
    }

    const imageBlob = await imageResponse.blob();
    return await fal.storage.upload(imageBlob);
  } catch (error: any) {
    if (error.name === 'AbortError') {
      throw new Error(`Image fetch timeout after ${FETCH_TIMEOUT}ms`);
    }
    throw error;
  } finally {
    clearTimeout(timeoutId);
  }
}

function writeError(writer: StreamWriter, errorMessage: string): void {
  writer.write({
    type: 'error',
    errorText: errorMessage
  });
}

function writeGenerationStatus(writer: StreamWriter, toolCallId: string, data: ImageGenerationData): void {
  writer.write({
    type: 'data-image-generation',
    id: toolCallId,
    data
  });
}

async function processTestModeGeneration(
  writer: StreamWriter,
  toolCallId: string,
  prompt: string,
  type: 'create' | 'edit',
  fal: any
): Promise<{ prompt: string; imageUrl: string }> {
  // Simulate progress with delays
  await new Promise(resolve => setTimeout(resolve, TEST_DELAY));
  writeGenerationStatus(writer, toolCallId, {
    status: 'generating',
    streamingImage: TEST_IMAGE_URL,
    prompt,
    type
  });

  await new Promise(resolve => setTimeout(resolve, TEST_DELAY));
  
  // Write uploading status
  writeGenerationStatus(writer, toolCallId, {
    status: 'uploading',
    streamingImage: TEST_IMAGE_URL,
    prompt,
    type
  });

  // Actually upload the test image to permanent storage
  const uploadResult = await uploadImageToStorage(TEST_IMAGE_URL, fal);
  
  writeGenerationStatus(writer, toolCallId, {
    status: 'completed',
    finalImage: uploadResult,
    prompt,
    type
  });

  return { prompt, imageUrl: uploadResult };
}

async function processImageGeneration(
  writer: StreamWriter,
  toolCallId: string,
  prompt: string,
  type: 'create' | 'edit',
  fal: any,
  imageUrl?: string,
  imageSize?: string,
  loraUrl?: string
): Promise<{ prompt: string; imageUrl: string }> {
  try {
    // Write initial status
    writeGenerationStatus(writer, toolCallId, {
      status: 'starting',
      prompt,
      type
    });

    if (TEST_MODE) {
      return await processTestModeGeneration(writer, toolCallId, prompt, type, fal);
    }

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

    if (type === 'edit' && imageSize) {
      streamInput.resolution_mode = imageSize;
    }

    // Add LoRA if provided
    if (loraUrl) {
      streamInput.loras = [{
        path: loraUrl,
        scale: 1.0
      }];
    }

    // Start streaming generation
    const modelEndpoint = type === 'create' 
      ? 'fal-ai/flux-kontext-lora/text-to-image'
      : 'fal-ai/flux-kontext-lora';
    
    const stream = await fal.stream(modelEndpoint, {
      input: streamInput
    });

    // Stream progress events
    let lastStreamingImage: string | null = null;
    for await (const event of stream) {
      if (event.images?.[0]?.url) {
        lastStreamingImage = event.images[0].url;
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

    // Write uploading status while keeping last streaming image visible
    writeGenerationStatus(writer, toolCallId, {
      status: 'uploading',
      streamingImage: lastStreamingImage || undefined,
      prompt,
      type
    });

    // Upload final image to permanent storage
    const uploadResult = await uploadImageToStorage(images[0].url, fal);

    // Write final result
    writeGenerationStatus(writer, toolCallId, {
      status: 'completed',
      finalImage: uploadResult,
      prompt,
      type
    });

    return { prompt, imageUrl: uploadResult };
  } catch (error: any) {
    const operation = type === 'create' ? 'generating' : 'editing';
    const contextMessage = imageUrl ? ` (image: ${imageUrl.substring(0, 50)}...)` : '';
    
    // Check for authentication errors
    if (error.message?.includes('Unauthorized') || error.message?.includes('Invalid API key') || error.status === 401) {
      const errorMessage = `Invalid FAL API key. Please check your API key and try again.`;
      writeError(writer, errorMessage);
      throw new Error(errorMessage);
    }
    
    const errorMessage = `Error ${operation} image${contextMessage}: ${error.message || 'Unknown error'}`;
    
    console.error(`[${operation.toUpperCase()}] ${errorMessage}`, {
      prompt,
      imageUrl,
      loraUrl,
      error: error.stack || error
    });
    
    writeError(writer, errorMessage);
    throw error;
  }
}

export async function POST(req: NextRequest) {
  // Check for bot activity first
  const verification = await checkBotId();
  if (verification.isBot) {
    return new Response("Access denied", { status: 403 });
  }

  try {
    const body = await req.json();
    const { messages, apiKey }: { messages: UIMessage[], apiKey?: string } = body;
    
    // Extract custom API key from request body
    const customApiKey = apiKey?.trim();
    const hasCustomApiKey = customApiKey && customApiKey.length > 0;
  
    let fal;
    
    if (hasCustomApiKey) {
      // If API key provided, create client directly with that key
      fal = createFalClientWithKey(customApiKey);
    } else {
      // If no API key provided, go through rate limiter first
      const ip = req.headers.get("x-forwarded-for") ?? "ip";
      const { success } = await ratelimit.limit(ip);
      if (!success) {
        return new Response(
          `Free request limit exceeded. Please add your FAL API key to continue without rate limits.`,
          { status: 429 }
        );
      }
      // If rate limit passed, use project key
      fal = createFalClientWithKey(process.env.FAL_KEY!);
    }

    const processedMessages = processMessagesWithFiles(messages);
    const modelMessages = convertToModelMessages(processedMessages);

    const stream = createUIMessageStream({
      execute: ({ writer }) => {
        try {
          const result = streamText({
            model: openai(DEFAULT_MODEL),
            messages: modelMessages,
            system: SYSTEM_PROMPT,
            tools: {
        createImage: tool({
          description: 'Create a new image.',
          inputSchema: z.object({
            prompt: z.string().describe('The prompt for the image'),
            imageSize: z.enum(['square_hd', 'square', 'portrait_4_3', 'portrait_16_9', 'landscape_4_3', 'landscape_16_9']).default('portrait_4_3').describe('The size/aspect ratio of the image to generate'),
            loraUrl: z.string().url().optional().describe('Optional LoRA URL for style application'),
          }),
          execute: async (args, { toolCallId }) => {
            return processImageGeneration(writer, toolCallId, args.prompt, 'create', fal, undefined, args.imageSize, args.loraUrl);
          },
        }),
        editImage: tool({
          description: 'Edit an existing image.',
          inputSchema: z.object({
            prompt: z.string().describe('The prompt for the image'),
            resolutionMode: z.enum(['match_input', '1:1', '16:9', '21:9', '3:2', '2:3', '4:5', '5:4', '3:4', '4:3', '9:16', '9:21']).default('match_input').describe('The size/aspect ratio of the image to generate'),
            imageUrl: z.string().url().describe('The URL of the image to edit'),
            loraUrl: z.string().url().optional().describe('Optional LoRA URL for style application'),
          }),
          execute: async (args, { toolCallId }) => {
            return processImageGeneration(writer, toolCallId, args.prompt, 'edit', fal, args.imageUrl, args.resolutionMode, args.loraUrl);
          },
        }),
        describeImage: tool({
          description: 'Gets a detailed text description of an image from a URL.',
          inputSchema: z.object({
            imageUrl: z.string().url().describe('The URL of the image to describe.'),
          }),
          execute: async ({ imageUrl }, { toolCallId }) => {
            const { textStream } = streamText({
              model: openai(DEFAULT_MODEL),
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
      });

          writer.merge(result.toUIMessageStream());
        } catch (error: any) {
          const errorMessage = `Error processing request: ${error.message || 'Unknown error'}`;
          console.error('[STREAM_TEXT] ' + errorMessage, {
            error: error.stack || error,
            messages: messages.length
          });
          writeError(writer, errorMessage);
        }
      },
    });

    return createUIMessageStreamResponse({ stream });
  } catch (error: any) {
    const errorMessage = error.message || 'Unknown error occurred';
    console.error('[POST_HANDLER] Internal server error:', {
      error: error.stack || error,
      message: errorMessage
    });
    
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error', 
        message: errorMessage,
        timestamp: new Date().toISOString()
      }),
      { 
        status: 500, 
        headers: { 'Content-Type': 'application/json' } 
      }
    );
  }
}