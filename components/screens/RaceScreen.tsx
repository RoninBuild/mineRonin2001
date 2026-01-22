'use client';

import { useState } from 'react';
import { useAccount, useChainId, useSwitchChain } from 'wagmi';
import { base } from 'viem/chains';
import { waitForTransactionReceipt, writeContract } from 'wagmi/actions';
import { wagmiConfig } from '@/lib/wagmi/config';
import { useAppStore } from '@/store/app-store';
import { useGameStore } from '@/store/game-store';
import { useRaceStore } from '@/store/race-store';
import { startOnchainGame } from '@/lib/onchain/game';
import { GAME_ADDRESS } from '@/lib/onchain/addresses';
import { USDC_BASE_ADDRESS } from '@/lib/onchain/tokens';
import { ERC20_ABI } from '@/lib/onchain/abi/erc20';
import Button from '@/components/ui/Button';

const USDC_TRANSFER_AMOUNT = 10_000n;

export default function RaceScreen() {
  const { address, isConnected } = useAccount();
  const chainId = useChainId();
  const { switchChainAsync } = useSwitchChain();
  const { setScreen } = useAppStore();
  const { setMode, startRace, startGame, setCurrentGameId } = useGameStore();
  const { entries } = useRaceStore();

  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isPaying, setIsPaying] = useState(false);

  const isOnBase = chainId === base.id;

  const topEntries = entries.slice(0, 10);

  const handleStartRace = async () => {
    setErrorMessage(null);
    setStatusMessage(null);

    if (!isConnected || !address) {
      setErrorMessage('Connect your wallet first.');
      return;
    }

    if (!isOnBase) {
      if (switchChainAsync) {
        try {
          await switchChainAsync({ chainId: base.id });
        } catch (error) {
          setErrorMessage('Base mainnet only.');
          return;
        }
      } else {
        setErrorMessage('Base mainnet only.');
        return;
      }
    }

    setIsPaying(true);
    setStatusMessage('Awaiting approval');

    try {
      const hash = await writeContract(wagmiConfig, {
        address: USDC_BASE_ADDRESS,
        abi: ERC20_ABI,
        functionName: 'transfer',
        args: [GAME_ADDRESS, USDC_TRANSFER_AMOUNT] as const,
      });
      setStatusMessage('Pending');
      await waitForTransactionReceipt(wagmiConfig, { hash });
      setStatusMessage('Success');

      const { gameId } = await startOnchainGame(3);
      if (gameId === null) {
        setErrorMessage('Unable to read game ID from chain.');
        setStatusMessage('Error');
        return;
      }
      setCurrentGameId(gameId);
      setMode('race');
      startRace();
      startGame();
      setScreen('playing');
    } catch (error) {
      console.error('Race payment failed', error);
      setErrorMessage('Payment failed.');
      setStatusMessage('Error');
    } finally {
      setIsPaying(false);
    }
  };

  return (
    <div className="flex flex-col items-center h-full gap-4 py-2 overflow-y-auto">
      <h2 className="text-2xl font-bold text-blue-500">RACE (30 LEVELS)</h2>
      <div className="panel w-full max-w-sm text-center text-sm text-gray-400">
        Entry: 0.01 USDC
      </div>
      <Button onClick={handleStartRace} variant="primary" disabled={isPaying || !isOnBase}>
        {isPaying ? 'Processing…' : 'Pay 0.01 USDC & Start'}
      </Button>
      {statusMessage && <div className="text-xs text-blue-300">{statusMessage}</div>}
      {errorMessage && <div className="text-xs text-red-400">{errorMessage}</div>}

      <div className="panel w-full max-w-sm">
        <div className="text-xs text-gray-400 mb-2">Top 10</div>
        {topEntries.length === 0 ? (
          <div className="text-xs text-gray-500">No runs yet.</div>
        ) : (
          <div className="space-y-2 text-xs">
            {topEntries.map((entry, index) => (
              <div key={`${entry.address}-${entry.date}`} className="flex justify-between">
                <span className="text-gray-500">#{index + 1}</span>
                <span className="text-blue-200">
                  {entry.address.slice(0, 6)}...{entry.address.slice(-4)}
                </span>
                <span className="text-yellow-300">{entry.timeSeconds}s</span>
              </div>
            ))}
          </div>
        )}
      </div>

      <Button onClick={() => setScreen('menu')} variant="secondary">
        BACK
      </Button>
    </div>
  );
}
