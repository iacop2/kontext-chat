'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
	DialogDescription,
} from '@/components/ui/dialog';
import { VisuallyHidden } from '@radix-ui/react-visually-hidden';
import { KeyRound, X } from 'lucide-react';
import {
	getStoredApiKey,
	setStoredApiKey,
	removeStoredApiKey,
	validateApiKey,
} from '@/lib/api-key-storage';

export function ApiKeySettings() {
	const [apiKey, setApiKey] = useState('');
	const [tempApiKey, setTempApiKey] = useState('');
	const [isDialogOpen, setIsDialogOpen] = useState(false);
	const [isValidKey, setIsValidKey] = useState(false);

	useEffect(() => {
		const storedKey = getStoredApiKey();
		if (storedKey) {
			setApiKey(storedKey);
			setTempApiKey(storedKey);
			setIsValidKey(validateApiKey(storedKey));
		}
	}, []);

	const handleSaveApiKey = () => {
		if (tempApiKey.trim()) {
			const isValid = validateApiKey(tempApiKey.trim());
			if (isValid) {
				setStoredApiKey(tempApiKey.trim());
				setApiKey(tempApiKey.trim());
				setIsValidKey(true);
				setIsDialogOpen(false);
			}
		} else {
			removeStoredApiKey();
			setApiKey('');
			setIsValidKey(false);
			setIsDialogOpen(false);
		}
	};

	const handleClearApiKey = () => {
		setTempApiKey('');
		removeStoredApiKey();
		setApiKey('');
		setIsValidKey(false);
		setIsDialogOpen(false);
	};

	return (
		<Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
			<DialogTrigger asChild>
				<Button variant="secondary" size="sm" className="relative">
					<KeyRound className="h-4 w-4" />{' '}
					<span className="hidden sm:inline">API Key</span>
					{isValidKey && (
						<div className="absolute -right-1 -top-1 h-2 w-2 rounded-full bg-green-500" />
					)}
				</Button>
			</DialogTrigger>
			<DialogContent className="sm:max-w-md">
				<DialogHeader>
					<DialogTitle>API Key Settings</DialogTitle>
					<VisuallyHidden>
						<DialogDescription>
							Configure your FAL API key to remove rate limits
						</DialogDescription>
					</VisuallyHidden>
				</DialogHeader>
				<div className="space-y-4">
					<div>
						<p className="mb-2 text-sm text-muted-foreground">
							Add your FAL API key to remove rate limits and use your own quota.
						</p>
						<p className="text-xs text-muted-foreground">
							Get your API key from:{' '}
							<a
								href="https://fal.ai/dashboard/keys"
								target="_blank"
								rel="noopener noreferrer"
								className="underline"
							>
								fal.ai/dashboard/keys
							</a>
						</p>
					</div>
					<div className="space-y-2">
						<Input
							placeholder="Enter your FAL API key"
							value={tempApiKey}
							onChange={(e) => setTempApiKey(e.target.value)}
							className="font-mono text-sm"
						/>
						<div className="flex items-center space-x-2 text-xs">
							{tempApiKey && !validateApiKey(tempApiKey) && (
								<div className="flex items-center text-red-600">
									<X className="mr-1 h-3 w-3" />
									API key cannot be empty
								</div>
							)}
						</div>
					</div>
					<div className="flex justify-between">
						<Button
							variant="default"
							onClick={handleClearApiKey}
							disabled={!apiKey}
						>
							Clear
						</Button>
						<Button
							onClick={handleSaveApiKey}
							disabled={
								tempApiKey.trim() ? !validateApiKey(tempApiKey.trim()) : false
							}
						>
							Save
						</Button>
					</div>
				</div>
			</DialogContent>
		</Dialog>
	);
}
