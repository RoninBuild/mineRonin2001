'use client';

import { ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { OnchainKitProvider } from '@coinbase/onchainkit';
import { WagmiProvider } from 'wagmi';
import { createConfig, http } from 'wagmi';
import { base } from 'wagmi/chains';
import { coinbaseWallet } from '@wagmi/connectors/coinbaseWallet';
import { injected } from '@wagmi/connectors/injected';
import '@coinbase/onchainkit/styles.css';

const apiKey = process.env.NEXT_PUBLIC_ONCHAINKIT_API_KEY;
if (!apiKey) {
  throw new Error('NEXT_PUBLIC_ONCHAINKIT_API_KEY is required');
}

const queryClient = new QueryClient();
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

export function RootProvider({ children }: { children: ReactNode }) {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <OnchainKitProvider
          apiKey={apiKey}
          chain={base}
        >
          {children}
        </OnchainKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
