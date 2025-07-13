export interface StyleModel {
  id: string;
  name: string;
  imageSrc: string;
  prompt: string;
  loraUrl?: string;
}

export const styleModels: StyleModel[] = [
  {
    id: "pixel",
    name: "Pixel Style",
    imageSrc: "/images/styles/pixel.png",
    prompt: "Turn this image into the Pixel style.",
    loraUrl:
      "https://huggingface.co/Owen777/Kontext-Style-Loras/resolve/main/Pixel_lora_weights.safetensors",
  },
  {
    id: "snoopy",
    name: "Snoopy Style",
    imageSrc: "/images/styles/snoopy.png",
    prompt: "Turn this image into the Snoopy style.",
    loraUrl:
      "https://huggingface.co/Owen777/Kontext-Style-Loras/resolve/main/Snoopy_lora_weights.safetensors",
  }, 
  {
    id: "jojo",
    name: "JoJo Style",
    imageSrc: "/images/styles/jojo.png",
    prompt: "Turn this image into the JoJo style.",
    loraUrl:
      "https://huggingface.co/Owen777/Kontext-Style-Loras/resolve/main/Jojo_lora_weights.safetensors",
  },
  {
    id: "clay",
    name: "Clay Style",
    imageSrc: "/images/styles/clay.png",
    prompt: "Turn this image into the Clay style.",
    loraUrl:
      "https://huggingface.co/Owen777/Kontext-Style-Loras/resolve/main/Clay_Toy_lora_weights.safetensors",
  },
  {
    id: "ghibli",
    name: "Ghibli Style",
    imageSrc: "/images/styles/ghibli.png",
    prompt: "Turn this image into the Ghibli style.",
    loraUrl:
      "https://huggingface.co/Owen777/Kontext-Style-Loras/resolve/main/Ghibli_lora_weights.safetensors",
  },
  {
    id: "americancartoon",
    name: "American Cartoon Style",
    imageSrc: "/images/styles/americancartoon.png",
    prompt: "Turn this image into the American Cartoon style.",
    loraUrl:
      "https://huggingface.co/Owen777/Kontext-Style-Loras/resolve/main/American_Cartoon_lora_weights.safetensors",
  },
  {
    id: "lego",
    name: "Lego Style",
    imageSrc: "/images/styles/lego.png",
    prompt: "convert to lego style",
    loraUrl:
      "https://huggingface.co/Owen777/Kontext-Style-Loras/resolve/main/LEGO_lora_weights.safetensors",
  },
  {
    id: "broccoli",
    name: "Broccoli Hair",
    imageSrc: "/images/styles/broccoli.jpeg",
    prompt: "Change hair to a broccoli haircut",
    loraUrl:
      "https://huggingface.co/fal/Broccoli-Hair-Kontext-Dev-LoRA/resolve/main/broccoli-hair-kontext-dev-lora.safetensors",
  },
  {
    id: "plushie",
    name: "Plushie Style",
    imageSrc: "/images/styles/plushie.png",
    prompt: "Convert to plushie style",
    loraUrl:
      "https://huggingface.co/fal/Plushie-Kontext-Dev-LoRA/resolve/main/plushie-kontext-dev-lora.safetensors",
  },
  {
    id: "wojak",
    name: "Wojak Style",
    imageSrc: "/images/styles/wojack.jpg",
    prompt: "Convert to wojak style drawing",
    loraUrl:
      "https://huggingface.co/fal/Wojak-Kontext-Dev-LoRA/resolve/main/wojak-kontext-dev-lora.safetensors",
  },
];
