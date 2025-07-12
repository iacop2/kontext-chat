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
    <div className="border-t bg-muted/30 p-4">
      <div className="max-w-3xl mx-auto">
        <Card className="max-w-sm">
          <CardContent className="p-3">
            <div className="flex items-center gap-3">
              {uploadState.isUploading ? (
                <div className="flex items-center gap-2">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                  <span className="text-sm">Uploading...</span>
                </div>
              ) : uploadState.previewUrl ? (
                <>
                  <img
                    src={uploadState.previewUrl}
                    alt={uploadState.fileName}
                    className="w-16 h-16 object-cover rounded"
                  />
                  <div className="flex-1">
                    <p className="text-sm font-medium">{uploadState.fileName}</p>
                    <p className="text-xs text-muted-foreground">Ready for editing</p>
                  </div>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={onRemove}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </>
              ) : null}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}