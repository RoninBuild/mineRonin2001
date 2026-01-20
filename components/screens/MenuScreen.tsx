'use client';

import { useAppStore } from '@/store/app-store';
import Button from '@/components/ui/Button';

export default function MenuScreen() {
  const { setScreen, coins } = useAppStore();

  return (
    <div className="flex flex-col items-center justify-center h-full gap-6 px-6">
      <h2 className="text-3xl font-bold text-blue-500">MAIN MENU</h2>

      <div className="flex flex-col gap-3 w-full max-w-xs">
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
      </div>

      <div className="panel px-4 py-2 mt-4">
        <span className="text-yellow-400 font-medium">💰 {coins} COINS</span>
      </div>
    </div>
  );
}
