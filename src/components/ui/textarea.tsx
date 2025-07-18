import * as React from 'react';

import { cn } from '@/lib/utils';

export interface TextareaProps
	extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
	({ className, ...props }, ref) => {
		return (
			<textarea
				className={cn(
					[
						'border-stroke-base bg-surface-alpha flex min-h-[80px] w-full rounded border px-3 py-2',
						'text-content placeholder:text-content-lighter text-sm',
						'focus-ring',
						'disabled:cursor-not-allowed disabled:opacity-50',
					],
					className
				)}
				ref={ref}
				{...props}
			/>
		);
	}
);
Textarea.displayName = 'Textarea';

export { Textarea };
