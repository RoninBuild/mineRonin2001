'use client';

import { useMemo } from 'react';
import { useAccount, useConnect, useDisconnect } from 'wagmi';
import { base } from 'viem/chains';

export default function ConnectScreen() {
  const { isConnected, chainId } = useAccount();
  const { connectors, connect, isPending } = useConnect();
  const { disconnect } = useDisconnect();

  const isOnBase = chainId === base.id;
  const connectOptions = useMemo(
    () =>
      connectors.map((connector) => ({
        id: connector.id,
        name: connector.name,
        ready: connector.ready ?? true,
        onClick: () => connect({ connector }),
      })),
    [connectors, connect],
  );

  return (
      <div className="relative z-10 flex flex-col items-center justify-center h-full gap-8 px-6">
      <div className="text-center">
        <h1 className="text-5xl font-bold mb-4 text-blue-500">
          MINE RONIN
        </h1>
        <p className="text-gray-400">Minesweeper on Base</p>
      </div>

      {!isConnected && (
        <div className="flex w-full flex-col gap-3">
          {connectOptions.map((connector) => {
            const canConnect = connector.ready && !isPending;

            return (
              <button
                key={connector.id}
                type="button"
                className="btn-primary w-full"
                onClick={() => {
                  if (!canConnect) return;
                  connector.onClick();
                }}
                disabled={!canConnect}
                aria-disabled={!canConnect}
              >
                {isPending ? 'Connecting...' : `Connect ${connector.name}`}
              </button>
            );
          })}
        </div>
      )}

      {isConnected && !isOnBase && (
        <div className="flex flex-col items-center gap-3 text-center">
          <p className="text-sm text-yellow-300">
            Switch to Base Mainnet.
          </p>
          <button
            type="button"
            className="btn-primary"
            onClick={() => disconnect()}
          >
            Disconnect
          </button>
        </div>
      )}

      <div className="text-xs text-gray-500 text-center">
        Base mainnet only
      </div>
    </div>
  );
}
