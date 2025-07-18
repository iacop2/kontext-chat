import { Button } from '@/components/ui/button';
import { X, Image as ImageIcon, Palette } from 'lucide-react';
import Image from 'next/image';
import { UploadState, StyleState } from '@/types/chat';

interface AttachmentPreviewProps {
	uploadState: UploadState;
	styleState: StyleState;
	onRemoveUpload: () => void;
	onRemoveStyle: () => void;
}

export function AttachmentPreview({
	uploadState,
	styleState,
	onRemoveUpload,
	onRemoveStyle,
}: AttachmentPreviewProps) {
	const hasAttachments =
		uploadState.previewUrl ||
		uploadState.isUploading ||
		styleState.selectedStyle;

	if (!hasAttachments) {
		return null;
	}

	return (
		<div className="absolute left-3 top-2 z-10 flex gap-2">
			{/* Image Preview */}
			{(uploadState.previewUrl || uploadState.isUploading) && (
				<div className="relative">
					{uploadState.isUploading ? (
						<div className="relative mb-2 inline-block">
							<div className="relative flex h-20 w-20 items-center justify-center rounded bg-gray-200">
								<div className="h-5 w-5 animate-spin rounded-full border-2 border-gray-400 border-t-gray-600"></div>
							</div>
							<div className="absolute bottom-1 left-1 rounded bg-black/70 p-0.5">
								<ImageIcon className="h-3.5 w-3.5 text-white" />
							</div>
						</div>
					) : uploadState.previewUrl ? (
						<div className="relative mb-2 inline-block">
							<div className="relative h-20 w-20">
								<img
									src={uploadState.previewUrl}
									alt={uploadState.fileName}
									className="h-full w-full rounded object-cover"
									key={uploadState.previewUrl}
								/>
								<div className="absolute bottom-1 left-1 rounded bg-black/70 p-0.5">
									<ImageIcon className="h-3.5 w-3.5 text-white" />
								</div>
								<Button
									variant="secondary"
									size="sm"
									onClick={onRemoveUpload}
									className="absolute right-1 top-1 h-5 w-5 rounded border-0 bg-white p-0 text-black hover:bg-gray-100"
								>
									<X className="h-3 w-3" />
								</Button>
							</div>
						</div>
					) : null}
				</div>
			)}

			{/* Style Preview */}
			{styleState.selectedStyle && (
				<div className="relative">
					<div className="relative mb-2 inline-block">
						<div className="relative h-20 w-20">
							<Image
								src={styleState.selectedStyle.imageSrc}
								alt={styleState.selectedStyle.name}
								className="h-full w-full rounded object-cover"
								key={styleState.selectedStyle.id}
								width={80}
								height={80}
							/>
							<div className="absolute bottom-1 left-1 rounded bg-black/70 p-0.5">
								<Palette className="h-3.5 w-3.5 text-white" />
							</div>
							<Button
								variant="secondary"
								size="sm"
								onClick={onRemoveStyle}
								className="absolute right-1 top-1 h-5 w-5 rounded border-0 bg-white p-0 text-black hover:bg-gray-100"
							>
								<X className="h-3 w-3" />
							</Button>
						</div>
					</div>
				</div>
			)}
		</div>
	);
}
