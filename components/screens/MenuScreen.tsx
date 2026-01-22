'use client';

import { useAccount, useDisconnect } from 'wagmi';
import { useAppStore } from '@/store/app-store';
import Button from '@/components/ui/Button';

export default function MenuScreen() {
  const { setScreen, coins } = useAppStore();
  const { address } = useAccount();
  const { disconnect } = useDisconnect();
  const shortAddress = address ? `${address.slice(0, 6)}...${address.slice(-4)}` : '—';

  return (
    <div className="flex flex-col items-center h-full gap-6 px-6">
      <div className="w-full max-w-xs">
        <div className="flex items-center justify-between rounded-2xl border border-base-border bg-base-panel px-4 py-3">
          <div>
            <div className="text-xs text-blue-300">MINE RONIN</div>
            <div className="text-xs text-gray-400">{shortAddress}</div>
          </div>
          <div className="flex flex-col items-end gap-2">
            <div className="h-8 w-12 overflow-hidden rounded-lg border border-base-border bg-black/30">
              <img src="/logo-square.png" alt="Mine Ronin" className="h-full w-full object-contain" />
            </div>
            <button
              type="button"
              onClick={() => disconnect()}
              className="text-[10px] text-red-300"
            >
              Disconnect
            </button>
          </div>
        </div>
      </div>

      <div className="flex flex-col items-center gap-4 w-full max-w-xs">
        <img
          src="/logo-horizontal.png"
          alt="Mine Ronin"
          className="w-full max-w-xs object-contain"
        />
        <div className="flex flex-col gap-3 w-full">
          <Button onClick={() => setScreen('difficulty')} variant="primary">
            PLAY
          </Button>
          <Button onClick={() => setScreen('challenge')} variant="secondary">
            CHALLENGE
          </Button>
          <Button onClick={() => setScreen('shop')} variant="primary">
            SHOP
          </Button>
          <Button onClick={() => setScreen('stats')} variant="primary">
            STATS
          </Button>
          <Button onClick={() => setScreen('race')} variant="secondary">
            RACE (30 LEVELS)
          </Button>
        </div>
      </div>

      <div className="panel px-4 py-2 mt-4">
        <span className="text-yellow-400 font-medium">💰 {coins} COINS</span>
      </div>
    </div>
  );
}
