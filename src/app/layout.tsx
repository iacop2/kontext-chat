import type { Metadata } from "next";
import "./globals.css";
import { focal } from "@/lib/fonts";
import { BotIdClient } from 'botid/client';
import { TooltipProvider } from "@/components/ui/tooltip";


const title = "kontext chat";
const description = "Create and edit images with a chat interface.";
export const metadata: Metadata = {
  title: {
    default: title,
    template: "%s | kontext chat",
  },
  description: description,
  keywords: [
    "AI style transfer",
    "image transformation",
    "flux model",
    "LoRA",
    "AI art",
    "fal.ai",
    "photo styling",
    "artificial intelligence",
    "machine learning",
    "image generation",
  ],
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
  ),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "/",
    title: title,
    description:
      description,
    siteName: title,
    images: [
      {
        url: "/og-image.jpg",
        alt: title,
        type: "image/jpeg",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: title,
    description:
      description,
    creator: "@fal_ai",
    site: "@fal_ai",
    images: [
      {
        url: "/og-image.jpg",
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
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
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
      className={[
        focal.variable,
      ].join(" ")}
      suppressHydrationWarning
    >
      <head>
        <meta name="color-scheme" content="dark" />
        <BotIdClient protect={[
          {
            path: '/api/fal',
            method: 'POST',
          },
        ]} />
      </head>
      <body className={`font-sans bg-background text-foreground min-h-screen`}>
        <TooltipProvider delayDuration={300}>
          {children}
        </TooltipProvider>
      </body>
    </html>
  );
}
