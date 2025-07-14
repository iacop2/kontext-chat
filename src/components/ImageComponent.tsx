import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogTrigger, DialogTitle } from '@/components/ui/dialog';
import { VisuallyHidden } from '@radix-ui/react-visually-hidden';
import { Download, ArrowLeftRight } from 'lucide-react';

type ImageComponentProps = {
  src: string;
  alt: string;
  className?: string;
  showControls?: boolean;
  showDownload?: boolean;
  onUseAsInput?: () => void;
};

export function ImageComponent({ src, alt, className = '', showControls = true, showDownload = true, onUseAsInput }: ImageComponentProps) {
  const [isOpen, setIsOpen] = useState(false);

  const handleDownload = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const response = await fetch(src);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = alt || 'image';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Download failed:', error);
    }
  };

  const handleUseAsInput = (e: React.MouseEvent) => {
    e.stopPropagation();
    onUseAsInput?.();
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <div className="flex justify-center">
        <div className="relative group inline-block">
          <DialogTrigger asChild>
            <div className={`cursor-pointer transition-opacity hover:opacity-90 ${className}`}>
              <img
                src={src}
                alt={alt}
                className="w-full h-auto max-h-96 object-contain rounded-md border"
              />
            </div>
          </DialogTrigger>

          {showControls && (
            <div className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <div className="flex gap-2">
                {onUseAsInput && (
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={handleUseAsInput}
                    className="bg-black/50 hover:bg-black/70 text-white border-0 backdrop-blur-sm"
                  >
                    <ArrowLeftRight className="h-4 w-4" />
                  </Button>
                )}
                {showDownload && (
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={handleDownload}
                    className="bg-black/50 hover:bg-black/70 text-white border-0 backdrop-blur-sm"
                  >
                    <Download className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      <DialogContent className="p-0 border-0 bg-transparent shadow-none max-w-none max-h-none w-fit h-fit">
        <VisuallyHidden>
          <DialogTitle>Full Size Image: {alt}</DialogTitle>
        </VisuallyHidden>
        <div className="relative inline-block">
          <img
            src={src}
            alt={alt}
            className="max-w-[95vw] max-h-[95vh] object-contain rounded-md"
          />
          <div className="absolute bottom-4 right-4">
            <div className="flex gap-2">
              {onUseAsInput && (
                <Button
                  onClick={handleUseAsInput}
                  className="bg-black/50 hover:bg-black/70 text-white border-0 backdrop-blur-sm"
                >
                  <ArrowLeftRight className="h-4 w-4" />
                </Button>
              )}
              {showDownload && (
                <Button
                  onClick={handleDownload}
                  className="bg-black/50 hover:bg-black/70 text-white border-0 backdrop-blur-sm"
                >
                  <Download className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}