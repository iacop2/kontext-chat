import { StyleModel } from '@/lib/models';

export interface UploadState {
	previewUrl?: string;
	isUploading: boolean;
	fileName?: string;
	uploadedImage?: string;
	isExampleImage?: boolean;
	exampleImageUrl?: string;
}

export interface StyleState {
	selectedStyle?: StyleModel;
}

export interface Message {
	id: string;
	role: 'user' | 'assistant' | 'system';
	parts: MessagePart[];
}

export interface MessagePart {
	type: 'text' | 'file' | 'data-lora-selection' | string;
	text?: string;
	url?: string;
	filename?: string;
	mediaType?: string;
	data?:
		| {
				id: string;
				name: string;
				loraUrl: string;
				triggerWord: string;
		  }
		| unknown;
}

export interface ImageGenerationData {
	status: string;
	type: 'create' | 'edit';
	streamingImage?: string;
	finalImage?: string;
	error?: string;
	progress?: number;
	queuePosition?: number;
}

export type MessagePartData =
	| { type: 'text'; text: string }
	| { type: 'file'; url: string; filename?: string; mediaType?: string }
	| { type: 'data-image-generation'; data: ImageGenerationData }
	| { type: 'data-image-description'; data: { description: string } }
	| {
			type: 'data-lora-selection';
			data: { id: string; name: string; loraUrl: string; triggerWord: string };
	  };
