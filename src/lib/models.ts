import { StaticImageData } from 'next/image';

// Static imports for all style images
import pixelImg from '../../public/images/styles/pixel.png';
import snoopyImg from '../../public/images/styles/snoopy.png';
import jojoImg from '../../public/images/styles/jojo.png';
import clayImg from '../../public/images/styles/clay.png';
import ghibliImg from '../../public/images/styles/ghibli.png';
import americanCartoonImg from '../../public/images/styles/americancartoon.png';
import legoImg from '../../public/images/styles/lego.png';
import plushieImg from '../../public/images/styles/plushie.png';
import wojakImg from '../../public/images/styles/wojack.jpg';

export interface StyleModel {
  id: string;
  name: string;
  imageSrc: StaticImageData;
  triggerWord: string;
  loraUrl: string;
}

export const styleModels: StyleModel[] = [
  {
    id: "pixel",
    name: "Pixel Style",
    imageSrc: pixelImg,
    triggerWord: "Pixel style",
    loraUrl:
      "https://huggingface.co/Owen777/Kontext-Style-Loras/resolve/main/Pixel_lora_weights.safetensors",
  },
  {
    id: "snoopy",
    name: "Snoopy Style",
    imageSrc: snoopyImg,
    triggerWord: "Snoopy style",
    loraUrl:
      "https://huggingface.co/Owen777/Kontext-Style-Loras/resolve/main/Snoopy_lora_weights.safetensors",
  }, 
  {
    id: "jojo",
    name: "JoJo Style",
    imageSrc: jojoImg,
    triggerWord: "JoJo style",
    loraUrl:
      "https://huggingface.co/Owen777/Kontext-Style-Loras/resolve/main/Jojo_lora_weights.safetensors",
  },
  {
    id: "clay",
    name: "Clay Style",
    imageSrc: clayImg,
    triggerWord: "Clay style",
    loraUrl:
      "https://huggingface.co/Owen777/Kontext-Style-Loras/resolve/main/Clay_Toy_lora_weights.safetensors",
  },
  {
    id: "ghibli",
    name: "Ghibli Style",
    imageSrc: ghibliImg,
    triggerWord: "Ghibli style",
    loraUrl:
      "https://huggingface.co/Owen777/Kontext-Style-Loras/resolve/main/Ghibli_lora_weights.safetensors",
  },
  {
    id: "americancartoon",
    name: "American Cartoon Style",
    imageSrc: americanCartoonImg,
    triggerWord: "American Cartoon style",
    loraUrl:
      "https://huggingface.co/Owen777/Kontext-Style-Loras/resolve/main/American_Cartoon_lora_weights.safetensors",
  },
  {
    id: "lego",
    name: "Lego Style",
    imageSrc: legoImg,
    triggerWord: "Lego style",
    loraUrl:
      "https://huggingface.co/Owen777/Kontext-Style-Loras/resolve/main/LEGO_lora_weights.safetensors",
  },
  {
    id: "plushie",
    name: "Plushie Style",
    imageSrc: plushieImg,
    triggerWord: "Plushie style",
    loraUrl:
      "https://huggingface.co/fal/Plushie-Kontext-Dev-LoRA/resolve/main/plushie-kontext-dev-lora.safetensors",
  },
  {
    id: "wojak",
    name: "Wojak Style",
    imageSrc: wojakImg,
    triggerWord: "Wojak style",
    loraUrl:
      "https://huggingface.co/fal/Wojak-Kontext-Dev-LoRA/resolve/main/wojak-kontext-dev-lora.safetensors",
  },
];
