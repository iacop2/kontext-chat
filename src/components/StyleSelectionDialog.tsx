import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogDescription,
} from '@/components/ui/dialog';
import { VisuallyHidden } from '@radix-ui/react-visually-hidden';
import { StyleModel, styleModels } from '@/lib/models';
import Image from 'next/image';

type StyleSelectionDialogProps = {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	onStyleSelect: (style: StyleModel) => void;
};

export function StyleSelectionDialog({
	open,
	onOpenChange,
	onStyleSelect,
}: StyleSelectionDialogProps) {
	const handleStyleClick = (style: StyleModel) => {
		onStyleSelect(style);
		onOpenChange(false);
	};

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="scrollbar-hide max-h-[90vh] max-w-4xl overflow-y-auto">
				<DialogHeader>
					<DialogTitle>Choose a Style</DialogTitle>
					<VisuallyHidden>
						<DialogDescription>
							Select a style to apply to your image
						</DialogDescription>
					</VisuallyHidden>
				</DialogHeader>
				<div className="grid grid-cols-2 gap-4 p-2 sm:grid-cols-4 lg:grid-cols-5">
					{styleModels.map((style) => (
						<button
							key={style.id}
							onClick={() => handleStyleClick(style)}
							className="group relative overflow-hidden rounded border-2 border-transparent transition-all duration-200 hover:border-primary focus:border-primary focus:outline-none"
						>
							<div className="aspect-square overflow-hidden rounded">
								<Image
									src={style.imageSrc}
									alt={style.name}
									className="h-full w-full object-cover transition-transform duration-200 group-hover:scale-105"
								/>
							</div>
							<div className="absolute bottom-0 left-0 right-0 truncate bg-black/70 p-2 text-xs font-medium text-white">
								{style.name}
							</div>
						</button>
					))}
				</div>
			</DialogContent>
		</Dialog>
	);
}
