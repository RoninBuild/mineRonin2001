'use client';

import { ConnectWallet } from '@coinbase/onchainkit/wallet';

export default function ConnectScreen() {
  return (
    <div className="flex flex-col items-center justify-center h-full gap-8 px-6">
      <div className="text-center">
        <h1 className="text-5xl font-bold mb-4 text-blue-500">
          MINE RONIN
        </h1>
        <p className="text-gray-400">Minesweeper on Base</p>
      </div>

      <ConnectWallet
        className="btn-primary"
        text="Connect Wallet"
      />

      <div className="text-xs text-gray-500 text-center">
        Base mainnet only
      </div>
    </div>
  );
}
