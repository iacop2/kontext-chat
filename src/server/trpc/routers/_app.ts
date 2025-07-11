import { z } from "zod";
import { publicProcedure, router } from "../init";
import { createFalClient } from "@fal-ai/client";

const fal = createFalClient({
  credentials: () => process.env.FAL_KEY! as string,
    proxyUrl: "/api/fal",
});

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

});

export type AppRouter = typeof appRouter;
