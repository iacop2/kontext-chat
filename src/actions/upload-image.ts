'use server';

import { createFalClient } from "@fal-ai/client";

const fal = createFalClient({
  credentials: () => process.env.FAL_KEY! as string,
  proxyUrl: "/api/fal",
});

export async function uploadImage(imageUrl: string) {
  try {
    const response = await fetch(imageUrl);
    const blob = await response.blob();

    const uploadResult = await fal.storage.upload(blob);

    return {
      success: true,
      url: uploadResult,
    };
  } catch (error) {
    console.error("Error uploading image:", error);
    return {
      success: false,
      error: "Failed to upload image",
    };
  }
}