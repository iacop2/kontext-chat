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
import { truncateStringsInObject } from '@/lib/utils';

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

const TEST_MODE = true;

const SYSTEM_PROMPT = 'You are a helpful image generation and editing assistant. Generate exactly ONE image per user request using "createImage" or "editImage". You will always be informed about the current context consisting of attached image and selected LoRA style.\n\nFor prompts:\n- Always use the user\'s submitted prompt as-is\n- Only ask for clarification if the prompt is truly unclear\n\nFor LoRA styles:\n- Always use the LoRA selected by the user if one is currently selected\n- If no LoRA is selected, do not use one\n- CRITICAL: When using a LoRA, you MUST ALWAYS include the LoRA prompt exactly as-is in the prompt parameter, or the LoRA will not work\n\nFor editing requests:\n- Always use the attached image if present\n- If no image is attached, deduce from context which image the user wants to edit, prioritizing the most recent one, including generated images\n- If unclear, ask for clarification\n- If only LoRA is selected, apply the LoRA to the most recent image, including generated images';

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

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
          const data = (part as any).data;
          return {
            name: data.name,
            loraUrl: data.loraUrl || null,
            loraPrompt: data.prompt || null
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
      // Mock generation process for test mode
      const mockImageUrl = 'http://localhost:3000/images/community/2.jpg';
      
      // Simulate progress with delays
      await new Promise(resolve => setTimeout(resolve, 500));
      writeGenerationStatus(writer, toolCallId, {
        status: 'generating',
        streamingImage: mockImageUrl,
        prompt,
        type
      });

      await new Promise(resolve => setTimeout(resolve, 1000));
      writeGenerationStatus(writer, toolCallId, {
        status: 'completed',
        finalImage: mockImageUrl,
        prompt,
        type
      });

      return { prompt, imageUrl: mockImageUrl };
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
  try {
    const { messages }: { messages: UIMessage[] } = await req.json();

    console.log("messages", JSON.stringify(messages, null, 2));
    
    const processedMessages = processMessagesWithFiles(messages);
    console.log("processedMessages", JSON.stringify(truncateStringsInObject(processedMessages), null, 2));
    const modelMessages = convertToModelMessages(processedMessages);

    const stream = createUIMessageStream({
      execute: ({ writer }) => {
        try {
          const result = streamText({
            model: openai('gpt-4.1-mini'),
            messages: modelMessages,
            system: SYSTEM_PROMPT,
            tools: {
        createImage: tool({
          description: 'Create a new image.',
          inputSchema: z.object({
            prompt: z.string().describe('The prompt for the image'),
            image_size: z.enum(['square_hd', 'square', 'portrait_4_3', 'portrait_16_9', 'landscape_4_3', 'landscape_16_9']).default('portrait_4_3').describe('The size/aspect ratio of the image to generate'),
            loraUrl: z.string().url().optional().describe('Optional LoRA URL for style application'),
          }),
          execute: async (args, { toolCallId }) => {
            return processImageGeneration(writer, toolCallId, args.prompt, 'create', undefined, args.image_size, args.loraUrl);
          },
        }),
        editImage: tool({
          description: 'Edit an existing image.',
          inputSchema: z.object({
            prompt: z.string().describe('The prompt for the image'),
            imageUrl: z.string().url().describe('The URL of the image to edit'),
            loraUrl: z.string().url().optional().describe('Optional LoRA URL for style application'),
          }),
          execute: async (args, { toolCallId }) => {
            return processImageGeneration(writer, toolCallId, args.prompt, 'edit', args.imageUrl, undefined, args.loraUrl);
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
        } catch (error: any) {
          console.error('Error in streamText execution:', error);
          writeError(writer, `Error processing request: ${error.message}`);
        }
      },
    });

    return createUIMessageStreamResponse({ stream });
  } catch (error: any) {
    console.error('Error in POST handler:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error', message: error.message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}