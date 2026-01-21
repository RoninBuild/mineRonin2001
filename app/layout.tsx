import type { Metadata } from 'next';
import './globals.css';
import { RootProvider } from '@/app/rootProvider';

const APP_URL =
  process.env.NEXT_PUBLIC_APP_URL ?? 'https://mine-ronin.vercel.app';

export const metadata: Metadata = {
  title: 'Mine Ronin',
  description: 'Minesweeper on Base',
  openGraph: {
    title: 'Mine Ronin',
    description: 'Play Minesweeper, earn rewards on Base',
    images: ['/og-image.png'],
  },
  other: {
    'fc:frame': 'vNext',
    'fc:frame:image': `${APP_URL}/og-image.png`,
    'fc:frame:button:1': 'Play Now',
    'fc:frame:button:1:action': 'link',
    'fc:frame:button:1:target': APP_URL,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <RootProvider>{children}</RootProvider>
      </body>
    </html>
  );
}
