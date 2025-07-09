import { z } from "zod";
import { publicProcedure, router } from "../init";
import { tracked } from "@trpc/server";
import { createFalClient } from "@fal-ai/client";

const fal = createFalClient({
  credentials: () => process.env.FAL_KEY! as string,
    proxyUrl: "/api/fal",
});

// Helper function to create image generation stream
async function* createImageStream(
  model: string,
  input: {
    prompt: string;
    image_url?: string;
    loraUrl?: string;
    seed?: number;
  },
  signal?: AbortSignal
) {
  try {
    const loras = input.loraUrl ? [{ path: input.loraUrl, scale: 1 }] : [];
    
    // Create a unique ID for this generation
    const generationId = `gen_${Date.now()}_${Math.random().toString(36).substring(7)}`;

    // Prepare the API input based on model
    const apiInput = {
      prompt: input.prompt,
      num_inference_steps: 30,
      guidance_scale: 2.5,
      num_images: 1,
      enable_safety_checker: true,
      resolution_mode: "match_input",
      seed: input.seed,
      loras,
      ...(input.image_url && { image_url: input.image_url }),
    };

    // Start streaming from fal.ai
    const stream = await fal.stream(model, { input: apiInput });

    let eventIndex = 0;

    // Stream events as they come
    for await (const event of stream) {
      if (signal?.aborted) {
        break;
      }

      const eventId = `${generationId}_${eventIndex++}`;

      yield tracked(eventId, {
        type: "progress",
        data: event,
      });
    }

    // Get the final result
    const result = await stream.done();

    // Handle different possible response structures
    const images = result.data?.images || result.images || [];
    if (!images?.[0]) {
      yield tracked(`${generationId}_error`, {
        type: "error",
        error: "No image generated",
      });
      return;
    }

    // Send the final image
    yield tracked(`${generationId}_complete`, {
      type: "complete",
      imageUrl: images[0].url,
      seed: result.data?.seed || result.seed,
    });
  } catch (error) {
    console.error("Error in image generation stream:", error);
    yield tracked(`error_${Date.now()}`, {
      type: "error",
      error:
        error instanceof Error ? error.message : "Failed to generate image",
    });
  }
}

export const appRouter = router({
  hello: publicProcedure
    .input(z.object({ name: z.string().optional() }))
    .query(({ input }) => {
      return {
        greeting: `Hello ${input.name ?? "World"}!`,
      };
    }),

  uploadImage: publicProcedure
    .input(
      z.object({
        image: z.string(),
      }),
    )
    .mutation(async ({ input }) => {
      try {
        const response = await fetch(input.image);
        const blob = await response.blob();

        const uploadResult = await fal.storage.upload(blob);

        return {
          url: uploadResult,
        };
      } catch (error) {
        console.error("Error uploading image:", error);
        throw new Error("Failed to upload image");
      }
    }),

  generateImageStream: publicProcedure
    .input(
      z.object({
        prompt: z.string(),
        loraUrl: z.string().url().optional(),
        seed: z.number().optional(),
        lastEventId: z.string().optional(),
      }),
    )
    .subscription(async function* ({ input, signal }) {
      yield* createImageStream(
        "fal-ai/flux-kontext-lora/text-to-image",
        {
          prompt: input.prompt,
          loraUrl: input.loraUrl,
          seed: input.seed,
        },
        signal
      );
    }),

  editImageStream: publicProcedure
    .input(
      z.object({
        prompt: z.string(),
        imageUrl: z.string().url(),
        loraUrl: z.string().url().optional(),
        seed: z.number().optional(),
        lastEventId: z.string().optional(),
      }),
    )
    .subscription(async function* ({ input, signal }) {
      yield* createImageStream(
        "fal-ai/flux-kontext-lora",
        {
          prompt: input.prompt,
          image_url: input.imageUrl,
          loraUrl: input.loraUrl,
          seed: input.seed,
        },
        signal
      );
    }),
});

export type AppRouter = typeof appRouter;
