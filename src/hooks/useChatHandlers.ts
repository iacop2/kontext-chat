import { useCallback } from 'react';
import { styleModels, StyleModel } from '@/lib/models';
import { UploadState, StyleState, MessagePart } from '@/types/chat';

// Constants
const TEXTAREA_FOCUS_DELAY = 0;
const DEFAULT_EXAMPLE_FILENAME = 'example-image.jpg';
const DEFAULT_UPLOADED_FILENAME = 'uploaded-image';
const DEFAULT_GENERATED_FILENAME = 'generated-image.jpg';
const DEFAULT_MEDIA_TYPE = 'image/jpeg';

interface UseChatHandlersProps {
	input: string;
	setInput: (value: string) => void;
	sendMessage: (message: any) => void;
	uploadState: UploadState;
	styleState: StyleState;
	handleRemoveUpload: () => void;
	handleStyleRemove: () => void;
	handleExampleImage: (imageUrl: string, fileName: string) => void;
	handleStyleSelect: (style: StyleModel) => void;
	textareaRef: React.RefObject<HTMLTextAreaElement | null>;
}

export function useChatHandlers({
	input,
	setInput,
	sendMessage,
	uploadState,
	styleState,
	handleRemoveUpload,
	handleStyleRemove,
	handleExampleImage,
	handleStyleSelect,
	textareaRef,
}: UseChatHandlersProps) {
	const handleSubmit = useCallback(
		(e: React.FormEvent) => {
			e.preventDefault();

			// Prepare message parts
			const parts: MessagePart[] = [];

			// Add uploaded image if present
			if (uploadState.isExampleImage && uploadState.exampleImageUrl) {
				const url =
					process.env.NODE_ENV === 'development'
						? uploadState.exampleImageUrl
						: window.location.origin + uploadState.exampleImageUrl;
				parts.push({
					type: 'file' as const,
					url: url,
					filename: uploadState.fileName || DEFAULT_EXAMPLE_FILENAME,
					mediaType: DEFAULT_MEDIA_TYPE,
				});
			} else if (uploadState.uploadedImage) {
				parts.push({
					type: 'file' as const,
					url: uploadState.uploadedImage,
					filename: uploadState.fileName || DEFAULT_UPLOADED_FILENAME,
					mediaType: DEFAULT_MEDIA_TYPE,
				});
			}

			// Add LoRA selection as data part if style is selected
			if (styleState.selectedStyle) {
				parts.push({
					type: 'data-lora-selection' as const,
					data: {
						id: styleState.selectedStyle.id,
						name: styleState.selectedStyle.name,
						loraUrl: styleState.selectedStyle.loraUrl,
						triggerWord: styleState.selectedStyle.triggerWord,
					},
				});
			}

			// Add text content (even if empty when style is selected)
			parts.push({
				type: 'text',
				text: input || '',
			});

			if (parts.length > 1) {
				sendMessage({
					role: 'user',
					parts,
				});
			} else {
				sendMessage({ text: input });
			}
			setInput('');

			// Clear upload state and style after sending
			if (uploadState.uploadedImage || uploadState.previewUrl) {
				handleRemoveUpload();
			}
			if (styleState.selectedStyle) {
				handleStyleRemove();
			}
		},
		[
			input,
			sendMessage,
			uploadState,
			styleState,
			handleRemoveUpload,
			handleStyleRemove,
			setInput,
		]
	);

	const handleExampleSelect = useCallback(
		(prompt: string, imageUrl?: string, styleId?: string) => {
			// Reset previous inputs first
			setInput('');
			handleRemoveUpload();
			handleStyleRemove();

			// Set new example data
			setInput(prompt);

			// If there's an image URL, load it using the new function
			if (imageUrl) {
				handleExampleImage(imageUrl, DEFAULT_EXAMPLE_FILENAME);
			}

			// If there's a style ID, select the corresponding style
			if (styleId) {
				const style = styleModels.find((s) => s.id === styleId);
				if (style) {
					handleStyleSelect(style);
				}
			}

			// Focus the textarea and scroll to it after setting the input
			setTimeout(() => {
				if (textareaRef.current) {
					textareaRef.current.focus();
					textareaRef.current.scrollIntoView({
						behavior: 'smooth',
						block: 'center',
					});
				}
			}, TEXTAREA_FOCUS_DELAY);
		},
		[
			setInput,
			handleRemoveUpload,
			handleStyleRemove,
			handleExampleImage,
			handleStyleSelect,
			textareaRef,
		]
	);

	const handleUseImageAsInput = useCallback(
		(imageUrl: string) => {
			// Clear current upload state and set the new image
			handleRemoveUpload();
			handleExampleImage(imageUrl, DEFAULT_GENERATED_FILENAME);
		},
		[handleRemoveUpload, handleExampleImage]
	);

	return {
		handleSubmit,
		handleExampleSelect,
		handleUseImageAsInput,
	};
}
