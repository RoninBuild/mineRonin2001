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
    images: [{ url: `${APP_URL}/logo-horizontal.png` }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Mine Ronin",
    description: "Play Minesweeper, earn rewards on Base",
    images: [`${APP_URL}/logo-horizontal.png`],
  },
  other: {
    "fc:frame": "vNext",
    "fc:frame:image": `${APP_URL}/head-base.png`,
    "fc:frame:button:1": "Open Mine Ronin",
    "fc:frame:button:1:action": "link",
    "fc:frame:button:1:target": APP_URL,
    "base:app_id": "697272f33a92926b661fd093",
  },
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="stylesheet" href="/onchainkit.css" />
      </head>
      <body
        className={[
          "w-full min-h-[100dvh] bg-base-bg text-white antialiased",
          // мобильные webview: убираем жесты, которые могут глушить тапы
          "overscroll-none",
          // иногда помогает с кликабельностью и быстрыми тапами
          "touch-manipulation",
        ].join(" ")}
      >
        {/* КЛЮЧЕВО: чтобы Farcaster не висел на splash */}
        <FarcasterReady />
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
