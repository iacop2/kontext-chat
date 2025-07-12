import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';

type UploadState = {
  isUploading: boolean;
  uploadedImage?: string;
  fileName?: string;
  previewUrl?: string;
};

type ImagePreviewProps = {
  uploadState: UploadState;
  onRemove: () => void;
};

export function ImagePreview({ uploadState, onRemove }: ImagePreviewProps) {
  if (!uploadState.previewUrl && !uploadState.isUploading) {
    return null;
  }

  return (
    <div className="p-4">
      <div className="max-w-3xl mx-auto">
        {uploadState.isUploading ? (
          <div className="flex items-center gap-2 mb-4">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-content"></div>
            <span className="text-sm text-content">Uploading...</span>
          </div>
        ) : uploadState.previewUrl ? (
          <div className="relative inline-block mb-4">
            <div className="relative w-16 h-16">
              <img
                src={uploadState.previewUrl}
                alt={uploadState.fileName}
                className="w-full h-full object-cover rounded-2xl"
              />
              <Button
                variant="secondary"
                size="sm"
                onClick={onRemove}
                className="absolute -top-2 -right-2 h-6 w-6 p-0 rounded-full bg-surface-secondary hover:bg-surface-tertiary border border-stroke-base"
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}