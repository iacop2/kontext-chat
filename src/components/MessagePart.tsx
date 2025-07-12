import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Image as ImageIcon } from 'lucide-react';
import { ImageGeneration } from './ImageGeneration';
import { ImageComponent } from './ImageComponent';

type MessagePartProps = {
  part: any;
  messageId: string;
  partIndex: number;
};

export function MessagePart({ part, messageId, partIndex }: MessagePartProps) {
  const key = `${messageId}-${partIndex}`;

  switch (part.type) {
    case 'text':
      return (
        <div key={key} className="prose prose-sm max-w-none">
          {part.text}
        </div>
      );

    case 'file':
      const isGeneratedImage = part.filename?.includes('generated-') || part.filename?.includes('edited-');
      const isEditedImage = part.filename?.includes('edited-');

      return (
        <div key={key}>
          <Card className="mt-3">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <ImageIcon className="h-4 w-4" />
                <CardTitle className="text-sm">
                  {isEditedImage ? 'Edited Image' :
                    isGeneratedImage ? 'Generated Image' :
                      'Uploaded Image'}
                </CardTitle>
                <Badge variant={
                  isEditedImage ? 'default' :
                    isGeneratedImage ? 'secondary' :
                      'outline'
                }>
                  {isEditedImage ? 'Edit' :
                    isGeneratedImage ? 'Generate' :
                      'Upload'}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <ImageComponent
                src={part.url}
                alt={part.filename || "Image"}
              />
            </CardContent>
          </Card>
        </div>
      );

    case 'data-image-generation':
      return (
        <div key={key}>
          <ImageGeneration data={part.data} />
        </div>
      );

    default:
      return null;
  }
}