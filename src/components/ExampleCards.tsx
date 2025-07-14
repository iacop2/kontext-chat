'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Palette, Sparkles, Eye, Edit3 } from 'lucide-react';

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

const examples: ExampleCard[] = [
  {
    id: 'style-transfer',
    title: 'Style Transfer',
    description: 'Apply styles to your images',
    prompt: 'Turn this image into pixel style.',
    icon: <Palette className="h-6 w-6" />,
    realPrompt: '',
    imageUrl: `https://v3.fal.media/files/elephant/00rs5Nhmp2JZ0WSnGNdUM_1752483234655.jpeg`,
    styleId: 'pixel',
  },
  {
    id: 'edit-image',
    title: 'Edit Image',
    description: 'Modify and enhance images',
    icon: <Edit3 className="h-6 w-6" />,
    prompt: 'Remove all subjects in the background',
    realPrompt: 'Eliminate all the people in the background while maintaining the facial features of the main subject. Keep the proportions and background unchanged. Naturally supplement and redraw the details of the removed areas to match the elements in the original image',
    imageUrl: `https://v3.fal.media/files/zebra/KLLnXEO7x2xMSzXZCfezX_1752490058499.jpeg`,
  },
  {
    id: 'describe-image',
    title: 'Describe Image',
    description: 'Get detailed image descriptions',
    icon: <Eye className="h-6 w-6" />,
    prompt: 'Describe this image in detail',
    realPrompt: 'Describe this image in detail',
    imageUrl: `https://v3.fal.media/files/rabbit/MHnxLlqPjO3S4ukF_i3BK_1752490290906.jpeg`,
  },
  {
    id: 'generate-image',
    title: 'Generate Image',
    description: 'Create images with styles',
    icon: <Sparkles className="h-6 w-6" />,
    prompt: 'Generate a serene mountain landscape in Ghibli style',
    realPrompt: 'Generate a serene mountain landscape in Ghibli style',
    styleId: 'ghibli',
  },
];

interface ExampleCardsProps {
  onExampleSelect: (prompt: string, imageUrl?: string, styleId?: string) => void;
}

export function ExampleCards({ onExampleSelect }: ExampleCardsProps) {
  return (
    <div className="w-full max-w-3xl mx-auto p-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {examples.map((example) => (
          <Card
            key={example.id}
            className="group cursor-pointer transition-all duration-200 hover:shadow-lg hover:-translate-y-1 border-stroke-base"
            onClick={() => onExampleSelect(example.realPrompt, example.imageUrl, example.styleId)}
          >
            <CardContent className="p-6">
              <div className="flex items-start space-x-4">
                <div className={`p-3 rounded bg-primary text-primary-foreground flex-shrink-0`}>
                  {example.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-content group-hover:text-primary transition-colors">
                    {example.title}
                  </h3>
                  <p className="text-sm text-content-lighter mt-1 mb-3">
                    {example.description}
                  </p>
                  <div className="bg-surface-secondary rounded-md p-3 border border-stroke-base">
                    <p className="text-xs text-content-lighter italic line-clamp-2">
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