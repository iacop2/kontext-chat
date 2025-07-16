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
  const hasAttachments = uploadState.previewUrl || uploadState.isUploading || styleState.selectedStyle;

  if (!hasAttachments) {
    return null;
  }

  return (
    <div className="absolute top-2 left-3 z-10 flex gap-2">
      {/* Image Preview */}
      {(uploadState.previewUrl || uploadState.isUploading) && (
        <div className="relative">
          {uploadState.isUploading ? (
            <div className="relative inline-block mb-2">
              <div className="relative w-20 h-20 bg-gray-200 rounded flex items-center justify-center">
                <div className="animate-spin rounded-full h-5 w-5 border-2 border-gray-400 border-t-gray-600"></div>
              </div>
              <div className="absolute bottom-1 left-1 bg-black/70 rounded p-0.5">
                <ImageIcon className="h-3.5 w-3.5 text-white" />
              </div>
            </div>
          ) : uploadState.previewUrl ? (
            <div className="relative inline-block mb-2">
              <div className="relative w-20 h-20">
                <img
                  src={uploadState.previewUrl}
                  alt={uploadState.fileName}
                  className="w-full h-full object-cover rounded"
                  key={uploadState.previewUrl}
                />
                <div className="absolute bottom-1 left-1 bg-black/70 rounded p-0.5">
                  <ImageIcon className="h-3.5 w-3.5 text-white" />
                </div>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={onRemoveUpload}
                  className="absolute top-1 right-1 h-5 w-5 p-0 rounded bg-white text-black hover:bg-gray-100 border-0"
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
          <div className="relative inline-block mb-2">
            <div className="relative w-20 h-20">
              <Image
                src={styleState.selectedStyle.imageSrc}
                alt={styleState.selectedStyle.name}
                className="w-full h-full object-cover rounded"
                key={styleState.selectedStyle.id}
                width={80}
                height={80}
              />
              <div className="absolute bottom-1 left-1 bg-black/70 rounded p-0.5">
                <Palette className="h-3.5 w-3.5 text-white" />
              </div>
              <Button
                variant="secondary"
                size="sm"
                onClick={onRemoveStyle}
                className="absolute top-1 right-1 h-5 w-5 p-0 rounded bg-white text-black hover:bg-gray-100 border-0"
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