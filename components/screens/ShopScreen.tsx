'use client';

import { useEffect, useMemo, useState } from 'react';
import { useAccount, useChainId, useSendTransaction } from 'wagmi';
import type { Address } from 'viem';
import { useAppStore } from '@/store/app-store';
import Button from '@/components/ui/Button';
import { base } from 'viem/chains';
import { waitForTransactionReceipt } from 'wagmi/actions';
import { wagmiConfig } from '@/lib/wagmi/config';

type ShopSkin = {
  id: number;
  name: string;
};

const SKINS: ShopSkin[] = [
  { id: 1, name: 'Classic' },
  { id: 2, name: 'Neon' },
  { id: 3, name: 'Matrix' },
];

const RECEIVER_ADDRESS =
  '0xdA5043637A9505A9daA85c86fEE7D8D463307698' as Address;
const USD_PRICE = 0.001;

export default function ShopScreen() {
  const { address, isConnected } = useAccount();
  const chainId = useChainId();
  const { sendTransactionAsync } = useSendTransaction();
  const { setScreen, ownedSkins, addOwnedSkin } = useAppStore();
  const [ethUsd, setEthUsd] = useState<number | null>(null);
  const [priceWarning, setPriceWarning] = useState<string | null>(null);
  const [activePurchase, setActivePurchase] = useState<number | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const isOnBase = chainId === base.id;

  useEffect(() => {
    let isMounted = true;

    const fetchPrice = async () => {
      try {
        const response = await fetch('https://api.coinbase.com/v2/prices/ETH-USD/spot');
        if (!response.ok) {
          throw new Error('Price fetch failed');
        }
        const data = (await response.json()) as {
          data: { amount: string };
        };
        const amount = Number(data.data.amount);
        if (Number.isFinite(amount)) {
          if (isMounted) {
            setEthUsd(amount);
            setPriceWarning(null);
          }
          return;
        }
        throw new Error('Invalid price');
      } catch (error) {
        if (isMounted) {
          setEthUsd(3000);
          setPriceWarning('Using fallback price.');
        }
      }
    };

    void fetchPrice();

    return () => {
      isMounted = false;
    };
  }, []);

  const weiValue = useMemo(() => {
    if (!ethUsd || ethUsd <= 0) return 1n;
    const ethAmount = USD_PRICE / ethUsd;
    const wei = BigInt(Math.floor(ethAmount * 1e18));
    return wei > 0n ? wei : 1n;
  }, [ethUsd]);

  const handlePurchase = async (skinId: number) => {
    if (!isConnected || !address) {
      setErrorMessage('Connect your wallet first.');
      return;
    }

    if (!isOnBase) {
      setErrorMessage('Base mainnet only.');
      return;
    }

    if (!ethUsd) {
      setStatusMessage('Pricing…');
      return;
    }

    if (!sendTransactionAsync) {
      setErrorMessage('Wallet not ready.');
      return;
    }

    setActivePurchase(skinId);
    setErrorMessage(null);
    setStatusMessage('Confirm in wallet…');

    try {
      const hash = await sendTransactionAsync({
        to: RECEIVER_ADDRESS,
        value: weiValue,
      });
      setStatusMessage('Sending…');
      await waitForTransactionReceipt(wagmiConfig, { hash });
      addOwnedSkin('fields', skinId);
      setStatusMessage('Success');
    } catch (error) {
      console.error('Purchase failed', error);
      setErrorMessage('Transaction rejected.');
      setStatusMessage(null);
    } finally {
      setActivePurchase(null);
    }
  };

  const ownedIds = ownedSkins.fields;
  return (
    <div className="flex flex-col items-center h-full gap-4 py-2 overflow-y-auto">
      <h2 className="text-2xl font-bold text-blue-500">SHOP</h2>
      <div className="panel w-full max-w-sm text-center text-sm text-gray-400">
        {priceWarning ? priceWarning : 'Pricing live via Coinbase.'}
      </div>

      <div className="flex w-full max-w-sm flex-col gap-3">
        {SKINS.map((skin) => {
          const isOwned = ownedIds.includes(skin.id);
          const isBusy = activePurchase === skin.id;
          const disabled = !isOnBase || !ethUsd || isBusy || isOwned;

          return (
            <div key={skin.id} className="panel flex items-center justify-between gap-3">
              <div>
                <div className="text-sm font-semibold text-blue-200">{skin.name}</div>
                <div className="text-xs text-gray-500">${USD_PRICE.toFixed(3)} USD</div>
              </div>
              <button
                type="button"
                className="btn-primary px-4 py-2 text-xs disabled:opacity-60"
                onClick={() => handlePurchase(skin.id)}
                disabled={disabled}
              >
                {isOwned ? 'Owned' : isBusy ? 'Sending…' : 'Buy'}
              </button>
            </div>
          );
        })}
      </div>

      {statusMessage && <div className="text-xs text-blue-300">{statusMessage}</div>}
      {errorMessage && <div className="text-xs text-red-400">{errorMessage}</div>}

      <Button onClick={() => setScreen('menu')} variant="secondary">
        BACK
      </Button>
    </div>
  );
}
