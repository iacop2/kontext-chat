import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ArrowUp, Image as ImageIcon, Palette } from 'lucide-react';
import { AttachmentPreview } from './AttachmentPreview';
import { UploadState, StyleState } from '@/types/chat';

interface ChatInputProps {
	input: string;
	onInputChange: (value: string) => void;
	onSubmit: (e: React.FormEvent) => void;
	uploadState: UploadState;
	styleState: StyleState;
	onFileUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
	onRemoveUpload: () => void;
	onRemoveStyle: () => void;
	onOpenStyleDialog: () => void;
	fileInputRef: React.RefObject<HTMLInputElement | null>;
	textareaRef?: React.RefObject<HTMLTextAreaElement | null>;
	isSubmitting: boolean;
}

export function ChatInput({
	input,
	onInputChange,
	onSubmit,
	uploadState,
	styleState,
	onFileUpload,
	onRemoveUpload,
	onRemoveStyle,
	onOpenStyleDialog,
	fileInputRef,
	textareaRef: externalTextareaRef,
	isSubmitting,
}: ChatInputProps) {
	const internalTextareaRef = useRef<HTMLTextAreaElement>(null);
	const textareaRef = externalTextareaRef || internalTextareaRef;

	const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
		if (e.key === 'Enter' && !e.shiftKey) {
			e.preventDefault();
			if (
				(input.trim() || styleState.selectedStyle) &&
				!isSubmitting &&
				!uploadState.isUploading
			) {
				onSubmit(e as any);
			}
		}
	};

	const autoResize = () => {
		if (textareaRef.current) {
			textareaRef.current.style.height = 'auto';
			textareaRef.current.style.height =
				textareaRef.current.scrollHeight + 'px';
		}
	};

	useEffect(() => {
		autoResize();
	}, [
		uploadState.previewUrl,
		uploadState.isUploading,
		styleState.selectedStyle,
	]);

	const hasAttachments =
		uploadState.previewUrl ||
		uploadState.isUploading ||
		styleState.selectedStyle;

	return (
		<div className="p-4">
			<form onSubmit={onSubmit} className="mx-auto max-w-3xl">
				<div className="relative w-full">
					<input
						type="file"
						accept="image/*"
						onChange={onFileUpload}
						className="hidden"
						ref={fileInputRef}
					/>

					<AttachmentPreview
						uploadState={uploadState}
						styleState={styleState}
						onRemoveUpload={onRemoveUpload}
						onRemoveStyle={onRemoveStyle}
					/>

					<Textarea
						ref={textareaRef}
						value={input}
						onChange={(e) => {
							onInputChange(e.target.value);
							autoResize();
						}}
						onKeyDown={handleKeyDown}
						placeholder="Upload an image to edit, or describe what you'd like to create"
						className={`border-stroke-base text-content placeholder:text-content-lighter w-full resize-none rounded border bg-background px-3 text-sm focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ${
							hasAttachments
								? 'min-h-[100px] pb-10 pt-28'
								: 'min-h-[48px] py-2 pb-10'
						}`}
						style={{
							height: 'auto',
							overflow: 'hidden',
						}}
					/>

					<div className="absolute bottom-0 left-0 flex gap-2 p-2">
						<Button
							type="button"
							variant="secondary"
							size="sm"
							className="text-content-lighter hover:text-content hover:bg-surface-secondary flex h-fit w-fit items-center gap-1 rounded border-0 bg-transparent px-2 py-1.5"
							onClick={() => fileInputRef.current?.click()}
							disabled={uploadState.isUploading}
						>
							<ImageIcon className="h-3.5 w-3.5" />
							<span className="text-xs">Image</span>
						</Button>
						<Button
							type="button"
							variant="secondary"
							size="sm"
							className="text-content-lighter hover:text-content hover:bg-surface-secondary flex h-fit w-fit items-center gap-1 rounded border-0 bg-transparent px-2 py-1.5"
							onClick={onOpenStyleDialog}
						>
							<Palette className="h-3.5 w-3.5" />
							<span className="text-xs">Style</span>
						</Button>
					</div>

					<div className="absolute bottom-0 right-0 p-2">
						<Button
							type="submit"
							size="sm"
							className="h-fit w-fit rounded border bg-primary p-1.5 text-primary-foreground hover:bg-primary/90"
							disabled={
								(!input.trim() && !styleState.selectedStyle) ||
								isSubmitting ||
								uploadState.isUploading
							}
						>
							<ArrowUp className="h-3.5 w-3.5" />
						</Button>
					</div>
				</div>
			</form>
		</div>
	);
}
