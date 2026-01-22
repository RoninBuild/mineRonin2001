'use client';

import { Wallet } from '@coinbase/onchainkit/wallet';
import { useAccount, useChainId } from 'wagmi';
import { base } from 'viem/chains';

export default function ConnectScreen() {
  const { isConnected } = useAccount();
  const chainId = useChainId();

  const isOnBase = chainId === base.id;

  return (
    <div className="relative z-10 flex min-h-[100dvh] w-full flex-col items-center justify-center gap-8 px-6 text-center">
      <div className="flex flex-col items-center gap-3">
        <img
          src="/logo-square.png"
          alt="Mine Ronin"
          width={96}
          height={96}
          className="rounded-2xl"
        />
        <h1 className="text-3xl font-bold text-blue-500">
          MINE RONIN
        </h1>
        <p className="text-sm text-gray-400">
          Minesweeper on Base
        </p>
      </div>

      {/* Основной коннект (OnchainKit) */}
      {!isConnected && (
        <div className="w-full max-w-sm">
          <Wallet />
        </div>
      )}

      {/* Подсказка, если подключён не туда */}
      {isConnected && !isOnBase && (
        <div className="mt-2 rounded-xl border border-yellow-500/40 bg-yellow-500/10 p-3 text-sm text-yellow-200">
          Please switch to Base Mainnet.
        </div>
      )}

      <div className="mt-2 text-xs text-gray-500">
        Base mainnet only
      </div>
    </div>
  );
}
