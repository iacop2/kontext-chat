import type { Metadata } from 'next';
import './globals.css';
import { focal } from '@/lib/fonts';
import { BotIdClient } from 'botid/client';
import { TooltipProvider } from '@/components/ui/tooltip';

const title = 'Kontext Chat - Edit Any Image By Chatting With AI';
const description = 'Chat with AI to create new images, edit existing ones, apply artistic styles, or ask questions about your images.';
const ogImage = '/images/og-image.jpg';
export const metadata: Metadata = {
	title: {
		default: title,
		template: '%s | Kontext Chat',
	},
	description: description,
	keywords: [
		'AI image generation',
		'AI image editing',
		'Flux Kontext',
		'LoRA',
		'FAL AI',
		'AI chatbot',
		'image style transfer',
		'AI art creation',
		'real-time streaming',
		'OpenAI GPT',
		'image transformation',
	],
	formatDetection: {
		email: false,
		address: false,
		telephone: false,
	},
	metadataBase: new URL(
		process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
	),
	alternates: {
		canonical: '/',
	},
	openGraph: {
		type: 'website',
		locale: 'en_US',
		url: '/',
		title: title,
		description: description,
		siteName: title,
		images: [
			{
				url: ogImage,
				alt: title,
				type: 'image/jpeg',
			},
		],
	},
	twitter: {
		card: 'summary_large_image',
		title: title,
		description: description,
		images: [
			{
				url: ogImage,
				alt: title,
			},
		],
	},
	robots: {
		index: true,
		follow: true,
		googleBot: {
			index: true,
			follow: true,
			'max-video-preview': -1,
			'max-image-preview': 'large',
			'max-snippet': -1,
		},
	},
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html
			lang="en"
			className={[focal.variable].join(' ')}
			suppressHydrationWarning
		>
			<head>
				<meta name="color-scheme" content="dark" />
				<BotIdClient
					protect={[
						{
							path: '/api/chat',
							method: 'POST',
						},
					]}
				/>
			</head>
			<body className={`min-h-screen bg-background font-sans text-foreground`}>
				<TooltipProvider delayDuration={300}>{children}</TooltipProvider>
			</body>
		</html>
	);
}
