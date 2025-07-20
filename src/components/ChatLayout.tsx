import { useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ChatHeader } from '@/components/ChatHeader';
import { ChatMessage } from '@/components/ChatMessage';
import { ExampleCards } from '@/components/ExampleCards';

interface ChatLayoutProps {
	messages: any[];
	error: any;
	rateLimitInfo?: any;
	apiKey?: string | null;
	onExampleSelect: (
		prompt: string,
		imageUrl?: string,
		styleId?: string
	) => void;
	onUseImageAsInput: (imageUrl: string) => void;
	onRetry: () => void;
	children: React.ReactNode;
}

export function ChatLayout({
	messages,
	error,
	rateLimitInfo,
	apiKey,
	onExampleSelect,
	onUseImageAsInput,
	onRetry,
	children,
}: ChatLayoutProps) {
	const messagesEndRef = useRef<HTMLDivElement>(null);

	const scrollToBottom = () => {
		messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
	};

	useEffect(() => {
		scrollToBottom();
	}, [messages]);

	return (
		<div className="flex min-h-screen flex-col bg-background pb-6">
			<ChatHeader />

			<div className="flex flex-1 flex-col">
				{messages.length === 0 ? (
					<div className="flex flex-1 items-center justify-center p-4">
						<ExampleCards onExampleSelect={onExampleSelect} />
					</div>
				) : (
					<ScrollArea className="flex-1">
						<div className="mx-auto max-w-3xl space-y-4 p-4">
							{messages.map((message) => (
								<ChatMessage
									key={message.id}
									message={message}
									onUseAsInput={onUseImageAsInput}
								/>
							))}

							{/* Rate Limit or API Key Error Display */}
							{rateLimitInfo && (
								<div
									className={`${rateLimitInfo.type === 'api_key_invalid' ? 'border-red-200 bg-red-50' : 'border-yellow-200 bg-yellow-50'} rounded-md border p-4`}
								>
									<div className="flex items-start">
										<div className="flex-shrink-0">
											<svg
												className={`h-5 w-5 ${rateLimitInfo.type === 'api_key_invalid' ? 'text-red-400' : 'text-yellow-400'}`}
												viewBox="0 0 20 20"
												fill="currentColor"
											>
												<path
													fillRule="evenodd"
													d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.345 0-2.189-1.458-1.515-2.625L8.485 2.495zM10 5a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5A.75.75 0 0110 5zm0 9a1 1 0 100-2 1 1 0 000 2z"
													clipRule="evenodd"
												/>
											</svg>
										</div>
										<div className="ml-3 flex-1">
											<div className="flex items-center justify-between">
												<div>
													<h4
														className={`text-sm font-medium ${rateLimitInfo.type === 'api_key_invalid' ? 'text-red-800' : 'text-yellow-800'}`}
													>
														{rateLimitInfo.type === 'api_key_invalid'
															? 'Invalid API Key'
															: 'Rate limit reached'}
													</h4>
													<p
														className={`mt-1 text-sm ${rateLimitInfo.type === 'api_key_invalid' ? 'text-red-700' : 'text-yellow-700'}`}
													>
														{rateLimitInfo.type === 'api_key_invalid'
															? 'The provided FAL API key is invalid. Please check your API key and try again.'
															: 'Free request limit exceeded. Add your FAL API key in settings to continue without rate limits.'}
													</p>
												</div>
											</div>
										</div>
									</div>
								</div>
							)}

							{/* Error Display */}
							{error && !rateLimitInfo && (
								<div className="rounded-md border border-destructive/20 bg-destructive/10 p-4">
									<div className="flex items-center justify-between">
										<div>
											<h4 className="text-sm font-medium text-destructive">
												Something went wrong
											</h4>
											<p className="mt-1 text-sm text-destructive/80">
												Please try again. If the issue persists, try refreshing
												the page.
											</p>
										</div>
										<Button
											size="sm"
											onClick={onRetry}
											className="border-destructive/20 text-destructive hover:bg-destructive/10"
										>
											Retry
										</Button>
									</div>
								</div>
							)}

							<div ref={messagesEndRef} />
						</div>
					</ScrollArea>
				)}
			</div>

			{children}
		</div>
	);
}
