import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { StyleModel, styleModels } from '@/lib/models';

type StyleSelectionDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onStyleSelect: (style: StyleModel) => void;
};

export function StyleSelectionDialog({ open, onOpenChange, onStyleSelect }: StyleSelectionDialogProps) {
  const handleStyleClick = (style: StyleModel) => {
    onStyleSelect(style);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto scrollbar-hide">
        <DialogHeader>
          <DialogTitle>Choose a Style</DialogTitle>
        </DialogHeader>
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-4 p-2">
          {styleModels.map((style) => (
            <button
              key={style.id}
              onClick={() => handleStyleClick(style)}
              className="group relative overflow-hidden rounded border-2 border-transparent hover:border-primary transition-all duration-200 focus:outline-none focus:border-primary"
            >
              <div className="aspect-square overflow-hidden rounded">
                <img
                  src={style.imageSrc}
                  alt={style.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                />
              </div>
              <div className="absolute bottom-0 left-0 right-0 bg-black/70 text-white p-2 text-xs font-medium truncate">
                {style.name}
              </div>
            </button>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}