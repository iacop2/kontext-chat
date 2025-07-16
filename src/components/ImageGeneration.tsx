import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, Image as ImageIcon, Loader2 } from 'lucide-react';
import { ImageComponent } from './ImageComponent';
import { ImageGenerationData } from '@/types/chat';

type ImageGenerationProps = {
  data: ImageGenerationData;
  onUseAsInput?: (imageUrl: string) => void;
};

export function ImageGeneration({ data, onUseAsInput }: ImageGenerationProps) {
  const { status, type, streamingImage, finalImage, error } = data;
  const isEdit = type === 'edit';

  // Show minimal spinner when starting
  if (status === 'starting' || status === 'queued') {
    return (
      <div className="mt-3 flex items-center gap-2 animate-pulse">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
        <span className="">
          {isEdit ? 'Starting edit...' : 'Starting generation...'}
        </span>
      </div>
    );
  }

  return (
    <Card className="mt-3">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <ImageIcon className="h-4 w-4" />
          <CardTitle className="text-sm flex items-center gap-2">
            {status === 'starting' || status === 'queued' ? (
              <>
                <Loader2 className="h-3 w-3 animate-spin text-primary" />
                {isEdit ? 'Starting edit...' : 'Starting generation...'}
              </>
            ) :
              status === 'generating' ?
                (isEdit ? 'Editing image...' : 'Generating image...') :
                status === 'uploading' ?
                  (isEdit ? 'Finalizing edit...' : 'Finalizing generation...') :
                  status === 'error' ?
                    (isEdit ? 'Edit failed' : 'Generation failed') :
                    (isEdit ? 'Edited image' : 'Generated image')}
          </CardTitle>
          <Badge variant="outline">
            {isEdit ? 'Edit' : 'Create'}
          </Badge>
          <Badge variant={
            status === 'starting' || status === 'queued' || status === 'generating' || status === 'uploading' ? 'default' :
              status === 'error' ? 'destructive' : 'default'}>
            {status === 'starting' || status === 'queued' ? 'Starting' :
              status === 'generating' ? 'In progress' :
                status === 'uploading' ? 'Finalizing' :
                  status === 'error' ? 'Error' :
                    'Complete'}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        {/* Show image during all phases for seamless transition */}
        {((status === 'generating' || status === 'uploading') && streamingImage) || (status === 'completed' && finalImage) ? (
          <div className="relative">
            <ImageComponent
              src={finalImage || streamingImage!}
              alt={status === 'completed' ? "Final generated image" : "Streaming generation"}
              showDownload={status === 'completed' || status === 'uploading'}
              onUseAsInput={status === 'completed' && finalImage ? () => onUseAsInput?.(finalImage) : undefined}
              showLoadingSpinner={status === 'generating'}
            />
          </div>
        ) : null}

        {/* Show error message */}
        {error && (
          <Alert variant="destructive" className="mt-3">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
}