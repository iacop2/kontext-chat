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
// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

export async function POST(req: Request) {
  const { messages }: { messages: UIMessage[] } = await req.json();

  console.log("messages", JSON.stringify(messages, null, 2));
  
  // Process messages to extract file URLs and include them in message text
  const processedMessages = messages.map(msg => {
    if (msg.role === 'user' && msg.parts) {
      // Extract file URLs from the message parts
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

  const modelMessages = convertToModelMessages(processedMessages);

  const stream = createUIMessageStream({
    execute: ({ writer }) => {
      const result = streamText({
        model: openai('gpt-4.1-mini'),
        messages: modelMessages,
        system: 'You are a helpful image generation and editing assistant. Generate exactly ONE image per user request using "createImage" or "editImage". Use the user\'s prompt as-is unless it\'s unclear - do NOT improve or modify their prompt.',
        tools: {
        createImage: tool({
          description:
            'Create a new image.',
          inputSchema: z.object({
            prompt: z.string().describe('The prompt for the image'),
          }),
          execute: async (args, { toolCallId }) => {
            try {
              // Write initial status
              writer.write({
                type: 'data-image-generation',
                id: toolCallId,
                data: {
                  status: 'starting',
                  prompt: args.prompt,
                  type: 'create'
                }
              });

              // Start streaming generation
              const stream = await fal.stream('fal-ai/flux-kontext-lora/text-to-image', {
                input: {
                  prompt: args.prompt,
                  num_inference_steps: 30,
                  guidance_scale: 2.5,
                  num_images: 1,
                  enable_safety_checker: true,
                  resolution_mode: "match_input",
                }
              });

              // Stream progress events
              for await (const event of stream) {
                console.log("event", event);
                if (event.images?.[0]?.url) {
                  writer.write({
                    type: 'data-image-generation',
                    id: toolCallId,
                    data: {
                      status: 'generating',
                      streamingImage: event.images[0].url,
                      prompt: args.prompt,
                      type: 'create'
                    }
                  });
                }
              }

              // Get final result
              const result = await stream.done();

              // Handle different possible response structures
              const images = result.data?.images || result.images || [];
              if (!images?.[0]) {
                throw new Error('No image generated');
              }

              // Upload final image to permanent storage
              const imageResponse = await fetch(images[0].url);
              const imageBlob = await imageResponse.blob();
              const uploadResult = await fal.storage.upload(imageBlob);

              // Write final result as data update
              writer.write({
                type: 'data-image-generation',
                id: toolCallId,
                data: {
                  status: 'completed',
                  finalImage: uploadResult,
                  prompt: args.prompt,
                  type: 'create'
                }
              });

              return { prompt: args.prompt, imageUrl: uploadResult };
            } catch (error: any) {
              writer.write({
                type: 'error',
                errorText: `Error generating image: ${error.message}`
              });
              throw error;
            }
          },
        }),
        editImage: tool({
          description:
            'Edit an existing image.',
          inputSchema: z.object({
            prompt: z.string().describe('The prompt for the image'),
            imageUrl: z.string().url().describe('The URL of the image to edit - MUST be from user file attachment data field if present'),
          }),
          execute: async (args, { toolCallId }) => {
            try {
              // Write initial status
              writer.write({
                type: 'data-image-generation',
                id: toolCallId,
                data: {
                  status: 'starting',
                  prompt: args.prompt,
                  type: 'edit'
                }
              });

              // Start streaming editing
              const stream = await fal.stream('fal-ai/flux-kontext-lora', {
                input: {
                  prompt: args.prompt,
                  image_url: args.imageUrl,
                  num_inference_steps: 30,
                  guidance_scale: 2.5,
                  num_images: 1,
                  enable_safety_checker: true,
                  resolution_mode: "match_input",
                }
              });

              // Stream progress events
              for await (const event of stream) {
                if (event.images?.[0]?.url) {
                  writer.write({
                    type: 'data-image-generation',
                    id: toolCallId,
                    data: {
                      status: 'generating',
                      streamingImage: event.images[0].url,
                      prompt: args.prompt,
                      type: 'edit'
                    }
                  });
                }
              }

              // Get final result
              const result = await stream.done();

              // Handle different possible response structures
              const images = result.data?.images || result.images || [];
              if (!images?.[0]) {
                throw new Error('No image generated');
              }

              // Upload final image to permanent storage
              const imageResponse = await fetch(images[0].url);
              const imageBlob = await imageResponse.blob();
              const uploadResult = await fal.storage.upload(imageBlob);

              // Write final result as data update
              writer.write({
                type: 'data-image-generation',
                id: toolCallId,
                data: {
                  status: 'completed',
                  finalImage: uploadResult,
                  prompt: args.prompt,
                  type: 'edit'
                }
              });

              return { prompt: args.prompt, imageUrl: uploadResult };
            } catch (error: any) {
              writer.write({
                type: 'error',
                errorText: `Error editing image: ${error.message}`
              });
              throw error;
            }
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