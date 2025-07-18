import { StaticImageData } from 'next/image';

// Static imports for all style images
import chibi3DImg from '../../public/images/styles/3D_Chibi.webp';
import americanCartoonImg from '../../public/images/styles/American_Cartoon.webp';
import chineseInkImg from '../../public/images/styles/Chinese_Ink.webp';
import clayToyImg from '../../public/images/styles/Clay_Toy.webp';
import fabricImg from '../../public/images/styles/Fabric.webp';
import ghibliImg from '../../public/images/styles/Ghibli.webp';
import irasutoyaImg from '../../public/images/styles/Irasutoya.webp';
import jojoImg from '../../public/images/styles/Jojo.webp';
import legoImg from '../../public/images/styles/LEGO.webp';
import lineImg from '../../public/images/styles/Line.webp';
import macaronImg from '../../public/images/styles/Macaron.webp';
import oilPaintingImg from '../../public/images/styles/Oil_Painting.webp';
import origamiImg from '../../public/images/styles/Origami.webp';
import paperCuttingImg from '../../public/images/styles/Paper_Cutting.webp';
import picassoImg from '../../public/images/styles/Picasso.webp';
import pixelImg from '../../public/images/styles/Pixel.webp';
import polyImg from '../../public/images/styles/Poly.webp';
import popArtImg from '../../public/images/styles/Pop_Art.webp';
import rickMortyImg from '../../public/images/styles/Rick_Morty.webp';
import snoopyImg from '../../public/images/styles/Snoopy.webp';
import vanGoghImg from '../../public/images/styles/Van_Gogh.webp';
import vectorImg from '../../public/images/styles/Vector.webp';
import wojakImg from '../../public/images/styles/Wojack.webp';
import plushieImg from '../../public/images/styles/Plushie.webp';

export interface StyleModel {
	id: string;
	name: string;
	imageSrc: StaticImageData;
	triggerWord: string;
	loraUrl: string;
}

export const styleModels: StyleModel[] = [
	{
		id: 'pixel',
		name: 'Pixel',
		imageSrc: pixelImg,
		triggerWord: 'Pixel style',
		loraUrl:
			'https://huggingface.co/Owen777/Kontext-Style-Loras/resolve/main/Pixel_lora_weights.safetensors',
	},
	{
		id: 'snoopy',
		name: 'Snoopy',
		imageSrc: snoopyImg,
		triggerWord: 'Snoopy style',
		loraUrl:
			'https://huggingface.co/Owen777/Kontext-Style-Loras/resolve/main/Snoopy_lora_weights.safetensors',
	},
	{
		id: 'jojo',
		name: 'JoJo',
		imageSrc: jojoImg,
		triggerWord: 'JoJo style',
		loraUrl:
			'https://huggingface.co/Owen777/Kontext-Style-Loras/resolve/main/Jojo_lora_weights.safetensors',
	},
	{
		id: 'clay',
		name: 'Clay',
		imageSrc: clayToyImg,
		triggerWord: 'Clay style',
		loraUrl:
			'https://huggingface.co/Owen777/Kontext-Style-Loras/resolve/main/Clay_Toy_lora_weights.safetensors',
	},
	{
		id: 'ghibli',
		name: 'Ghibli',
		imageSrc: ghibliImg,
		triggerWord: 'Ghibli style',
		loraUrl:
			'https://huggingface.co/Owen777/Kontext-Style-Loras/resolve/main/Ghibli_lora_weights.safetensors',
	},
	{
		id: 'americancartoon',
		name: 'American Cartoon',
		imageSrc: americanCartoonImg,
		triggerWord: 'American Cartoon style',
		loraUrl:
			'https://huggingface.co/Owen777/Kontext-Style-Loras/resolve/main/American_Cartoon_lora_weights.safetensors',
	},
	{
		id: 'lego',
		name: 'Lego',
		imageSrc: legoImg,
		triggerWord: 'Lego style',
		loraUrl:
			'https://huggingface.co/Owen777/Kontext-Style-Loras/resolve/main/LEGO_lora_weights.safetensors',
	},
	{
		id: '3d_chibi',
		name: '3D Chibi',
		imageSrc: chibi3DImg,
		triggerWord: '3D Chibi style',
		loraUrl:
			'https://huggingface.co/Owen777/Kontext-Style-Loras/resolve/main/3D_Chibi_lora_weights.safetensors',
	},
	{
		id: 'chinese_ink',
		name: 'Chinese Ink',
		imageSrc: chineseInkImg,
		triggerWord: 'Chinese Ink style',
		loraUrl:
			'https://huggingface.co/Owen777/Kontext-Style-Loras/resolve/main/Chinese_Ink_lora_weights.safetensors',
	},
	{
		id: 'fabric',
		name: 'Fabric',
		imageSrc: fabricImg,
		triggerWord: 'Fabric style',
		loraUrl:
			'https://huggingface.co/Owen777/Kontext-Style-Loras/resolve/main/Fabric_lora_weights.safetensors',
	},
	{
		id: 'irasutoya',
		name: 'Irasutoya',
		imageSrc: irasutoyaImg,
		triggerWord: 'Irasutoya style',
		loraUrl:
			'https://huggingface.co/Owen777/Kontext-Style-Loras/resolve/main/Irasutoya_lora_weights.safetensors',
	},
	{
		id: 'line',
		name: 'Line',
		imageSrc: lineImg,
		triggerWord: 'Line style',
		loraUrl:
			'https://huggingface.co/Owen777/Kontext-Style-Loras/resolve/main/Line_lora_weights.safetensors',
	},
	{
		id: 'macaron',
		name: 'Macaron',
		imageSrc: macaronImg,
		triggerWord: 'Macaron style',
		loraUrl:
			'https://huggingface.co/Owen777/Kontext-Style-Loras/resolve/main/Macaron_lora_weights.safetensors',
	},
	{
		id: 'oil_painting',
		name: 'Oil Painting',
		imageSrc: oilPaintingImg,
		triggerWord: 'Oil Painting style',
		loraUrl:
			'https://huggingface.co/Owen777/Kontext-Style-Loras/resolve/main/Oil_Painting_lora_weights.safetensors',
	},
	{
		id: 'origami',
		name: 'Origami',
		imageSrc: origamiImg,
		triggerWord: 'Origami style',
		loraUrl:
			'https://huggingface.co/Owen777/Kontext-Style-Loras/resolve/main/Origami_lora_weights.safetensors',
	},
	{
		id: 'paper_cutting',
		name: 'Paper Cutting',
		imageSrc: paperCuttingImg,
		triggerWord: 'Paper Cutting style',
		loraUrl:
			'https://huggingface.co/Owen777/Kontext-Style-Loras/resolve/main/Paper_Cutting_lora_weights.safetensors',
	},
	{
		id: 'picasso',
		name: 'Picasso',
		imageSrc: picassoImg,
		triggerWord: 'Picasso style',
		loraUrl:
			'https://huggingface.co/Owen777/Kontext-Style-Loras/resolve/main/Picasso_lora_weights.safetensors',
	},
	{
		id: 'poly',
		name: 'Poly',
		imageSrc: polyImg,
		triggerWord: 'Poly style',
		loraUrl:
			'https://huggingface.co/Owen777/Kontext-Style-Loras/resolve/main/Poly_lora_weights.safetensors',
	},
	{
		id: 'pop_art',
		name: 'Pop Art',
		imageSrc: popArtImg,
		triggerWord: 'Pop Art style',
		loraUrl:
			'https://huggingface.co/Owen777/Kontext-Style-Loras/resolve/main/Pop_Art_lora_weights.safetensors',
	},
	{
		id: 'rick_morty',
		name: 'Rick and Morty',
		imageSrc: rickMortyImg,
		triggerWord: 'Rick and Morty style',
		loraUrl:
			'https://huggingface.co/Owen777/Kontext-Style-Loras/resolve/main/Rick_Morty_lora_weights.safetensors',
	},
	{
		id: 'van_gogh',
		name: 'Van Gogh',
		imageSrc: vanGoghImg,
		triggerWord: 'Van Gogh style',
		loraUrl:
			'https://huggingface.co/Owen777/Kontext-Style-Loras/resolve/main/Van_Gogh_lora_weights.safetensors',
	},
	{
		id: 'vector',
		name: 'Vector',
		imageSrc: vectorImg,
		triggerWord: 'Vector style',
		loraUrl:
			'https://huggingface.co/Owen777/Kontext-Style-Loras/resolve/main/Vector_lora_weights.safetensors',
	},
	{
		id: 'plushie',
		name: 'Plushie',
		imageSrc: plushieImg,
		triggerWord: 'Plushie style',
		loraUrl:
			'https://huggingface.co/fal/Plushie-Kontext-Dev-LoRA/resolve/main/plushie-kontext-dev-lora.safetensors',
	},
	{
		id: 'wojak',
		name: 'Wojak',
		imageSrc: wojakImg,
		triggerWord: 'Wojak style',
		loraUrl:
			'https://huggingface.co/fal/Wojak-Kontext-Dev-LoRA/resolve/main/wojak-kontext-dev-lora.safetensors',
	},
];
