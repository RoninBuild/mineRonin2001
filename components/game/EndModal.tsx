'use client';

import { useAppStore } from '@/store/app-store';
import { shareResult } from '@/lib/share';
import { logEvent } from '@/lib/db/analytics';
import { useAccount } from 'wagmi';

type EndModalProps = {
  won: boolean;
  difficulty: string;
  timeSeconds: number;
  onClose: () => void;
};

export default function EndModal({
  won,
  difficulty,
  timeSeconds,
  onClose,
}: EndModalProps) {
  const { address } = useAccount();
  const { coins } = useAppStore();

  const handleShare = () => {
    shareResult(won, difficulty, timeSeconds);
    if (address) {
      logEvent('share_result', address, { difficulty, time: timeSeconds });
    }
  };

  return (
    <div className="absolute inset-0 flex items-center justify-center bg-black/90 z-50 p-4">
      <div className="panel p-6 max-w-sm w-full">
        <h2
          className={`text-3xl font-bold mb-4 text-center ${
            won ? 'text-green-500' : 'text-red-500'
          }`}
        >
          {won ? 'VICTORY!' : 'GAME OVER'}
        </h2>

        <div className="space-y-3 mb-6 text-sm">
          <div className="flex justify-between text-gray-300">
            <span>Difficulty:</span>
            <span className="font-bold">{difficulty.toUpperCase()}</span>
          </div>
          <div className="flex justify-between text-gray-300">
            <span>Time:</span>
            <span className="font-bold">{timeSeconds}s</span>
          </div>
          {won && (
            <div className="flex justify-between text-yellow-400">
              <span>Total Coins:</span>
              <span className="font-bold">💰 {coins}</span>
            </div>
          )}
        </div>

        <div className="flex flex-col gap-2">
          {won && (
            <button onClick={handleShare} className="btn-primary text-sm">
              SHARE RESULT
            </button>
          )}
          <button
            onClick={() => {
              onClose();
              useAppStore.getState().setScreen('difficulty');
            }}
            className="btn-primary text-sm"
          >
            PLAY AGAIN
          </button>
          <button onClick={onClose} className="btn-secondary text-sm">
            MAIN MENU
          </button>
        </div>
      </div>
    </div>
  );
}
