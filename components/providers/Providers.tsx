'use client';

import { ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { WagmiProvider } from 'wagmi';
import { http, createConfig } from 'wagmi';
import { base } from 'viem/chains';
import { coinbaseWallet } from 'wagmi/connectors/coinbaseWallet';
import { injected } from 'wagmi/connectors/injected';

const config = createConfig({
  chains: [base],
  transports: {
    [base.id]: http(),
  },
  connectors: [
    injected(),
    coinbaseWallet({
      appName: 'Mine Ronin',
    }),
  ],
  ssr: true,
});

const queryClient = new QueryClient();

export function Providers({ children }: { children: ReactNode }) {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    </WagmiProvider>
  );
}
