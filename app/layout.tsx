import type { Metadata } from 'next';
import { Oxanium } from 'next/font/google';
import './globals.css';
import { Providers } from '@/components/providers/Providers';

const APP_URL =
  process.env.NEXT_PUBLIC_APP_URL ?? 'https://mine-ronin.vercel.app';

export const metadata: Metadata = {
  title: 'Mine Ronin',
  description: 'Minesweeper on Base',
  icons: {
    icon: '/head-base.png',
    apple: '/app-icon.png',
  },
  openGraph: {
    title: 'Mine Ronin',
    description: 'Play Minesweeper, earn rewards on Base',
    images: ['/logo-horizontal.png'],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Mine Ronin',
    description: 'Play Minesweeper, earn rewards on Base',
    images: ['/logo-horizontal.png'],
  },
  other: {
    'fc:frame': 'vNext',
    'fc:frame:image': `${APP_URL}/og-image.png`,
    'fc:frame:button:1': 'Play Now',
    'fc:frame:button:1:action': 'link',
    'fc:frame:button:1:target': APP_URL,
  },
};

const oxanium = Oxanium({
  subsets: ['latin'],
  display: 'swap',
});

export const viewport = {
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={oxanium.className}>
      <body className="w-full min-h-[100dvh] bg-base-bg text-white antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
