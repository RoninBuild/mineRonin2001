'use client';

import { Wallet } from '@coinbase/onchainkit/wallet';
import { useAccount } from 'wagmi';
import { base } from 'wagmi/chains';

export default function ConnectScreen() {
  const { isConnected, chainId } = useAccount();

  const isOnBase = chainId === base.id;

  return (
    <div className="flex flex-col items-center justify-center h-full gap-8 px-6">
      <div className="text-center">
        <h1 className="text-5xl font-bold mb-4 text-blue-500">
          MINE RONIN
        </h1>
        <p className="text-gray-400">Minesweeper on Base</p>
      </div>

      <div className="flex w-full justify-center">
        <Wallet />
      </div>

      {isConnected && !isOnBase && (
        <p className="text-sm text-yellow-300 text-center">
          Switch to Base to continue.
        </p>
      )}

      <div className="text-xs text-gray-500 text-center">
        Base mainnet only
      </div>
    </div>
  );
}
