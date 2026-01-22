import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "@/components/providers/Providers";
import FarcasterReady from "@/components/FarcasterReady";

const APP_URL =
  process.env.NEXT_PUBLIC_APP_URL ?? "https://mine-ronin2001.vercel.app";

export const metadata: Metadata = {
  title: "Mine Ronin",
  description: "Minesweeper on Base",
  metadataBase: new URL(APP_URL),
  icons: {
    icon: "/head-base.png",
    apple: "/app-icon.png",
  },
  openGraph: {
    title: "Mine Ronin",
    description: "Play Minesweeper, earn rewards on Base",
    url: APP_URL,
    images: [
      {
        url: `${APP_URL}/logo-horizontal.png`,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Mine Ronin",
    description: "Play Minesweeper, earn rewards on Base",
    images: [`${APP_URL}/logo-horizontal.png`],
  },
  other: {
    // Важно: для мини-аппа лучше абсолютные урлы
    "fc:frame": "vNext",
    "fc:frame:image": `${APP_URL}/head-base.png`,
    "fc:frame:button:1": "Open Mine Ronin",
    // На корне оставим link (для шаринга лучше /share с launch_miniapp)
    "fc:frame:button:1:action": "link",
    "fc:frame:button:1:target": APP_URL,
  },
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="w-full min-h-[100dvh] bg-base-bg text-white antialiased">
        {/* КЛЮЧЕВО: чтобы Farcaster не висел на splash */}
        <FarcasterReady />
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
