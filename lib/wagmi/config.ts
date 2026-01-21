import { createConfig, http } from 'wagmi';
import { coinbaseWallet, injected } from 'wagmi/connectors';
import { base } from 'viem/chains';

export const wagmiConfig = createConfig({
  chains: [base],
  transports: {
    [base.id]: http(),
  },
  connectors: [
    injected(),
    coinbaseWallet({
      appName: 'mineRonin2001',
    }),
  ],
  ssr: true,
});
