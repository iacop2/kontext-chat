'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Palette, Sparkles, Eye, Edit3 } from 'lucide-react';
import image_1 from '../../public/images/community/2.jpg';
import image_2 from '../../public/images/community/4.jpg';
import image_3 from '../../public/images/community/3.jpg';

interface ExampleCard {
	id: string;
	title: string;
	description: string;
	icon: React.ReactNode;
	prompt: string;
	realPrompt: string;
	imageUrl?: string;
	styleId?: string;
}

const devImageUrl_1 = `https://v3.fal.media/files/elephant/00rs5Nhmp2JZ0WSnGNdUM_1752483234655.jpeg`;
const devImageUrl_2 = `https://v3.fal.media/files/zebra/KLLnXEO7x2xMSzXZCfezX_1752490058499.jpeg`;
const devImageUrl_3 = `https://v3.fal.media/files/rabbit/MHnxLlqPjO3S4ukF_i3BK_1752490290906.jpeg`;

const examples: ExampleCard[] = [
	{
		id: 'style-transfer',
		title: 'Style Transfer',
		description: 'Apply styles to your images',
		prompt: 'Turn this image into pixel style',
		icon: <Palette className="h-6 w-6" />,
		realPrompt: 'Turn this image into pixel style',
		imageUrl:
			process.env.NODE_ENV === 'development' ? devImageUrl_1 : image_1.src,
		styleId: 'pixel',
	},
	{
		id: 'edit-image',
		title: 'Edit Image',
		description: 'Modify or enhance your images',
		icon: <Edit3 className="h-6 w-6" />,
		prompt: 'Remove all people in the background',
		realPrompt:
			'Eliminate all the people in the background while maintaining the facial features of the main subject. Keep the proportions and background unchanged. Naturally supplement and redraw the details of the removed areas to match the elements in the original image',
		imageUrl:
			process.env.NODE_ENV === 'development' ? devImageUrl_2 : image_2.src,
	},
	{
		id: 'describe-image',
		title: 'Describe Image',
		description: 'Get detailed image descriptions',
		icon: <Eye className="h-6 w-6" />,
		prompt: 'Describe this image in detail',
		realPrompt: 'Describe this image in detail',
		imageUrl:
			process.env.NODE_ENV === 'development' ? devImageUrl_3 : image_3.src,
	},
	{
		id: 'generate-image',
		title: 'Generate Image',
		description: 'Create images in a specific style',
		icon: <Sparkles className="h-6 w-6" />,
		prompt:
			'Generate a serene mountain landscape with a village in Ghibli style',
		realPrompt:
			'Generate a serene mountain landscape with a village in Ghibli style',
		styleId: 'ghibli',
	},
];

interface ExampleCardsProps {
	onExampleSelect: (
		prompt: string,
		imageUrl?: string,
		styleId?: string
	) => void;
}

export function ExampleCards({ onExampleSelect }: ExampleCardsProps) {
	return (
		<div className="mx-auto w-full max-w-3xl sm:p-6">
			<div className="grid grid-cols-2 gap-2 sm:gap-4">
				{examples.map((example) => (
					<Card
						key={example.id}
						className="border-stroke-base group cursor-pointer transition-all duration-200 hover:-translate-y-1 hover:shadow-lg"
						onClick={() =>
							onExampleSelect(
								example.realPrompt,
								example.imageUrl,
								example.styleId
							)
						}
					>
						<CardContent className="p-6">
							<div className="flex items-start space-x-4">
								<div
									className={`flex-shrink-0 rounded bg-primary p-3 text-primary-foreground hidden sm:block`}
								>
									{example.icon}
								</div>
								<div className="min-w-0 flex-1">
									<h3 className="text-content font-semibold transition-colors group-hover:text-primary">
										{example.title}
									</h3>
									<p className="text-content-lighter mb-3 mt-1 text-sm">
										{example.description}
									</p>
									<div className="bg-surface-secondary border-stroke-base rounded-md border p-3 hidden sm:block">
										<p className="text-content-lighter line-clamp-2 text-xs italic">
											"{example.prompt}"
										</p>
									</div>
								</div>
							</div>
						</CardContent>
					</Card>
				))}
			</div>
		</div>
	);
}
