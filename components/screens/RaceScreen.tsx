'use client';

import { useEffect, useMemo, useState } from 'react';
import { useAccount, useChainId, useSendTransaction, useSwitchChain } from 'wagmi';
import type { Address } from 'viem';
import { base } from 'viem/chains';
import { waitForTransactionReceipt } from 'wagmi/actions';
import { wagmiConfig } from '@/lib/wagmi/config';
import { useAppStore } from '@/store/app-store';
import { useGameStore } from '@/store/game-store';
import { useRaceStore } from '@/store/race-store';
import Button from '@/components/ui/Button';

const RECEIVER_ADDRESS =
  '0xdA5043637A9505A9daA85c86fEE7D8D463307698' as Address;
const USD_PRICE = 1;

export default function RaceScreen() {
  const { address, isConnected } = useAccount();
  const chainId = useChainId();
  const { switchChainAsync } = useSwitchChain();
  const { sendTransactionAsync } = useSendTransaction();
  const { setScreen } = useAppStore();
  const { setMode, startRace, startGame } = useGameStore();
  const { entries } = useRaceStore();

  const [ethUsd, setEthUsd] = useState<number | null>(null);
  const [priceWarning, setPriceWarning] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isPaying, setIsPaying] = useState(false);

  const isOnBase = chainId === base.id;

  useEffect(() => {
    let mounted = true;
    const fetchPrice = async () => {
      try {
        const response = await fetch('https://api.coinbase.com/v2/prices/ETH-USD/spot');
        if (!response.ok) {
          throw new Error('Price fetch failed');
        }
        const data = (await response.json()) as { data: { amount: string } };
        const amount = Number(data.data.amount);
        if (!Number.isFinite(amount)) {
          throw new Error('Invalid price');
        }
        if (mounted) {
          setEthUsd(amount);
          setPriceWarning(null);
        }
      } catch (error) {
        if (mounted) {
          setEthUsd(3000);
          setPriceWarning('Using fallback price.');
        }
      }
    };

    void fetchPrice();
    return () => {
      mounted = false;
    };
  }, []);

  const weiValue = useMemo(() => {
    if (!ethUsd || ethUsd <= 0) return 1n;
    const ethAmount = USD_PRICE / ethUsd;
    const wei = BigInt(Math.floor(ethAmount * 1e18));
    return wei > 0n ? wei : 1n;
  }, [ethUsd]);

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

    if (!ethUsd) {
      setStatusMessage('Pricing…');
      return;
    }

    if (!sendTransactionAsync) {
      setErrorMessage('Wallet not ready.');
      return;
    }

    setIsPaying(true);
    setStatusMessage('Confirm in wallet…');

    try {
      const hash = await sendTransactionAsync({
        to: RECEIVER_ADDRESS,
        value: weiValue,
      });
      setStatusMessage('Sending…');
      await waitForTransactionReceipt(wagmiConfig, { hash });
      setStatusMessage('Success');
      setMode('race');
      startRace();
      startGame();
      setScreen('playing');
    } catch (error) {
      console.error('Race payment failed', error);
      setErrorMessage('Payment failed.');
      setStatusMessage(null);
    } finally {
      setIsPaying(false);
    }
  };

  return (
    <div className="flex flex-col items-center h-full gap-4 py-2 overflow-y-auto">
      <h2 className="text-2xl font-bold text-blue-500">RACE (30 LEVELS)</h2>
      <div className="panel w-full max-w-sm text-center text-sm text-gray-400">
        {priceWarning ? priceWarning : 'Pricing live via Coinbase.'}
      </div>
      <Button onClick={handleStartRace} variant="primary" disabled={isPaying || !isOnBase}>
        {isPaying ? 'Processing…' : 'Pay $1 & Start'}
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
