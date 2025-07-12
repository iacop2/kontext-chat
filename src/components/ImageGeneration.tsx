import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertCircle, Image as ImageIcon } from 'lucide-react';
import { ImageComponent } from './ImageComponent';

type ImageGenerationData = {
  status: string;
  type: 'create' | 'edit';
  streamingImage?: string;
  finalImage?: string;
  error?: string;
  progress?: number;
  queuePosition?: number;
};

type ImageGenerationProps = {
  data: ImageGenerationData;
};

export function ImageGeneration({ data }: ImageGenerationProps) {
  const { status, type, streamingImage, finalImage, error, progress, queuePosition } = data;
  const isEdit = type === 'edit';

  return (
    <Card className="mt-3">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <ImageIcon className="h-4 w-4" />
          <CardTitle className="text-sm">
            {status === 'starting' ?
              (isEdit ? 'Starting edit...' : 'Starting generation...') :
              status === 'queued' ?
                (isEdit ? 'Edit queued...' : 'Generation queued...') :
                status === 'generating' ?
                  (isEdit ? 'Editing image...' : 'Generating image...') :
                  status === 'error' ?
                    (isEdit ? 'Edit failed' : 'Generation failed') :
                    (isEdit ? 'Edited image' : 'Generated image')}
          </CardTitle>
          <Badge variant={isEdit ? 'outline' : 'default'}>
            {isEdit ? 'Edit' : 'Generate'}
          </Badge>
          <Badge variant={
            status === 'starting' || status === 'queued' || status === 'generating' ? 'secondary' :
              status === 'error' ? 'destructive' : 'default'}>
            {status === 'starting' ? 'Starting' :
              status === 'queued' ? 'Queued' :
                status === 'generating' ? 'In progress' :
                  status === 'error' ? 'Error' :
                    'Complete'}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        {/* Show queue position */}
        {status === 'queued' && queuePosition && (
          <div className="mb-4">
            <p className="text-sm text-muted-foreground">Queue position: {queuePosition}</p>
          </div>
        )}

        {/* Show progress */}
        {status === 'generating' && progress && (
          <div className="mb-4">
            <p className="text-sm text-muted-foreground mb-2">Progress: {Math.round(progress * 100)}%</p>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${progress * 100}%` }}
              ></div>
            </div>
          </div>
        )}

        {/* Show streaming image during generation */}
        {status === 'generating' && streamingImage && (
          <div className="relative">
            <img
              src={streamingImage}
              alt="Streaming generation"
              className="w-full h-auto max-h-96 object-contain rounded-md border"
            />
            <Badge className="absolute top-2 right-2" variant="secondary">
              Streaming
            </Badge>
          </div>
        )}

        {/* Show final image when completed */}
        {status === 'completed' && finalImage && (
          <div className="relative">
            <ImageComponent
              src={finalImage}
              alt="Final generated image"
            />
          </div>
        )}

        {/* Show loading skeleton during creation without image */}
        {(status === 'starting' || status === 'queued' || (status === 'generating' && !streamingImage)) && (
          <Skeleton className="w-full h-48 rounded-md" />
        )}

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