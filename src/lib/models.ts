export interface StyleModel {
  id: string;
  name: string;
  imageSrc: string;
  triggerWord: string;
  loraUrl: string;
}

export const styleModels: StyleModel[] = [
  {
    id: "pixel",
    name: "Pixel Style",
    imageSrc: "/images/styles/pixel.png",
    triggerWord: "Pixel style",
    loraUrl:
      "https://huggingface.co/Owen777/Kontext-Style-Loras/resolve/main/Pixel_lora_weights.safetensors",
  },
  {
    id: "snoopy",
    name: "Snoopy Style",
    imageSrc: "/images/styles/snoopy.png",
    triggerWord: "Snoopy style",
    loraUrl:
      "https://huggingface.co/Owen777/Kontext-Style-Loras/resolve/main/Snoopy_lora_weights.safetensors",
  }, 
  {
    id: "jojo",
    name: "JoJo Style",
    imageSrc: "/images/styles/jojo.png",
    triggerWord: "JoJo style",
    loraUrl:
      "https://huggingface.co/Owen777/Kontext-Style-Loras/resolve/main/Jojo_lora_weights.safetensors",
  },
  {
    id: "clay",
    name: "Clay Style",
    imageSrc: "/images/styles/clay.png",
    triggerWord: "Clay style",
    loraUrl:
      "https://huggingface.co/Owen777/Kontext-Style-Loras/resolve/main/Clay_Toy_lora_weights.safetensors",
  },
  {
    id: "ghibli",
    name: "Ghibli Style",
    imageSrc: "/images/styles/ghibli.png",
    triggerWord: "Ghibli style",
    loraUrl:
      "https://huggingface.co/Owen777/Kontext-Style-Loras/resolve/main/Ghibli_lora_weights.safetensors",
  },
  {
    id: "americancartoon",
    name: "American Cartoon Style",
    imageSrc: "/images/styles/americancartoon.png",
    triggerWord: "American Cartoon style",
    loraUrl:
      "https://huggingface.co/Owen777/Kontext-Style-Loras/resolve/main/American_Cartoon_lora_weights.safetensors",
  },
  {
    id: "lego",
    name: "Lego Style",
    imageSrc: "/images/styles/lego.png",
    triggerWord: "Lego style",
    loraUrl:
      "https://huggingface.co/Owen777/Kontext-Style-Loras/resolve/main/LEGO_lora_weights.safetensors",
  },
  {
    id: "plushie",
    name: "Plushie Style",
    imageSrc: "/images/styles/plushie.png",
    triggerWord: "Plushie style",
    loraUrl:
      "https://huggingface.co/fal/Plushie-Kontext-Dev-LoRA/resolve/main/plushie-kontext-dev-lora.safetensors",
  },
  {
    id: "wojak",
    name: "Wojak Style",
    imageSrc: "/images/styles/wojack.jpg",
    triggerWord: "Wojak style",
    loraUrl:
      "https://huggingface.co/fal/Wojak-Kontext-Dev-LoRA/resolve/main/wojak-kontext-dev-lora.safetensors",
  },
];
